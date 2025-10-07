# DataForSEO API Setup Guide

## Issue Identified

Your keyword research feature is not returning results because the DataForSEO API credentials are not configured in your Supabase environment.

## What Was Fixed

1. **Database Table Name Issue**: Fixed references from `keyword_rankings` to `serp_rankings` in `ProjectOverviewMinimal.tsx`
2. **Date Column Issue**: Changed `date` to `checked_at` to match the actual database schema

## Required Setup: DataForSEO API Credentials

### Step 1: Get DataForSEO API Credentials

1. Go to [DataForSEO](https://dataforseo.com/)
2. Sign up for an account or log in
3. Navigate to your Dashboard
4. Go to **API Access** section
5. Copy your **Login (Email)** and **Password**

### Step 2: Configure Supabase Edge Functions

You need to add the DataForSEO credentials as environment variables in your Supabase project.

#### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add the following secrets:

```
DATAFORSEO_LOGIN=your_dataforseo_email@example.com
DATAFORSEO_PASSWORD=your_dataforseo_password
```

**Alternative format** (if using API key):
```
DATAFORSEO_API_KEY=your_email:your_password
```

#### Option 2: Using Supabase CLI

```bash
supabase secrets set DATAFORSEO_LOGIN=your_dataforseo_email@example.com
supabase secrets set DATAFORSEO_PASSWORD=your_dataforseo_password
```

### Step 3: Verify Configuration

After setting up the credentials:
1. Wait 1-2 minutes for environment variables to propagate
2. Navigate to the Keywords page
3. Search for a keyword (e.g., "digital marketing")
4. You should now see results with search volume, CPC, and competition data

## Summary

**What was wrong:**
- ❌ DataForSEO credentials not configured in Supabase
- ❌ Database table name mismatch (keyword_rankings → serp_rankings)

**What was fixed:**
- ✅ Fixed database table references in code
- ✅ Fixed date column references
- ✅ Created setup documentation

**What you need to do:**
- ⏳ Add DataForSEO credentials to Supabase
- ⏳ Test keyword research functionality

Once you add the credentials, keyword research will work immediately!
