-- Trending search log
CREATE TABLE public.search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  city TEXT,
  language TEXT DEFAULT 'en',
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_queries_created_at ON public.search_queries(created_at DESC);
CREATE INDEX idx_search_queries_query_lower ON public.search_queries((lower(query)));

ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- Anyone can log a search (anonymous and authenticated)
CREATE POLICY "Anyone can log a search"
ON public.search_queries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  query IS NOT NULL
  AND length(query) BETWEEN 1 AND 200
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- Only admins can read raw search log entries
CREATE POLICY "Admins can read search queries"
ON public.search_queries
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));