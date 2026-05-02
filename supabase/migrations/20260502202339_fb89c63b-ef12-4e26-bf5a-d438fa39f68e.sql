-- 1. Columns
ALTER TABLE public.search_queries
  ADD COLUMN IF NOT EXISTS normalized_query TEXT;

ALTER TABLE public.search_queries
  ADD COLUMN IF NOT EXISTS dedupe_bucket BIGINT;

-- 2. Normalization function
CREATE OR REPLACE FUNCTION public.normalize_search_query(q TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  s TEXT;
BEGIN
  IF q IS NULL THEN RETURN NULL; END IF;
  s := lower(q);
  s := regexp_replace(s, '[^[:alnum:]\u0600-\u06FF]+', ' ', 'g');
  s := regexp_replace(s, '\m(the|a|an|in|at|on|near|best|top|to|of|for)\M', ' ', 'g');
  s := regexp_replace(s, '\s+', ' ', 'g');
  s := btrim(s);
  IF length(s) = 0 THEN RETURN NULL; END IF;
  RETURN s;
END;
$$;

-- 3. Trigger sets normalized_query and dedupe_bucket
CREATE OR REPLACE FUNCTION public.set_search_query_dedupe_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.normalized_query := public.normalize_search_query(NEW.query);
  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;
  NEW.dedupe_bucket := (EXTRACT(EPOCH FROM NEW.created_at)::BIGINT / 600);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_normalized_search_query ON public.search_queries;
DROP TRIGGER IF EXISTS trg_set_search_query_dedupe_fields ON public.search_queries;
CREATE TRIGGER trg_set_search_query_dedupe_fields
  BEFORE INSERT OR UPDATE OF query, created_at ON public.search_queries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_search_query_dedupe_fields();

-- 4. Backfill
UPDATE public.search_queries
SET
  normalized_query = public.normalize_search_query(query),
  dedupe_bucket    = (EXTRACT(EPOCH FROM created_at)::BIGINT / 600)
WHERE normalized_query IS NULL OR dedupe_bucket IS NULL;

-- 5. Unique index: one row per (user-or-anon, normalized, 10-min bucket)
CREATE UNIQUE INDEX IF NOT EXISTS search_queries_dedupe_idx
  ON public.search_queries (
    COALESCE(user_id::text, 'anon'),
    normalized_query,
    dedupe_bucket
  )
  WHERE normalized_query IS NOT NULL;

-- 6. Aggregation index
CREATE INDEX IF NOT EXISTS search_queries_normalized_created_idx
  ON public.search_queries (normalized_query, created_at DESC)
  WHERE normalized_query IS NOT NULL;