import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, propertyId, startDate, endDate } = await req.json();
    
    console.log('Fetching GA4 data for project:', projectId, 'property:', propertyId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get stored credentials
    const { data: settings, error: settingsError } = await supabase
      .from('google_api_settings')
      .select('credentials_json, google_analytics_property_id')
      .eq('project_id', projectId)
      .maybeSingle();

    if (settingsError || !settings?.credentials_json) {
      throw new Error('Google credentials not found. Please connect Google Analytics first.');
    }

    const credentials = settings.credentials_json as any;
    const targetPropertyId = propertyId || settings.google_analytics_property_id;

    if (!targetPropertyId) {
      throw new Error('Property ID not configured');
    }

    // Check if token is expired and refresh if needed
    let accessToken = credentials.access_token;
    if (credentials.expires_at && Date.now() >= credentials.expires_at) {
      console.log('Token expired, refreshing...');
      accessToken = await refreshAccessToken(credentials.refresh_token, supabase, projectId);
    }

    // Fetch GA4 data using Data API
    const dataEndpoint = `https://analyticsdata.googleapis.com/v1beta/${targetPropertyId}:runReport`;
    
    const dataPayload = {
      dateRanges: [{
        startDate: startDate || '30daysAgo',
        endDate: endDate || 'today'
      }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'sessionDefaultChannelGroup' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'engagementRate' },
        { name: 'conversions' }
      ],
      limit: 10000
    };

    console.log('Fetching GA4 analytics:', dataEndpoint);

    const dataResponse = await fetch(dataEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataPayload),
    });

    if (!dataResponse.ok) {
      const errorText = await dataResponse.text();
      console.error('GA4 API error:', dataResponse.status, errorText);
      throw new Error(`GA4 API error: ${dataResponse.status} - ${errorText}`);
    }

    const analyticsData = await dataResponse.json();
    console.log('GA4 data fetched successfully:', analyticsData.rows?.length || 0, 'rows');

    // Process and aggregate data
    const processedData = {
      totalUsers: 0,
      totalSessions: 0,
      totalPageViews: 0,
      avgSessionDuration: 0,
      avgBounceRate: 0,
      avgEngagementRate: 0,
      totalConversions: 0,
      topPages: [] as any[],
      channelBreakdown: [] as any[],
      rows: analyticsData.rows || []
    };

    if (analyticsData.rows && analyticsData.rows.length > 0) {
      // Store data in database
      const today = new Date().toISOString().split('T')[0];
      const ga4Records = analyticsData.rows.map((row: any) => {
        const metrics = row.metricValues;
        return {
          project_id: projectId,
          page_path: row.dimensionValues[0]?.value || '/',
          channel: row.dimensionValues[1]?.value || 'Unknown',
          users: parseInt(metrics[0]?.value || '0'),
          sessions: parseInt(metrics[1]?.value || '0'),
          page_views: parseInt(metrics[2]?.value || '0'),
          avg_session_duration: parseFloat(metrics[3]?.value || '0'),
          bounce_rate: parseFloat(metrics[4]?.value || '0'),
          engagement_rate: parseFloat(metrics[5]?.value || '0'),
          conversions: parseFloat(metrics[6]?.value || '0'),
          date: today
        };
      });

      // Insert data in batches to avoid timeout
      const batchSize = 1000;
      for (let i = 0; i < ga4Records.length; i += batchSize) {
        const batch = ga4Records.slice(i, i + batchSize);
        await supabase
          .from('ga4_analytics')
          .upsert(batch, {
            onConflict: 'project_id,page_path,channel,date',
            ignoreDuplicates: false
          });
      }

      console.log(`Stored ${ga4Records.length} GA4 records in database`);

      // Calculate totals from row data
      analyticsData.rows.forEach((row: any) => {
        const metrics = row.metricValues;
        processedData.totalUsers += parseInt(metrics[0]?.value || '0');
        processedData.totalSessions += parseInt(metrics[1]?.value || '0');
        processedData.totalPageViews += parseInt(metrics[2]?.value || '0');
        processedData.avgSessionDuration += parseFloat(metrics[3]?.value || '0');
        processedData.avgBounceRate += parseFloat(metrics[4]?.value || '0');
        processedData.avgEngagementRate += parseFloat(metrics[5]?.value || '0');
        processedData.totalConversions += parseFloat(metrics[6]?.value || '0');
      });

      // Calculate averages
      const rowCount = analyticsData.rows.length;
      processedData.avgSessionDuration = processedData.avgSessionDuration / rowCount;
      processedData.avgBounceRate = processedData.avgBounceRate / rowCount;
      processedData.avgEngagementRate = processedData.avgEngagementRate / rowCount;

      // Get top pages
      const pageMap = new Map();
      analyticsData.rows.forEach((row: any) => {
        const pagePath = row.dimensionValues[0]?.value || '/';
        if (!pageMap.has(pagePath)) {
          pageMap.set(pagePath, {
            page: pagePath,
            users: 0,
            sessions: 0,
            pageViews: 0,
            bounceRate: 0,
            engagementRate: 0
          });
        }
        const existing = pageMap.get(pagePath);
        const metrics = row.metricValues;
        existing.users += parseInt(metrics[0]?.value || '0');
        existing.sessions += parseInt(metrics[1]?.value || '0');
        existing.pageViews += parseInt(metrics[2]?.value || '0');
        existing.bounceRate = parseFloat(metrics[4]?.value || '0');
        existing.engagementRate = parseFloat(metrics[5]?.value || '0');
      });

      processedData.topPages = Array.from(pageMap.values())
        .sort((a, b) => b.pageViews - a.pageViews)
        .slice(0, 20);

      // Get channel breakdown
      const channelMap = new Map();
      analyticsData.rows.forEach((row: any) => {
        const channel = row.dimensionValues[1]?.value || 'Unknown';
        if (!channelMap.has(channel)) {
          channelMap.set(channel, {
            channel,
            users: 0,
            sessions: 0,
            conversions: 0
          });
        }
        const existing = channelMap.get(channel);
        const metrics = row.metricValues;
        existing.users += parseInt(metrics[0]?.value || '0');
        existing.sessions += parseInt(metrics[1]?.value || '0');
        existing.conversions += parseFloat(metrics[6]?.value || '0');
      });

      processedData.channelBreakdown = Array.from(channelMap.values())
        .sort((a, b) => b.sessions - a.sessions);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: processedData,
        propertyId: targetPropertyId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('GA4 fetch error:', error);
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

async function refreshAccessToken(refreshToken: string, supabase: any, projectId: string): Promise<string> {
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
