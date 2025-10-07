# Complete Database Deployment Guide

## Current Situation

The Supabase API is temporarily unavailable (eu-central-1 region). Once it's back online, follow this guide to set up your complete database.

## Your Supabase Project

- **Project URL**: https://0ec90b57d6e95fcbda19832f.supabase.co
- **Project Reference**: 0ec90b57d6e95fcbda19832f
- **Total Tables to Create**: 90+ tables
- **Total Migrations**: 24 migration files

## Step-by-Step Deployment

### Step 1: Access Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Log in to your Supabase account
3. Navigate to project: https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f

### Step 2: Apply All Migrations

You have 24 migration files that need to be applied in order. The easiest way is to apply the latest comprehensive migration that includes everything.

**Recommended: Apply the Complete Migration**

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New Query"**
3. Open the file: `supabase/migrations/20251007000000_complete_database_structure.sql`
4. Copy ALL contents (22,852 lines)
5. Paste into SQL Editor
6. Click **"Run"** or press Ctrl+Enter
7. Wait for completion (may take 30-60 seconds)

This single migration file will:
- Create all 90+ tables
- Add all indexes for performance
- Set up Row Level Security (RLS) policies
- Create utility functions
- Create database views

### Step 3: Verify Tables Were Created

1. Go to **Table Editor** in Supabase Dashboard
2. You should now see 90+ tables including:
   - profiles
   - seo_projects
   - keyword_analysis
   - serp_rankings
   - content_history
   - competitor_analysis
   - And 84+ more...

3. If you don't see all tables, check the SQL Editor logs for errors

### Step 4: Configure DataForSEO Credentials

For keyword research to work:

1. Go to **Settings** → **Edge Functions** → **Secrets**
2. Add these environment variables:
   ```
   DATAFORSEO_LOGIN = your_dataforseo_email@example.com
   DATAFORSEO_PASSWORD = your_dataforseo_password
   ```
3. Save and wait 1-2 minutes for changes to propagate

### Step 5: Test Your Application

1. **Test Authentication**:
   - Go to your app
   - Try creating a new account
   - Verify you can log in

2. **Test Keyword Research**:
   - Navigate to Keywords page
   - Enter a keyword (e.g., "digital marketing")
   - Click "Research"
   - You should see results with search volume, CPC, and competition

3. **Test Project Creation**:
   - Try creating a new SEO project
   - Add your website URL
   - Verify it saves successfully

4. **Check Data is Saving**:
   - Go to Supabase Dashboard → Table Editor
   - Check `profiles` table - should see your user
   - Check `seo_projects` table - should see your project
   - Check `keyword_analysis` table - should see keywords searched

## Alternative: Apply Migrations One by One

If the complete migration fails, apply them in order:

```sql
-- In Supabase SQL Editor, run these in order:

-- 1. API Settings
\i supabase/migrations/20250104000000_create_api_settings_tables.sql
\i supabase/migrations/20250104000002_add_sync_columns_to_google_api_settings.sql

-- 2. Core Tables (Sep 30, 2025)
\i supabase/migrations/20250930093258_73f3a368-39f9-4e52-ab57-33136ca4cbcc.sql
\i supabase/migrations/20250930095413_dbbf4d2f-932e-46ab-ad69-547907772bbc.sql
\i supabase/migrations/20250930104443_5e94af05-d007-4b95-8892-9a5ed717ee60.sql
\i supabase/migrations/20250930105018_a6f879f3-ce07-4554-ba0c-cd2c99068000.sql
\i supabase/migrations/20250930110644_b70e9075-fe1e-4812-8fa0-f1ddd9da8c38.sql
\i supabase/migrations/20250930110822_fec92e5b-18c4-43dd-a430-03e4a625fbde.sql
\i supabase/migrations/20250930122114_aaee1038-28a2-4d57-a16a-d9e037b10a17.sql
\i supabase/migrations/20250930125059_76ac1754-d5e2-4326-9770-f0ec0d074a3e.sql
\i supabase/migrations/20250930125347_93712e7f-bc00-4517-84c0-3f61d5fa2abf.sql
\i supabase/migrations/20250930125742_f629341a-2695-4480-81c7-689964732543.sql
\i supabase/migrations/20250930130432_d1aec4a1-5620-407c-a9f8-9dc2fae1d75c.sql
\i supabase/migrations/20250930131126_d4738700-d8f0-4bee-a5c4-bfc84b370215.sql
\i supabase/migrations/20250930131651_848b0f63-8bf0-4a75-ac03-eb6ace2940c1.sql
\i supabase/migrations/20250930145222_a2e5f503-1803-4a92-b631-847a2583b3f6.sql
\i supabase/migrations/20250930150007_59e56c81-be03-4d44-a31f-60c7d1382ca5.sql

-- 3. SEO Tables (Oct 1, 2025)
\i supabase/migrations/20251001120457_create_crawl_and_audit_tables.sql
\i supabase/migrations/20251001121413_create_remaining_seo_tables.sql
\i supabase/migrations/20251001124459_add_keyword_analysis_columns.sql
\i supabase/migrations/20251001125353_create_user_settings_and_api_keys.sql

-- 4. Advanced Features (Oct 2-3, 2025)
\i supabase/migrations/20251002105242_3574ee0f-5f28-4eab-bfb7-f111ef52a923.sql
\i supabase/migrations/20251002120000_create_seo_intelligence_tables.sql
\i supabase/migrations/20251003000000_create_internal_linking_tables.sql
\i supabase/migrations/20251003000001_create_comprehensive_seo_schema.sql

-- 5. Final Complete Structure (Oct 7, 2025)
\i supabase/migrations/20251007000000_complete_database_structure.sql
```

