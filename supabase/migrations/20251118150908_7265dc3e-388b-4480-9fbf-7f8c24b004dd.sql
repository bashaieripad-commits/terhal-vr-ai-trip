-- Create flights table
CREATE TABLE public.flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number TEXT UNIQUE NOT NULL,
  airline TEXT NOT NULL,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  total_seats INTEGER NOT NULL DEFAULT 180,
  available_seats INTEGER NOT NULL DEFAULT 180,
  aircraft_type TEXT DEFAULT 'Boeing 737',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled')),
  gate TEXT,
  terminal TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

-- Create seats table
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id UUID REFERENCES public.flights(id) ON DELETE CASCADE NOT NULL,
  seat_number TEXT NOT NULL,
  seat_class TEXT NOT NULL CHECK (seat_class IN ('economy', 'business', 'first')),
  seat_row INTEGER NOT NULL,
  seat_column TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_window BOOLEAN DEFAULT false,
  is_aisle BOOLEAN DEFAULT false,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  reserved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(flight_id, seat_number)
);

ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for flights
CREATE POLICY "Anyone can view scheduled flights"
  ON public.flights FOR SELECT
  USING (status = 'scheduled' OR status = 'boarding');

CREATE POLICY "Admins can view all flights"
  ON public.flights FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage flights"
  ON public.flights FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for seats
CREATE POLICY "Anyone can view available seats"
  ON public.seats FOR SELECT
  USING (is_available = true);

CREATE POLICY "Users can view their reserved seats"
  ON public.seats FOR SELECT
  USING (auth.uid() = reserved_by);

CREATE POLICY "Users can reserve seats"
  ON public.seats FOR UPDATE
  USING (auth.uid() IS NOT NULL AND is_available = true);

CREATE POLICY "Admins can view all seats"
  ON public.seats FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage seats"
  ON public.seats FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to generate seats for a flight
CREATE OR REPLACE FUNCTION public.generate_flight_seats(
  p_flight_id UUID,
  p_aircraft_type TEXT DEFAULT 'Boeing 737'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row INTEGER;
  v_col TEXT;
  v_seat_class TEXT;
  v_is_window BOOLEAN;
  v_is_aisle BOOLEAN;
  v_price_mod DECIMAL(10,2);
BEGIN
  -- Delete existing seats for this flight
  DELETE FROM public.seats WHERE flight_id = p_flight_id;
  
  -- Generate seats based on aircraft type
  -- Boeing 737: Rows 1-5 First Class, Rows 6-15 Business, Rows 16-30 Economy
  FOR v_row IN 1..30 LOOP
    FOR v_col IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) LOOP
      
      -- Determine seat class and price modifier
      IF v_row <= 5 THEN
        v_seat_class := 'first';
        v_price_mod := 500.00;
      ELSIF v_row <= 15 THEN
        v_seat_class := 'business';
        v_price_mod := 200.00;
      ELSE
        v_seat_class := 'economy';
        v_price_mod := 0.00;
      END IF;
      
      -- Determine window and aisle seats
      v_is_window := v_col IN ('A', 'F');
      v_is_aisle := v_col IN ('C', 'D');
      
      -- Add extra for window/aisle in economy
      IF v_seat_class = 'economy' AND (v_is_window OR v_is_aisle) THEN
        v_price_mod := v_price_mod + 20.00;
      END IF;
      
      -- Insert seat
      INSERT INTO public.seats (
        flight_id,
        seat_number,
        seat_class,
        seat_row,
        seat_column,
        is_window,
        is_aisle,
        price_modifier
      ) VALUES (
        p_flight_id,
        v_row || v_col,
        v_seat_class,
        v_row,
        v_col,
        v_is_window,
        v_is_aisle,
        v_price_mod
      );
      
    END LOOP;
  END LOOP;
END;
$$;

-- Trigger to auto-generate seats when flight is created
CREATE OR REPLACE FUNCTION public.auto_generate_seats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.generate_flight_seats(NEW.id, NEW.aircraft_type);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_flight_created
  AFTER INSERT ON public.flights
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_seats();

-- Trigger for updating flights updated_at
CREATE TRIGGER update_flights_updated_at
  BEFORE UPDATE ON public.flights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seats_updated_at
  BEFORE UPDATE ON public.seats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();