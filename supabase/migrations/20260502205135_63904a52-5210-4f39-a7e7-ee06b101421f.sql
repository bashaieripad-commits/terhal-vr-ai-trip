-- Per-user recent search suggestions, used to keep "For you" picks
-- in sync across devices when the user is signed in.
CREATE TABLE IF NOT EXISTS public.user_recent_searches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language    TEXT NOT NULL CHECK (length(language) BETWEEN 2 AND 10),
  term        TEXT NOT NULL CHECK (length(btrim(term)) BETWEEN 1 AND 200),
  term_lower  TEXT GENERATED ALWAYS AS (lower(btrim(term))) STORED,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_recent_searches_unique UNIQUE (user_id, language, term_lower)
);

CREATE INDEX IF NOT EXISTS user_recent_searches_user_lang_recent_idx
  ON public.user_recent_searches (user_id, language, updated_at DESC);

ALTER TABLE public.user_recent_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recents"
  ON public.user_recent_searches
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recents"
  ON public.user_recent_searches
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recents"
  ON public.user_recent_searches
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recents"
  ON public.user_recent_searches
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Keep updated_at fresh.
CREATE TRIGGER user_recent_searches_set_updated_at
  BEFORE UPDATE ON public.user_recent_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Cap each user to the last 6 recents per language.
CREATE OR REPLACE FUNCTION public.trim_user_recent_searches()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_recent_searches r
   WHERE r.user_id = NEW.user_id
     AND r.language = NEW.language
     AND r.id NOT IN (
       SELECT id
         FROM public.user_recent_searches
        WHERE user_id = NEW.user_id
          AND language = NEW.language
        ORDER BY updated_at DESC
        LIMIT 6
     );
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_recent_searches_trim
  AFTER INSERT OR UPDATE ON public.user_recent_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.trim_user_recent_searches();