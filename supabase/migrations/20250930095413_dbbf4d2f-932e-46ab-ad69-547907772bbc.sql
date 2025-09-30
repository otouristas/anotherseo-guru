-- Add credits column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN credits integer NOT NULL DEFAULT 20;

-- Update existing users to have 20 credits
UPDATE public.profiles SET credits = 20 WHERE credits = 0;

-- Add credit_costs table for platform pricing
CREATE TABLE public.credit_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE,
  cost integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert platform costs
INSERT INTO public.credit_costs (platform, cost) VALUES
  ('seo-blog', 3),
  ('medium', 2),
  ('linkedin', 2),
  ('reddit', 2),
  ('quora', 2),
  ('twitter', 1),
  ('instagram', 1),
  ('youtube', 2),
  ('newsletter', 2),
  ('tiktok', 1);

-- Enable RLS on credit_costs
ALTER TABLE public.credit_costs ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read credit costs
CREATE POLICY "Anyone can view credit costs"
  ON public.credit_costs
  FOR SELECT
  USING (true);

-- Update usage_tracking to track credits used
ALTER TABLE public.usage_tracking 
ADD COLUMN credits_used integer NOT NULL DEFAULT 0;

-- Create a function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(user_id_param uuid, credits_to_deduct integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits integer;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits
  FROM public.profiles
  WHERE id = user_id_param;
  
  -- Check if user has enough credits
  IF current_credits >= credits_to_deduct THEN
    -- Deduct credits
    UPDATE public.profiles
    SET credits = credits - credits_to_deduct
    WHERE id = user_id_param;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;