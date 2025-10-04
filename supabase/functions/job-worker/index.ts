import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { jobId } = await req.json();

    // Fetch the job
    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      throw new Error("Job not found");
    }

    // Update job to processing
    await supabase
      .from("jobs")
      .update({ 
        status: "processing", 
        started_at: new Date().toISOString() 
      })
      .eq("id", jobId);

    console.log(`Processing job ${jobId} of type ${job.job_type}`);

    let result;
    try {
      // Route to appropriate handler
      switch (job.job_type) {
        case "backlinks_analysis":
          result = await processBacklinksAnalysis(job, supabase);
          break;
        case "keyword_research":
          result = await processKeywordResearch(job, supabase);
          break;
        case "keyword_clustering":
          result = await processKeywordClustering(job, supabase);
          break;
        case "competitor_analysis":
          result = await processCompetitorAnalysis(job, supabase);
          break;
        case "serp_tracking":
          result = await processSerpTracking(job, supabase);
          break;
        case "bulk_analysis":
          result = await processBulkAnalysis(job, supabase);
          break;
        default:
          throw new Error(`Unknown job type: ${job.job_type}`);
      }

      // Mark job as completed
      await supabase
        .from("jobs")
        .update({
          status: "completed",
          result_data: result,
          progress: job.total_items,
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      console.log(`Job ${jobId} completed successfully`);

      return new Response(
        JSON.stringify({ success: true, result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (processingError: unknown) {
      console.error(`Job ${jobId} failed:`, processingError);

      // Mark job as failed
      await supabase
        .from("jobs")
        .update({
          status: "failed",
          error_message: processingError.message,
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      throw processingError;
    }
  } catch (error: unknown) {
    console.error("Worker error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Job handlers
async function processBacklinksAnalysis(job: unknown, supabase: unknown) {
  const { domain } = job.input_data;
  const dataforSeoKey = Deno.env.get("DATAFORSEO_API_KEY");
  
  if (!dataforSeoKey) {
    throw new Error("DataForSEO API key not configured");
  }

  // Call DataForSEO API for backlinks
  const response = await fetch("https://api.dataforseo.com/v3/backlinks/backlinks/live", {
    method: "POST",
    headers: {
      Authorization: `Basic ${dataforSeoKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{
      target: domain,
      limit: 100,
    }]),
  });

  if (!response.ok) {
    throw new Error(`DataForSEO API error: ${response.statusText}`);
  }

  const data = await response.json();
  const backlinks = data.tasks?.[0]?.result?.[0]?.items || [];

  // Store results in backlink_analysis table
  for (const backlink of backlinks) {
    await supabase.from("backlink_analysis").insert({
      project_id: job.input_data.project_id,
      source_domain: backlink.domain_from,
      source_url: backlink.url_from,
      target_url: backlink.url_to,
      anchor_text: backlink.anchor,
      link_type: backlink.link_attribute,
      domain_authority: backlink.rank,
      is_dofollow: backlink.dofollow,
      first_seen: backlink.first_seen,
      last_checked: new Date().toISOString(),
    });
  }

  return {
    domain,
    backlinks_count: backlinks.length,
    backlinks: backlinks.slice(0, 10), // Return first 10 for preview
  };
}

async function processKeywordResearch(job: unknown, supabase: unknown) {
  const { keyword, location } = job.input_data;
  const dataforSeoKey = Deno.env.get("DATAFORSEO_API_KEY");

  const response = await fetch("https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live", {
    method: "POST",
    headers: {
      Authorization: `Basic ${dataforSeoKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{
      keywords: [keyword],
      location_code: location || 2840,
    }]),
  });

  const data = await response.json();
  const result = data.tasks?.[0]?.result?.[0];

  // Store in keyword_tracking table
  if (result && job.input_data.project_id) {
    await supabase.from("keyword_tracking").insert({
      project_id: job.input_data.project_id,
      keyword,
      search_volume: result.search_volume,
      difficulty: result.keyword_difficulty,
      cpc: result.cpc,
    });
  }

  return result;
}

async function processCompetitorAnalysis(job: unknown, supabase: unknown) {
  const { domain, competitors } = job.input_data;
  const dataforSeoKey = Deno.env.get("DATAFORSEO_API_KEY");

  const allDomains = [domain, ...(competitors || [])];
  const results = [];

  for (const targetDomain of allDomains) {
    const response = await fetch("https://api.dataforseo.com/v3/dataforseo_labs/google/domain_metrics/live", {
      method: "POST",
      headers: {
        Authorization: `Basic ${dataforSeoKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{
        target: targetDomain,
      }]),
    });

    const data = await response.json();
    const metrics = data.tasks?.[0]?.result?.[0]?.items?.[0]?.metrics;

    if (metrics && job.input_data.project_id) {
      await supabase.from("competitor_analysis").insert({
        project_id: job.input_data.project_id,
        competitor_domain: targetDomain,
        keyword: job.input_data.keyword || "",
        traffic_estimate: metrics.organic?.etv,
        backlinks_count: metrics.backlinks?.backlinks,
        referring_domains: metrics.backlinks?.referring_domains,
      });

      results.push({
        domain: targetDomain,
        metrics,
      });
    }

    // Update progress
    await supabase
      .from("jobs")
      .update({ progress: results.length })
      .eq("id", job.id);
  }

  return { domains_analyzed: allDomains.length, results };
}

async function processSerpTracking(job: unknown, supabase: unknown) {
  const { keyword, domain, location } = job.input_data;
  
  const response = await supabase.functions.invoke("serp-tracker", {
    body: { keyword, domain, location },
  });

  if (response.error) throw response.error;

  return response.data;
}

async function processBulkAnalysis(job: unknown, supabase: unknown) {
  const { items, analysisType } = job.input_data;
  const results = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    try {
      let itemResult;
      switch (analysisType) {
        case "backlinks":
          itemResult = await processBacklinksAnalysis(
            { ...job, input_data: { ...item, project_id: job.input_data.project_id } },
            supabase
          );
          break;
        case "keywords":
          itemResult = await processKeywordResearch(
            { ...job, input_data: { ...item, project_id: job.input_data.project_id } },
            supabase
          );
          break;
        default:
          throw new Error(`Unsupported bulk analysis type: ${analysisType}`);
      }

      results.push({ item, success: true, result: itemResult });
    } catch (error: unknown) {
      results.push({ item, success: false, error: error.message });
    }

    // Update progress after each item
    await supabase
      .from("jobs")
      .update({ progress: i + 1 })
      .eq("id", job.id);
  }

  return {
    total: items.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}

async function processKeywordClustering(job: unknown, supabase: unknown) {
  const { keywords, projectId } = job.input_data;

  const response = await supabase.functions.invoke("keyword-clustering", {
    body: { keywords, projectId },
  });

  if (response.error) throw response.error;

  return response.data;
}
