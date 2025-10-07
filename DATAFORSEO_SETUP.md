# DataForSEO Credentials Setup Guide

## ✅ Credentials Updated

Your DataForSEO credentials have been configured:
- **Login**: george.k@growthrocks.com
- **Password**: 6f820760d2c324ac

## 🚀 Deployment Steps

### 1. Update Supabase Environment Variables

You need to set these environment variables in your Supabase project:

```bash
# Using Supabase CLI
supabase secrets set DATAFORSEO_LOGIN=george.k@growthrocks.com
supabase secrets set DATAFORSEO_PASSWORD=6f820760d2c324ac

# Or via Supabase Dashboard:
# Go to Settings > Edge Functions > Environment Variables
# Add:
# DATAFORSEO_LOGIN = george.k@growthrocks.com
# DATAFORSEO_PASSWORD = 6f820760d2c324ac
```

### 2. Deploy the DataForSEO Proxy Function

```bash
supabase functions deploy dataforseo-proxy
```

### 3. Test the Connection

1. Go to your SEO Suite
2. Navigate to "DataForSEO Test" tab
3. Click "Test Connection" to verify credentials work
4. Run "Run All Tests" to test all endpoints

## 🔧 Local Development

For local development, create a `.env.local` file:

```env
DATAFORSEO_LOGIN=george.k@growthrocks.com
DATAFORSEO_PASSWORD=6f820760d2c324ac
```

## 🧪 Testing Endpoints

The following endpoints are now available:

### Free Endpoints (No Cost)
- **Locations**: Get available search locations
- **SERP Endpoints**: Get available SERP endpoints
- **Labs Categories**: Get taxonomy categories

### Paid Endpoints (Cost per Request)
- **SERP Analysis**: Live Google SERP data
- **Keyword Volume**: Search volume data
- **On-Page Analysis**: Website analysis

## 🚨 Security Notes

- ✅ Credentials are server-side only
- ✅ No credentials exposed to frontend
- ✅ Proper CORS configuration
- ✅ Allow-listed endpoints only

## 📊 Usage Examples

```typescript
// Get available locations
const locations = await dfsLocations();

// Analyze SERP for keyword
const serpData = await dfsGoogleLiveAdvanced("best running shoes", 2840, "en", 20);

// Get keyword volumes
const volumes = await dfsSearchVolumeLive(["keyword1", "keyword2"], 2840, "en");
```

## 🔍 Troubleshooting

If tests fail:
1. Check Supabase environment variables are set
2. Verify function is deployed: `supabase functions list`
3. Check function logs: `supabase functions logs dataforseo-proxy`
4. Ensure credentials are correct in DataForSEO dashboard
