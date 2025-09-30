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
    const { code, projectId, redirectUri } = await req.json();
    
    console.log('Processing OAuth callback for project:', projectId);

    const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('OAuth credentials not configured');
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange authorization code');
    }

    const tokens = await tokenResponse.json();
    console.log('Successfully obtained tokens');

    // Get user's Google properties
    const [gscProperties, gaProperties] = await Promise.all([
      // Get Search Console properties
      fetch('https://www.googleapis.com/webmasters/v3/sites', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      }).then(res => res.ok ? res.json() : { siteEntry: [] }),
      
      // Get Analytics properties
      fetch('https://analyticsadmin.googleapis.com/v1beta/accounts/-/properties', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      }).then(res => res.ok ? res.json() : { properties: [] }),
    ]);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store credentials
    const { error: upsertError } = await supabase
      .from('google_api_settings')
      .upsert({
        project_id: projectId,
        credentials_json: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + (tokens.expires_in * 1000),
          token_type: tokens.token_type,
        },
      }, {
        onConflict: 'project_id',
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error('Failed to store credentials:', upsertError);
      throw new Error('Failed to store credentials');
    }

    return new Response(
      JSON.stringify({
        success: true,
        gscProperties: gscProperties.siteEntry || [],
        gaProperties: gaProperties.properties || [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
