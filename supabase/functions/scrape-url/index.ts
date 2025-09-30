import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY is not configured');
    }

    if (!url) {
      throw new Error('URL is required');
    }

    console.log('Scraping URL:', url);

    // Use Firecrawl API to scrape the URL with extended timeout
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        timeout: 90000, // 90 seconds timeout
        waitFor: 5000, // Wait 5 seconds for page to load
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Firecrawl API error:', error);
      throw new Error(`Firecrawl API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Scrape successful');

    // Extract the markdown content
    const content = data.data?.markdown || data.data?.html || '';
    const title = data.data?.metadata?.title || '';
    const description = data.data?.metadata?.description || '';

    return new Response(
      JSON.stringify({ 
        success: true,
        content,
        title,
        description,
        metadata: data.data?.metadata
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-url function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
