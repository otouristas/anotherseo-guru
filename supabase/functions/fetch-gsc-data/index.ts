import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, siteUrl, startDate, endDate } = await req.json();
    
    console.log('Fetching GSC data for project:', projectId, 'site:', siteUrl);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get stored credentials
    const { data: settings, error: settingsError } = await supabase
      .from('google_api_settings')
      .select('credentials_json, google_search_console_site_url')
      .eq('project_id', projectId)
      .maybeSingle();

    if (settingsError || !settings?.credentials_json) {
      throw new Error('Google credentials not found. Please connect Google Search Console first.');
    }

    const credentials = settings.credentials_json as unknown;
    const targetSiteUrl = siteUrl || settings.google_search_console_site_url;

    if (!targetSiteUrl) {
      throw new Error('Site URL not configured');
    }

    // Check if token is expired and refresh if needed
    let accessToken = credentials.access_token;
    if (credentials.expires_at && Date.now() >= credentials.expires_at) {
      console.log('Token expired, refreshing...');
      accessToken = await refreshAccessToken(credentials.refresh_token, supabase, projectId);
    }

    // Fetch Search Analytics data with pagination to get ALL keywords
    const analyticsEndpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(targetSiteUrl)}/searchAnalytics/query`;

    const basePayload = {
      startDate: startDate || getDateDaysAgo(30),
      endDate: endDate || getDateDaysAgo(0),
      dimensions: ['query', 'page'],
      rowLimit: 25000, // GSC API max
      startRow: 0
    };

    console.log('Fetching ALL keywords from GSC (up to API limit of 25000 rows)');

    let allRows: unknown[] = [];
    let startRow = 0;
    const batchSize = 25000;
    let hasMore = true;

    // Fetch data in batches until we get all rows or hit the limit
    while (hasMore && allRows.length < 25000) {
      const analyticsPayload = {
        ...basePayload,
        startRow
      };

      console.log(`Fetching GSC batch starting at row ${startRow}...`);

      const analyticsResponse = await fetch(analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsPayload),
      });

      if (!analyticsResponse.ok) {
        const errorText = await analyticsResponse.text();
        console.error('GSC API error:', analyticsResponse.status, errorText);
        throw new Error(`GSC API error: ${analyticsResponse.status} - ${errorText}`);
      }

      const batchData = await analyticsResponse.json();
      const batchRows = batchData.rows || [];

      if (batchRows.length === 0) {
        hasMore = false;
        break;
      }

      allRows = allRows.concat(batchRows);
      console.log(`Fetched ${batchRows.length} rows. Total so far: ${allRows.length}`);

      // If we got less than the batch size, we've reached the end
      if (batchRows.length < batchSize) {
        hasMore = false;
      } else {
        startRow += batchSize;
      }
    }

    console.log(`GSC data fetched successfully: ${allRows.length} total keywords`);

    // Process and aggregate data
    const processedData = {
      totalClicks: 0,
      totalImpressions: 0,
      avgCTR: 0,
      avgPosition: 0,
      topQueries: [] as unknown[],
      topPages: [] as unknown[],
      rows: allRows,
      totalKeywords: allRows.length,
      fetchedAllData: allRows.length < 25000
    };

    if (allRows && allRows.length > 0) {
      // Store data in database
      const today = new Date().toISOString().split('T')[0];
      const gscRecords = allRows.map((row: unknown) => ({
        project_id: projectId,
        keyword: row.keys[0],
        page_url: row.keys[1],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
        date: today
      }));

      // Insert data in batches to avoid timeout
      const batchSize = 1000;
      for (let i = 0; i < gscRecords.length; i += batchSize) {
        const batch = gscRecords.slice(i, i + batchSize);
        await supabase
          .from('gsc_analytics')
          .upsert(batch, {
            onConflict: 'project_id,keyword,page_url,date',
            ignoreDuplicates: false
          });
      }

      console.log(`Stored ${gscRecords.length} GSC records in database`);

      // Calculate totals
      allRows.forEach((row: unknown) => {
        processedData.totalClicks += row.clicks || 0;
        processedData.totalImpressions += row.impressions || 0;
      });

      // Calculate averages
      processedData.avgCTR = processedData.totalImpressions > 0
        ? (processedData.totalClicks / processedData.totalImpressions) * 100
        : 0;

      const positionSum = allRows.reduce((sum: number, row: unknown) => sum + (row.position || 0), 0);
      processedData.avgPosition = positionSum / allRows.length;

      // Get top queries
      const queryMap = new Map();
      allRows.forEach((row: unknown) => {
        const query = row.keys[0];
        if (!queryMap.has(query)) {
          queryMap.set(query, {
            query,
            clicks: 0,
            impressions: 0,
            ctr: 0,
            position: 0
          });
        }
        const existing = queryMap.get(query);
        existing.clicks += row.clicks || 0;
        existing.impressions += row.impressions || 0;
        existing.position = row.position || existing.position;
      });

      processedData.topQueries = Array.from(queryMap.values())
        .map(q => ({
          ...q,
          ctr: q.impressions > 0 ? (q.clicks / q.impressions) * 100 : 0
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 20);

      // Get top pages
      const pageMap = new Map();
      allRows.forEach((row: unknown) => {
        const page = row.keys[1];
        if (!pageMap.has(page)) {
          pageMap.set(page, {
            page,
            clicks: 0,
            impressions: 0,
            ctr: 0,
            position: 0
          });
        }
        const existing = pageMap.get(page);
        existing.clicks += row.clicks || 0;
        existing.impressions += row.impressions || 0;
        existing.position = row.position || existing.position;
      });

      processedData.topPages = Array.from(pageMap.values())
        .map(p => ({
          ...p,
          ctr: p.impressions > 0 ? (p.clicks / p.impressions) * 100 : 0
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 20);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: processedData,
        siteUrl: targetSiteUrl 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('GSC fetch error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function refreshAccessToken(refreshToken: string, supabase: unknown, projectId: string): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const tokens = await response.json();

  // Update stored credentials
  await supabase
    .from('google_api_settings')
    .update({
      credentials_json: {
        access_token: tokens.access_token,
        refresh_token: refreshToken,
        expires_at: Date.now() + (tokens.expires_in * 1000),
        token_type: tokens.token_type,
      },
    })
    .eq('project_id', projectId);

  return tokens.access_token;
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
