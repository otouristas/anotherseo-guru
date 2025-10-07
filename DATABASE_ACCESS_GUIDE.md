# How to Access Your Supabase Database

## Important: You're Using Supabase, Not Bolt Database

Your project is configured to use **Supabase** as the database backend, not Bolt's built-in database. That's why you see "Ask Bolt to start your database" - Bolt is telling you it doesn't have a database for this project because you're using Supabase instead.

## Your Supabase Database Details

**Supabase Project URL**: https://0ec90b57d6e95fcbda19832f.supabase.co

**Project Reference**: 0ec90b57d6e95fcbda19832f

## How to Access Your Database

### Method 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard
   - Or direct link: https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f

2. **Log in with your Supabase account**:
   - If you don't have the login, check your email for Supabase invitation
   - Or create a new Supabase account and link this project

3. **Navigate to Table Editor**:
   - Click on "Table Editor" in the left sidebar
   - You'll see all 90+ tables created for your SEO platform

4. **Navigate to SQL Editor**:
   - Click on "SQL Editor" in the left sidebar
   - Here you can run SQL queries and apply migrations

### Method 2: Apply Migration via SQL Editor

If your tables don't exist yet, you need to apply the migration:

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy the contents of: `supabase/migrations/20251007000000_complete_database_structure.sql`
4. Paste into the SQL Editor
5. Click "Run" or press Ctrl+Enter

### Method 3: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref 0ec90b57d6e95fcbda19832f

# Push migrations
supabase db push

# View tables
supabase db list
```

## What Tables Should You See?

Once migrations are applied, you should see 90+ tables including:

### Core Tables
- profiles
- seo_projects
- subscriptions
- usage_tracking
- api_keys

### Keyword Tables
- keyword_analysis
- keyword_tracking
- keyword_clusters
- keyword_opportunities
- serp_rankings

### Content Tables
- content_history
- content_calendar
- content_scores

### And 80+ more tables for all SEO features

## Verifying Your Database Setup

### Check 1: View Tables
1. Go to Supabase Dashboard → Table Editor
2. You should see a long list of tables in the sidebar
3. If you see tables, your database is set up ✅
4. If you don't see tables, you need to apply migrations ⏳

### Check 2: Check Edge Functions
1. Go to Supabase Dashboard → Edge Functions
2. You should see 43 edge functions deployed
3. Click on any function to see logs and status

### Check 3: Check Authentication
1. Go to Supabase Dashboard → Authentication
2. You should see "Users" tab
3. Create a test user if needed

## Why Bolt Shows "Start Your Database"

Bolt Cloud has its own database service, but your project is configured to use Supabase instead. This is actually better because:

✅ Supabase is more powerful and feature-rich
✅ Supabase has better performance and scaling
✅ Supabase includes Authentication, Storage, Edge Functions, and Realtime out of the box
✅ Your entire SEO platform is built on Supabase

**You should ignore Bolt's database interface and use Supabase directly.**

## Current Status

Based on your project configuration:

- ✅ Supabase URL configured: https://0ec90b57d6e95fcbda19832f.supabase.co
- ✅ Anonymous key configured (for frontend)
- ✅ 43 Edge Functions created and deployed
- ✅ 24 Migration files created
- ⏳ Need to verify if migrations are applied
- ⏳ Need to add DataForSEO credentials

## Next Steps

1. **Access Your Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Find project: 0ec90b57d6e95fcbda19832f

2. **Check if Tables Exist**:
   - Click "Table Editor"
   - Look for tables like `profiles`, `seo_projects`, `keyword_analysis`

3. **If Tables Don't Exist**:
   - Go to SQL Editor
   - Apply the migration: `supabase/migrations/20251007000000_complete_database_structure.sql`

4. **Add DataForSEO Credentials**:
   - Go to Settings → Edge Functions → Secrets
   - Add: DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD

5. **Test Your Application**:
   - Try creating a user account
   - Try keyword research
   - Check if data is being saved

## Troubleshooting

### "I don't have access to Supabase Dashboard"

**Solution**: Check your email for Supabase invitation, or contact the project creator to add you as a collaborator.

### "I see empty tables"

**Solution**: This is normal for a fresh installation. Tables exist but have no data yet. Start using the application to populate them.

### "Tables don't exist"

**Solution**: You need to apply the migration. See "Method 2: Apply Migration via SQL Editor" above.

### "I want to use Bolt's database instead"

**Not Recommended**: Your entire application (43 edge functions, authentication, file storage) is built for Supabase. Switching to Bolt's database would require a complete rewrite.

## Summary

- 🔴 Ignore Bolt's "Start your database" message
- 🟢 Use Supabase Dashboard to manage your database
- 🔗 Your Supabase URL: https://0ec90b57d6e95fcbda19832f.supabase.co
- 📊 You should have 90+ tables once migrations are applied
- 🔧 Apply migrations via Supabase SQL Editor if needed
- 🔑 Add DataForSEO credentials for keyword research to work

Your database is actually set up correctly - you just need to access it through Supabase instead of Bolt!