Note: You'll need to copy each file's contents and run them separately in SQL Editor.

## What Each Migration Does

### Core Migrations
- **20250104000000** - API settings tables for external integrations
- **20250930093258** - Initial profiles and projects
- **20250930095413** - Content repurposing
- **20250930104443** - Usage tracking
- **20250930105018** - Keyword and SERP tables
- **20250930110644** - Public research sessions
- **20250930110822** - Content calendar
- **20250930122114** - Jobs queue
- **20250930125059** - Credit costs
- **20250930125347** - Team collaboration
- **20250930125742** - AI recommendations
- **20250930130432** - Chatbot conversations
- **20250930131126** - Predictive analytics
- **20250930131651** - Competitor analysis

### Advanced Migrations
- **20251001120457** - Site crawling and auditing
- **20251001121413** - Complete SEO feature set
- **20251001124459** - Keyword analysis enhancements
- **20251001125353** - User settings and API keys
- **20251002105242** - Advanced analytics
- **20251002120000** - SEO intelligence features
- **20251003000000** - Internal linking analysis
- **20251003000001** - Comprehensive schema
- **20251007000000** - Complete database structure

## Troubleshooting

### Migration Fails with "Already Exists" Error

This is OK! It means some tables already exist. The migrations use `IF NOT EXISTS` so they should skip existing tables.

### Migration Fails with Permission Error

Make sure you're logged in as the project owner or have admin access.

### Some Tables Are Missing

Run the complete migration again: `20251007000000_complete_database_structure.sql`

### Can't Find Migration Files

All migration files are in: `supabase/migrations/` directory

## Quick Deployment Checklist

- [ ] Access Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Run complete migration: `20251007000000_complete_database_structure.sql`
- [ ] Verify 90+ tables exist in Table Editor
- [ ] Add DataForSEO credentials in Edge Functions Secrets
- [ ] Test authentication (create account)
- [ ] Test keyword research
- [ ] Test project creation
- [ ] Verify data is being saved

## After Deployment

Once everything is set up:

1. **Monitor Edge Functions**: Check logs for any errors
2. **Check API Usage**: Monitor DataForSEO credit usage
3. **Test All Features**: Go through each feature to ensure it works
4. **Set Up Monitoring**: Enable Supabase monitoring and alerts

## Need Help?

Check these resources:
- `DATABASE_IMPLEMENTATION_SUMMARY.md` - Complete database documentation
- `EDGE_FUNCTIONS_DATABASE_MAPPING.md` - How edge functions use the database
- `DATAFORSEO_SETUP.md` - DataForSEO configuration guide
- `DATABASE_ACCESS_GUIDE.md` - How to access Supabase

## Status Check

After deployment, verify:
- ✅ 90+ tables exist
- ✅ RLS policies enabled on all tables
- ✅ Indexes created for performance
- ✅ Utility functions available
- ✅ Edge functions can access database
- ✅ Authentication working
- ✅ DataForSEO returning results

Your SEO platform will be fully operational!
