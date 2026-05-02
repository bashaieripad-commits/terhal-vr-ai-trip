
-- 1) Extend reviews table
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS reservation_id uuid,
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS report_count integer NOT NULL DEFAULT 0;

-- Rating range guard via trigger (avoid CHECK constraint per guidelines)
CREATE OR REPLACE FUNCTION public.validate_review()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.rating IS NULL OR NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  -- Enforce verified booking + one review per (user, item)
  IF TG_OP = 'INSERT' THEN
    IF NEW.reservation_id IS NULL THEN
      RAISE EXCEPTION 'A confirmed booking is required to post a review';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.id = NEW.reservation_id
        AND r.user_id = NEW.user_id
        AND r.status IN ('confirmed','completed')
        AND r.type = NEW.item_type
    ) THEN
      RAISE EXCEPTION 'No matching confirmed booking for this user and item type';
    END IF;

    NEW.is_verified := true;

    IF EXISTS (
      SELECT 1 FROM public.reviews x
      WHERE x.user_id = NEW.user_id
        AND x.item_id = NEW.item_id
        AND x.item_type = NEW.item_type
    ) THEN
      RAISE EXCEPTION 'You have already reviewed this item';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_review ON public.reviews;
CREATE TRIGGER trg_validate_review
BEFORE INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.validate_review();

-- Allow users to update / delete their own reviews
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Public visibility: hide reported/hidden reviews from non-owners
DROP POLICY IF EXISTS "Users can view approved reviews" ON public.reviews;
CREATE POLICY "Users can view approved reviews"
  ON public.reviews FOR SELECT
  USING (((is_approved = true) AND (is_hidden = false)) OR (auth.uid() = user_id));

-- 2) review_reports table
CREATE TABLE IF NOT EXISTS public.review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own reports"
  ON public.review_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports"
  ON public.review_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports"
  ON public.review_reports FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete reports"
  ON public.review_reports FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger: bump report_count + auto-hide after 3 reports
CREATE OR REPLACE FUNCTION public.handle_review_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count FROM public.review_reports WHERE review_id = NEW.review_id;
  UPDATE public.reviews
     SET report_count = v_count,
         is_hidden = (v_count >= 3)
   WHERE id = NEW.review_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_review_report ON public.review_reports;
CREATE TRIGGER trg_review_report
AFTER INSERT ON public.review_reports
FOR EACH ROW EXECUTE FUNCTION public.handle_review_report();

-- updated_at trigger for reviews if missing
DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
