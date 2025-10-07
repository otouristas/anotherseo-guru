# 🚨 URGENT: Deploy DataForSEO Proxy Function

## ❌ Current Issue
The Keyword Research Matrix is failing because the `dataforseo-proxy` function is not deployed.

**Error**: `404 (Not Found)` when calling `/functions/v1/dataforseo-proxy`

## 🚀 Quick Fix: Deploy the Function

### **Step 1: Deploy via Supabase Dashboard**

1. **Go to Supabase Dashboard**: `https://supabase.com/dashboard/project/cabzhcbnxbnhjannbpxj`
2. **Navigate to Edge Functions**
3. **Click "Create a new function"**
4. **Name**: `dataforseo-proxy`
5. **Copy the content** from `supabase/functions/dataforseo-proxy/index.ts`
6. **Paste into the function editor**
7. **Set environment variables**:
   ```
   DATAFORSEO_LOGIN = george.k@growthrocks.com
   DATAFORSEO_PASSWORD = 6f820760d2c324ac
   ```
8. **Click "Deploy"**

### **Step 2: Verify Deployment**

After deployment, test it by:
1. **Go to SEO Suite** → **Keyword Matrix** tab
2. **Enter a keyword** (e.g., "best running shoes")
3. **Click "Research"**
4. **Should work without 404 errors**

## 🔧 Alternative: Use Existing Function

If you want to use the existing `dataforseo-advanced` function instead:

### **Update the KeywordResearchMatrix component**

Change the import in `src/components/seo/KeywordResearchMatrix.tsx`:

```typescript
// Replace this line:
import { dfsGoogleLiveAdvanced, dfsSearchVolumeLive, dfsLocations } from "@/lib/dataforseo";

// With this:
import { supabase } from "@/integrations/supabase/client";
```

And update the research function to use the existing function:

```typescript
const researchKeywords = async () => {
  if (!searchTerm.trim()) {
    toast({
      title: "Enter a search term",
      description: "Please enter a keyword or phrase to research",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  try {
    // Use existing dataforseo-advanced function
    const { data, error } = await supabase.functions.invoke('dataforseo-advanced', {
      body: {
        projectId,
        operation: 'keywords',
        params: {
          keywords: [searchTerm],
          location: 'United States',
          language: 'English'
        }
      }
    });

    if (error) throw error;

    // Process the data...
    const newKeyword: KeywordData = {
      keyword: searchTerm,
      searchVolume: data.results?.search_volume || 0,
      difficulty: data.results?.difficulty || 0,
      cpc: data.results?.cpc || 0,
      competition: getCompetitionLevel(data.results?.difficulty || 0),
      intent: analyzeIntent(searchTerm),
      trend: 'Stable' as const,
      opportunity_score: calculateOpportunityScore(data.results),
      priority: getPriorityLevel(calculateOpportunityScore(data.results)),
      notes: `Researched on ${new Date().toLocaleDateString()}`
    };

    // Save to database...
    setKeywords(prev => [newKeyword, ...prev]);
    setSearchTerm('');

    toast({
      title: "Keyword researched successfully! ✅",
      description: `Added "${searchTerm}" to your keyword matrix`,
    });

  } catch (error: any) {
    console.error('Error researching keyword:', error);
    toast({
      title: "Research failed ❌",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
```

## 🎯 Recommended Solution

**Deploy the `dataforseo-proxy` function** - it's the cleanest solution and provides:

- ✅ **Better error handling**
- ✅ **Proper CORS support**
- ✅ **Secure credential management**
- ✅ **Consistent API interface**

## ⚡ Quick Test

After deploying, test with this URL:
```
https://cabzhcbnxbnhjannbpxj.supabase.co/functions/v1/dataforseo-proxy
```

Should return a proper response instead of 404.

---

**The Keyword Research Matrix will work perfectly once the function is deployed!** 🚀
