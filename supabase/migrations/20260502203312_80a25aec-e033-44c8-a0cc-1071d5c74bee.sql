CREATE OR REPLACE FUNCTION public.admin_search_trends(
  p_from        TIMESTAMPTZ,
  p_to          TIMESTAMPTZ,
  p_city        TEXT,
  p_language    TEXT,
  p_search      TEXT,
  p_group_by    TEXT,
  p_limit       INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin   BOOLEAN;
  v_total      BIGINT;
  v_unique     BIGINT;
  v_truncated  BOOLEAN := false;
  v_cap        INT := GREATEST(1, LEAST(500, COALESCE(p_limit, 100)));
  v_search     TEXT := NULLIF(LOWER(BTRIM(COALESCE(p_search, ''))), '');
  v_rows       JSONB;
  v_cities     JSONB;
  v_languages  JSONB;
BEGIN
  -- Admin gate (defence in depth: edge function also checks)
  SELECT public.has_role(auth.uid(), 'admin'::app_role) INTO v_is_admin;
  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  -- Filtered base set materialised once
  CREATE TEMP TABLE _sq ON COMMIT DROP AS
  SELECT
    sq.query,
    sq.normalized_query,
    sq.city,
    sq.language,
    sq.created_at
  FROM public.search_queries sq
  WHERE sq.created_at >= p_from
    AND sq.created_at <= p_to
    AND sq.normalized_query IS NOT NULL
    AND (p_city     IS NULL OR sq.city     = p_city)
    AND (p_language IS NULL OR sq.language = p_language)
    AND (
      v_search IS NULL
      OR sq.normalized_query LIKE '%' || v_search || '%'
      OR LOWER(sq.query)     LIKE '%' || v_search || '%'
    );

  SELECT COUNT(*),
         COUNT(DISTINCT normalized_query)
    INTO v_total, v_unique
    FROM _sq;

  IF p_group_by = 'phrase' THEN
    -- Pick the most common original spelling per normalized phrase as the display
    WITH counts AS (
      SELECT normalized_query,
             COUNT(*)                              AS cnt,
             ARRAY_AGG(DISTINCT city)     FILTER (WHERE city     IS NOT NULL) AS cities,
             ARRAY_AGG(DISTINCT language) FILTER (WHERE language IS NOT NULL) AS languages,
             MAX(created_at)                       AS last_seen
        FROM _sq
       GROUP BY normalized_query
    ),
    display_pick AS (
      SELECT normalized_query, query AS display
        FROM (
          SELECT normalized_query,
                 query,
                 ROW_NUMBER() OVER (
                   PARTITION BY normalized_query
                   ORDER BY COUNT(*) DESC, MAX(created_at) DESC
                 ) AS rn
            FROM _sq
           GROUP BY normalized_query, query
        ) ranked
       WHERE rn = 1
    )
    SELECT COALESCE(JSONB_AGG(row_obj ORDER BY (row_obj->>'count')::BIGINT DESC), '[]'::JSONB)
      INTO v_rows
      FROM (
        SELECT JSONB_BUILD_OBJECT(
                 'normalized', c.normalized_query,
                 'display',    COALESCE(d.display, c.normalized_query),
                 'count',      c.cnt,
                 'cities',     COALESCE(TO_JSONB(c.cities),    '[]'::JSONB),
                 'languages',  COALESCE(TO_JSONB(c.languages), '[]'::JSONB),
                 'lastSeen',   c.last_seen
               ) AS row_obj
          FROM counts c
          LEFT JOIN display_pick d USING (normalized_query)
         ORDER BY c.cnt DESC, c.last_seen DESC
         LIMIT v_cap
      ) t;

    v_truncated := v_unique > v_cap;

  ELSIF p_group_by = 'day' THEN
    SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
              'key',   day_key,
              'label', day_key,
              'count', cnt
           ) ORDER BY day_key ASC), '[]'::JSONB)
      INTO v_rows
      FROM (
        SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS day_key,
               COUNT(*) AS cnt
          FROM _sq
         GROUP BY 1
         ORDER BY 1
      ) t;

  ELSIF p_group_by = 'city' THEN
    SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
              'key',   key_val,
              'label', label_val,
              'count', cnt
           ) ORDER BY cnt DESC), '[]'::JSONB)
      INTO v_rows
      FROM (
        SELECT COALESCE(city, '—')           AS key_val,
               COALESCE(city, '(unknown)')   AS label_val,
               COUNT(*)                      AS cnt
          FROM _sq
         GROUP BY 1, 2
         ORDER BY cnt DESC
         LIMIT v_cap
      ) t;

  ELSIF p_group_by = 'language' THEN
    SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
              'key',   key_val,
              'label', label_val,
              'count', cnt
           ) ORDER BY cnt DESC), '[]'::JSONB)
      INTO v_rows
      FROM (
        SELECT COALESCE(language, '—')                       AS key_val,
               UPPER(COALESCE(language, '(unknown)'))        AS label_val,
               COUNT(*)                                      AS cnt
          FROM _sq
         GROUP BY 1, 2
         ORDER BY cnt DESC
         LIMIT v_cap
      ) t;

  ELSE
    RAISE EXCEPTION 'invalid group_by: %', p_group_by;
  END IF;

  -- Distinct filter options (last 90d, ignore current filters so dropdowns are stable)
  SELECT COALESCE(JSONB_AGG(c ORDER BY c), '[]'::JSONB)
    INTO v_cities
    FROM (
      SELECT DISTINCT city AS c
        FROM public.search_queries
       WHERE city IS NOT NULL
         AND created_at >= now() - INTERVAL '90 days'
    ) s;

  SELECT COALESCE(JSONB_AGG(l ORDER BY l), '[]'::JSONB)
    INTO v_languages
    FROM (
      SELECT DISTINCT language AS l
        FROM public.search_queries
       WHERE language IS NOT NULL
         AND created_at >= now() - INTERVAL '90 days'
    ) s;

  RETURN JSONB_BUILD_OBJECT(
    'kpis', JSONB_BUILD_OBJECT(
      'total',         v_total,
      'uniquePhrases', v_unique,
      'truncated',     v_truncated
    ),
    'rows',    v_rows,
    'filters', JSONB_BUILD_OBJECT(
      'cities',    v_cities,
      'languages', v_languages
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_search_trends(TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_search_trends(TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, INT) TO authenticated;