-- Create content history table to save generated content
CREATE TABLE IF NOT EXISTS public.content_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_content TEXT NOT NULL,
  platform TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  tone TEXT,
  style TEXT,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own content history" 
ON public.content_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content history" 
ON public.content_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content history" 
ON public.content_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_content_history_updated_at
BEFORE UPDATE ON public.content_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();