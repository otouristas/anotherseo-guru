import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CrawlConfig {
  projectId: string;
  domain: string;
  maxPages: number;
  depth?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { projectId, domain, maxPages = 10 }: CrawlConfig = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!firecrawlKey) {
      throw new Error("Firecrawl API key not configured");
    }

    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("credits, plan_type")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const creditsPerPage = 1;
    const totalCreditsNeeded = maxPages * creditsPerPage;

    if (profile.plan_type === "agency") {
    } else if (profile.credits < totalCreditsNeeded) {
      throw new Error(`Insufficient credits. You need ${totalCreditsNeeded} credits but have ${profile.credits}`);
    }

    if (profile.plan_type !== "agency") {
      const { data: deductResult, error: deductError } = await supabase.rpc("deduct_credits", {
        user_id_param: user.id,
        credits_to_deduct: totalCreditsNeeded,
      });

      if (deductError || !deductResult) {
        throw new Error("Failed to deduct credits");
      }
    }

    const normalizedDomain = domain.startsWith("http")
      ? domain
      : `https://${domain}`;

    const { data: crawlJob, error: jobError } = await supabase
      .from("crawl_jobs")
      .insert({
        project_id: projectId,
        status: "crawling",
        max_pages: maxPages,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Failed to create crawl job: ${jobError.message}`);
    }

    const crawlJobId = crawlJob.id;

    (async () => {
      try {
        const urlsToCrawl: string[] = [normalizedDomain];
        const crawledUrls = new Set<string>();
        const pagesToCrawl = Math.min(maxPages, 2000);
        let pagesCrawled = 0;

        while (urlsToCrawl.length > 0 && pagesCrawled < pagesToCrawl) {
          const currentUrl = urlsToCrawl.shift()!;

          if (crawledUrls.has(currentUrl)) {
            continue;
          }

          crawledUrls.add(currentUrl);

          try {
            const crawlStartTime = Date.now();

            const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${firecrawlKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                url: currentUrl,
                formats: ["markdown", "html"],
                includeTags: ["meta", "h1", "h2", "h3", "h4", "h5", "h6", "title", "a", "img"],
                onlyMainContent: false,
              }),
            });

            if (!response.ok) {
              console.error(`Failed to crawl ${currentUrl}: ${response.status}`);
              continue;
            }

            const data = await response.json();
            const loadTime = Date.now() - crawlStartTime;

            const metadata = data.metadata || {};
            const content = data.markdown || "";
            const html = data.html || "";
            const links = data.links || [];

            const title = metadata.title || "";
            const metaDescription = metadata.description || "";
            const h1 = metadata.h1 || "";
            const statusCode = metadata.statusCode || 200;

            const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length;

            const internalLinks: string[] = [];
            const externalLinks: string[] = [];
            links.forEach((link: string) => {
              if (link.startsWith(normalizedDomain) || link.startsWith("/")) {
                const fullLink = link.startsWith("/")
                  ? new URL(link, normalizedDomain).href
                  : link;
                internalLinks.push(fullLink);
                if (!crawledUrls.has(fullLink) && urlsToCrawl.length < pagesToCrawl) {
                  urlsToCrawl.push(fullLink);
                }
              } else if (link.startsWith("http")) {
                externalLinks.push(link);
              }
            });

            const imgRegex = /<img[^>]*>/gi;
            const images = html.match(imgRegex) || [];
            const imagesWithoutAlt = images.filter((img: string) => !img.includes("alt=")).length;

            const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
            const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;

            const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
            const metaRobots = robotsMatch ? robotsMatch[1] : null;

            const hasSchemaMarkup = html.includes("application/ld+json") || html.includes("schema.org");

            const { data: page, error: pageError } = await supabase
              .from("crawled_pages")
              .insert({
                crawl_job_id: crawlJobId,
                project_id: projectId,
                url: currentUrl,
                status_code: statusCode,
                title,
                meta_description: metaDescription,
                h1,
                content,
                word_count: wordCount,
                load_time_ms: loadTime,
                internal_links_count: internalLinks.length,
                external_links_count: externalLinks.length,
                images_count: images.length,
                images_without_alt: imagesWithoutAlt,
                html_size_bytes: html.length,
                has_canonical: !!canonicalUrl,
                canonical_url: canonicalUrl,
                meta_robots: metaRobots,
                has_schema_markup: hasSchemaMarkup,
                headers: metadata,
              })
              .select()
              .single();

            if (pageError) {
              console.error("Error inserting page:", pageError);
              continue;
            }

            const pageId = page.id;

            if (internalLinks.length > 0) {
              const internalLinkRecords = internalLinks.map((link) => ({
                crawl_job_id: crawlJobId,
                source_page_id: pageId,
                target_url: link,
                is_broken: false,
              }));

              await supabase.from("internal_links").insert(internalLinkRecords);
            }

            if (externalLinks.length > 0) {
              const externalLinkRecords = externalLinks.slice(0, 50).map((link) => ({
                crawl_job_id: crawlJobId,
                source_page_id: pageId,
                target_url: link,
                is_broken: false,
              }));

              await supabase.from("external_links").insert(externalLinkRecords);
            }

            pagesCrawled++;

            const progress = Math.floor((pagesCrawled / pagesToCrawl) * 90);
            await supabase
              .from("crawl_jobs")
              .update({
                progress,
                pages_crawled: pagesCrawled,
                pages_discovered: crawledUrls.size + urlsToCrawl.length,
              })
              .eq("id", crawlJobId);

            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`Error crawling ${currentUrl}:`, error);
          }
        }

        await supabase
          .from("crawl_jobs")
          .update({
            status: "analyzing",
            progress: 90,
            pages_crawled: pagesCrawled,
          })
          .eq("id", crawlJobId);

        const analyzeResponse = await fetch(
          `${supabaseUrl}/functions/v1/analyze-seo`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ crawlJobId, projectId }),
          }
        );

        if (!analyzeResponse.ok) {
          console.error("Analysis failed:", await analyzeResponse.text());
        }

        await supabase
          .from("crawl_jobs")
          .update({
            status: "completed",
            progress: 100,
            completed_at: new Date().toISOString(),
          })
          .eq("id", crawlJobId);
      } catch (error) {
        console.error("Crawl error:", error);
        await supabase
          .from("crawl_jobs")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "Unknown error",
            completed_at: new Date().toISOString(),
          })
          .eq("id", crawlJobId);
      }
    })();

    return new Response(
      JSON.stringify({
        success: true,
        crawlJobId,
        message: "Crawl started successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Crawler error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
