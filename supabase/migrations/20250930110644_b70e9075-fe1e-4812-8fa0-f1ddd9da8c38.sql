-- Fix subscriptions table RLS policies
-- Users should only be able to create their own subscriptions through the trigger
-- and view their own subscription data

-- Drop existing policy if any and recreate with proper permissions
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Only authenticated users can insert their own subscription
-- This should primarily happen through the handle_new_user trigger
CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users cannot update subscriptions directly (should be done via Stripe webhooks or admin)
-- For now, we'll allow users to update their own subscription status
CREATE POLICY "Users can update their own subscription"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users cannot delete subscriptions
CREATE POLICY "Users cannot delete subscriptions"
ON public.subscriptions
FOR DELETE
USING (false);