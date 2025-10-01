/*
  # User Settings & API Keys Management
  
  This migration creates comprehensive user settings and API key management infrastructure.
  
  ## New Tables
  
  1. **user_settings**
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key to auth.users)
     - `theme` (text) - UI theme preference
     - `language` (text) - Preferred language
     - `timezone` (text) - User timezone
     - `notifications_enabled` (boolean) - Master notification toggle
     - `email_notifications` (boolean) - Email notification preference
     - `notification_frequency` (text) - How often to send notifications
     - `ai_model_preference` (text) - Preferred AI model
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)
  
  2. **api_keys**
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key to auth.users)
     - `provider` (text) - API provider name (openai, anthropic, dataforseo, firecrawl, etc.)
     - `key_name` (text) - User-friendly name for the key
     - `encrypted_key` (text) - Encrypted API key
     - `is_active` (boolean) - Whether this key should be used
     - `usage_count` (integer) - Number of times used
     - `last_used_at` (timestamptz) - Last usage timestamp
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)
  
  3. **api_usage_logs**
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key to auth.users)
     - `api_key_id` (uuid, foreign key to api_keys)
     - `provider` (text) - API provider
     - `endpoint` (text) - API endpoint called
     - `tokens_used` (integer) - Tokens/credits consumed
     - `cost` (numeric) - Estimated cost
     - `success` (boolean) - Whether call succeeded
     - `error_message` (text) - Error if failed
     - `created_at` (timestamptz)
  
  4. **ai_recommendations**
     - `id` (uuid, primary key)
     - `project_id` (uuid, foreign key to seo_projects)
     - `user_id` (uuid, foreign key to auth.users)
     - `recommendation_type` (text) - Type of recommendation
     - `title` (text) - Recommendation title
     - `description` (text) - Detailed description
     - `priority` (text) - high, medium, low
     - `confidence_score` (numeric) - AI confidence 0-1
     - `impact_estimate` (text) - Expected impact
     - `status` (text) - pending, accepted, rejected, completed
     - `metadata` (jsonb) - Additional data
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)
  
  5. **chatbot_conversations**
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key to auth.users)
     - `session_id` (text) - Conversation session identifier
     - `messages` (jsonb) - Array of conversation messages
     - `context` (jsonb) - Conversation context and metadata
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - API keys are encrypted and require authenticated access
*/

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('realtime', 'hourly', 'daily', 'weekly')),
  ai_model_preference TEXT DEFAULT 'auto' CHECK (ai_model_preference IN ('auto', 'gpt-4', 'gpt-3.5', 'claude-3', 'gemini-pro')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'dataforseo', 'firecrawl', 'serp', 'custom')),
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, provider, key_name)
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
  ON public.api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON public.api_keys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON public.api_keys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON public.api_keys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create api_usage_logs table
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  endpoint TEXT,
  tokens_used INTEGER DEFAULT 0,
  cost NUMERIC(10, 4) DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API usage logs"
  ON public.api_usage_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API usage logs"
  ON public.api_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create ai_recommendations table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.seo_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('keyword', 'content', 'technical', 'backlink', 'competitor', 'performance')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  confidence_score NUMERIC(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  impact_estimate TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'dismissed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI recommendations"
  ON public.ai_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI recommendations"
  ON public.ai_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI recommendations"
  ON public.ai_recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI recommendations"
  ON public.ai_recommendations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create chatbot_conversations table
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  messages JSONB DEFAULT '[]' NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, session_id)
);

ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chatbot conversations"
  ON public.chatbot_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chatbot conversations"
  ON public.chatbot_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chatbot conversations"
  ON public.chatbot_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chatbot conversations"
  ON public.chatbot_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON public.api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON public.api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_project_id ON public.ai_recommendations(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON public.ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON public.ai_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id ON public.chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_id ON public.chatbot_conversations(session_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_settings_updated_at') THEN
    CREATE TRIGGER update_user_settings_updated_at
      BEFORE UPDATE ON public.user_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_api_keys_updated_at') THEN
    CREATE TRIGGER update_api_keys_updated_at
      BEFORE UPDATE ON public.api_keys
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ai_recommendations_updated_at') THEN
    CREATE TRIGGER update_ai_recommendations_updated_at
      BEFORE UPDATE ON public.ai_recommendations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_chatbot_conversations_updated_at') THEN
    CREATE TRIGGER update_chatbot_conversations_updated_at
      BEFORE UPDATE ON public.chatbot_conversations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;