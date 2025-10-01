import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PageIssue {
  issue_type: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
  affected_element?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { crawlJobId, projectId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: pages, error: pagesError } = await supabase
      .from("crawled_pages")
      .select("*")
      .eq("crawl_job_id", crawlJobId);

    if (pagesError || !pages) {
      throw new Error("Failed to fetch crawled pages");
    }

    const allIssues: Array<PageIssue & { page_id: string; crawl_job_id: string }> = [];
    let technicalScore = 100;
    let onpageScore = 100;
    let contentScore = 100;
    let performanceScore = 100;
    let mobileScore = 100;

    for (const page of pages) {
      const pageIssues: PageIssue[] = [];

      if (!page.title || page.title.length === 0) {
        pageIssues.push({
          issue_type: "missing_title",
          category: "on-page",
          severity: "critical",
          title: "Missing Title Tag",
          description: "This page does not have a title tag, which is critical for SEO.",
          recommendation:
            "Add a unique, descriptive title tag between 30-60 characters that includes your primary keyword.",
        });
        onpageScore -= 5;
      } else if (page.title.length < 30) {
        pageIssues.push({
          issue_type: "short_title",
          category: "on-page",
          severity: "medium",
          title: "Title Tag Too Short",
          description: `Title is only ${page.title.length} characters. Optimal length is 30-60 characters.`,
          recommendation: "Expand your title tag to include more descriptive keywords and reach 30-60 characters.",
          affected_element: page.title,
        });
        onpageScore -= 2;
      } else if (page.title.length > 60) {
        pageIssues.push({
          issue_type: "long_title",
          category: "on-page",
          severity: "low",
          title: "Title Tag Too Long",
          description: `Title is ${page.title.length} characters. May be truncated in search results.`,
          recommendation: "Shorten your title tag to 30-60 characters to prevent truncation in SERPs.",
          affected_element: page.title,
        });
        onpageScore -= 1;
      }

      if (!page.meta_description || page.meta_description.length === 0) {
        pageIssues.push({
          issue_type: "missing_meta_description",
          category: "on-page",
          severity: "high",
          title: "Missing Meta Description",
          description: "This page lacks a meta description, reducing click-through rates from search results.",
          recommendation:
            "Add a compelling meta description between 120-160 characters that summarizes the page content.",
        });
        onpageScore -= 4;
      } else if (page.meta_description.length < 120) {
        pageIssues.push({
          issue_type: "short_meta_description",
          category: "on-page",
          severity: "medium",
          title: "Meta Description Too Short",
          description: `Meta description is only ${page.meta_description.length} characters.`,
          recommendation: "Expand to 120-160 characters to maximize visibility in search results.",
          affected_element: page.meta_description.substring(0, 50) + "...",
        });
        onpageScore -= 2;
      } else if (page.meta_description.length > 160) {
        pageIssues.push({
          issue_type: "long_meta_description",
          category: "on-page",
          severity: "low",
          title: "Meta Description Too Long",
          description: `Meta description is ${page.meta_description.length} characters and may be truncated.`,
          recommendation: "Shorten to 120-160 characters to prevent truncation.",
          affected_element: page.meta_description.substring(0, 50) + "...",
        });
        onpageScore -= 1;
      }

      if (!page.h1 || page.h1.length === 0) {
        pageIssues.push({
          issue_type: "missing_h1",
          category: "on-page",
          severity: "high",
          title: "Missing H1 Tag",
          description: "Page is missing an H1 heading, which is important for content hierarchy and SEO.",
          recommendation: "Add a single, descriptive H1 tag that includes your primary keyword.",
        });
        onpageScore -= 4;
      }

      if (page.word_count < 300) {
        pageIssues.push({
          issue_type: "thin_content",
          category: "content",
          severity: "medium",
          title: "Thin Content",
          description: `Page has only ${page.word_count} words. Search engines prefer comprehensive content.`,
          recommendation: "Expand content to at least 300 words with valuable, relevant information.",
        });
        contentScore -= 3;
      }

      if (page.images_without_alt > 0) {
        pageIssues.push({
          issue_type: "images_without_alt",
          category: "on-page",
          severity: page.images_without_alt > 3 ? "high" : "medium",
          title: "Images Missing Alt Text",
          description: `${page.images_without_alt} of ${page.images_count} images lack alt attributes.`,
          recommendation:
            "Add descriptive alt text to all images for accessibility and image SEO. Include keywords naturally.",
        });
        onpageScore -= Math.min(page.images_without_alt, 5);
      }

      if (page.status_code !== 200) {
        pageIssues.push({
          issue_type: "http_error",
          category: "technical",
          severity: "critical",
          title: `HTTP ${page.status_code} Error`,
          description: `Page returned a ${page.status_code} status code.`,
          recommendation:
            page.status_code === 404
              ? "Fix or remove broken links pointing to this page. Implement proper redirects if the page moved."
              : "Investigate and resolve server errors. Check server logs for details.",
        });
        technicalScore -= 10;
      }

      if (!page.has_canonical && pages.length > 1) {
        pageIssues.push({
          issue_type: "missing_canonical",
          category: "technical",
          severity: "medium",
          title: "Missing Canonical Tag",
          description: "Page lacks a canonical tag, which can lead to duplicate content issues.",
          recommendation: "Add a canonical tag pointing to the preferred version of this URL.",
        });
        technicalScore -= 2;
      }

      if (!page.has_schema_markup) {
        pageIssues.push({
          issue_type: "missing_schema",
          category: "technical",
          severity: "low",
          title: "No Structured Data",
          description: "Page lacks schema markup (JSON-LD), missing opportunities for rich snippets.",
          recommendation:
            "Implement appropriate schema.org markup (Article, Product, Organization, etc.) for enhanced SERP display.",
        });
        technicalScore -= 1;
      }

      if (page.load_time_ms && page.load_time_ms > 3000) {
        pageIssues.push({
          issue_type: "slow_load_time",
          category: "performance",
          severity: page.load_time_ms > 5000 ? "high" : "medium",
          title: "Slow Page Load Time",
          description: `Page took ${Math.round(page.load_time_ms / 1000)}s to load. Target is under 3 seconds.`,
          recommendation:
            "Optimize images, minify CSS/JS, enable compression, use CDN, and implement browser caching.",
        });
        performanceScore -= Math.min(Math.floor(page.load_time_ms / 1000), 15);
      }

      if (page.internal_links_count < 3) {
        pageIssues.push({
          issue_type: "low_internal_links",
          category: "on-page",
          severity: "low",
          title: "Few Internal Links",
          description: `Page has only ${page.internal_links_count} internal links.`,
          recommendation:
            "Add more contextual internal links to improve site navigation and distribute link equity.",
        });
        onpageScore -= 1;
      }

      if (page.html_size_bytes && page.html_size_bytes > 100000) {
        pageIssues.push({
          issue_type: "large_html",
          category: "performance",
          severity: "low",
          title: "Large HTML Size",
          description: `HTML size is ${Math.round(page.html_size_bytes / 1024)}KB. Consider optimization.`,
          recommendation: "Minify HTML, remove unnecessary code, and consider lazy loading for below-fold content.",
        });
        performanceScore -= 1;
      }

      for (const issue of pageIssues) {
        allIssues.push({
          ...issue,
          page_id: page.id,
          crawl_job_id: crawlJobId,
        });
      }
    }

    technicalScore = Math.max(0, Math.min(100, technicalScore));
    onpageScore = Math.max(0, Math.min(100, onpageScore));
    contentScore = Math.max(0, Math.min(100, contentScore));
    performanceScore = Math.max(0, Math.min(100, performanceScore));
    mobileScore = Math.max(0, Math.min(100, mobileScore));

    const overallScore = Math.round(
      (technicalScore * 0.25 + onpageScore * 0.3 + contentScore * 0.2 + performanceScore * 0.15 + mobileScore * 0.1)
    );

    if (allIssues.length > 0) {
      await supabase.from("page_seo_issues").insert(allIssues);
    }

    const criticalIssues = allIssues.filter((i) => i.severity === "critical").length;
    const highIssues = allIssues.filter((i) => i.severity === "high").length;
    const mediumIssues = allIssues.filter((i) => i.severity === "medium").length;
    const lowIssues = allIssues.filter((i) => i.severity === "low").length;

    await supabase.from("site_audit_scores").insert({
      crawl_job_id: crawlJobId,
      project_id: projectId,
      overall_score: overallScore,
      technical_score: technicalScore,
      onpage_score: onpageScore,
      content_score: contentScore,
      performance_score: performanceScore,
      mobile_score: mobileScore,
      total_issues: allIssues.length,
      critical_issues: criticalIssues,
      high_issues: highIssues,
      medium_issues: mediumIssues,
      low_issues: lowIssues,
      pages_analyzed: pages.length,
      score_breakdown: {
        technical: { score: technicalScore, weight: 0.25 },
        onpage: { score: onpageScore, weight: 0.3 },
        content: { score: contentScore, weight: 0.2 },
        performance: { score: performanceScore, weight: 0.15 },
        mobile: { score: mobileScore, weight: 0.1 },
      },
    });

    const recommendations = generateRecommendations(allIssues, pages.length);
    if (recommendations.length > 0) {
      await supabase.from("audit_recommendations").insert(
        recommendations.map((rec) => ({
          ...rec,
          crawl_job_id: crawlJobId,
          project_id: projectId,
        }))
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        overallScore,
        totalIssues: allIssues.length,
        pagesAnalyzed: pages.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Analysis error:", error);
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

function generateRecommendations(issues: PageIssue[], totalPages: number) {
  const recommendations: Array<{
    priority: string;
    category: string;
    title: string;
    description: string;
    impact: string;
    effort: string;
    affected_pages_count: number;
    estimated_improvement: string;
    implementation_guide: string;
  }> = [];

  const missingTitles = issues.filter((i) => i.issue_type === "missing_title").length;
  if (missingTitles > 0) {
    recommendations.push({
      priority: "quick-win",
      category: "On-Page SEO",
      title: "Add Missing Title Tags",
      description: `${missingTitles} pages are missing title tags, severely impacting SEO performance.`,
      impact: "high",
      effort: "low",
      affected_pages_count: missingTitles,
      estimated_improvement: "+15-20% increase in organic visibility",
      implementation_guide:
        "1. Identify all pages without title tags\n2. Create unique, keyword-rich titles (30-60 chars)\n3. Include primary keyword near the beginning\n4. Make each title unique and descriptive",
    });
  }

  const missingMeta = issues.filter((i) => i.issue_type === "missing_meta_description").length;
  if (missingMeta > 0) {
    recommendations.push({
      priority: "quick-win",
      category: "On-Page SEO",
      title: "Add Meta Descriptions",
      description: `${missingMeta} pages lack meta descriptions, reducing CTR from search results.`,
      impact: "high",
      effort: "low",
      affected_pages_count: missingMeta,
      estimated_improvement: "+10-15% increase in click-through rate",
      implementation_guide:
        "1. Write unique descriptions for each page (120-160 chars)\n2. Include primary keyword and call-to-action\n3. Make it compelling and relevant to page content\n4. Avoid duplicate descriptions across pages",
    });
  }

  const thinContent = issues.filter((i) => i.issue_type === "thin_content").length;
  if (thinContent > 0) {
    recommendations.push({
      priority: "high-impact",
      category: "Content Quality",
      title: "Expand Thin Content Pages",
      description: `${thinContent} pages have insufficient content (under 300 words).`,
      impact: "high",
      effort: "medium",
      affected_pages_count: thinContent,
      estimated_improvement: "+25-30% improvement in rankings",
      implementation_guide:
        "1. Identify pages with under 300 words\n2. Research competitor content length\n3. Add valuable, relevant information\n4. Include related keywords naturally\n5. Consider adding FAQs, examples, or case studies",
    });
  }

  const missingAlt = issues.filter((i) => i.issue_type === "images_without_alt").length;
  if (missingAlt > 0) {
    recommendations.push({
      priority: "quick-win",
      category: "On-Page SEO",
      title: "Add Image Alt Text",
      description: "Multiple images are missing alt attributes, impacting accessibility and image SEO.",
      impact: "medium",
      effort: "low",
      affected_pages_count: missingAlt,
      estimated_improvement: "+5-10% improvement in image search traffic",
      implementation_guide:
        "1. Audit all images without alt text\n2. Write descriptive alt text for each image\n3. Include relevant keywords naturally\n4. Keep alt text concise (under 125 characters)\n5. Describe what the image shows",
    });
  }

  const slowPages = issues.filter((i) => i.issue_type === "slow_load_time").length;
  if (slowPages > 0) {
    recommendations.push({
      priority: "high-impact",
      category: "Performance",
      title: "Improve Page Load Speed",
      description: `${slowPages} pages have slow load times, negatively impacting user experience and rankings.`,
      impact: "high",
      effort: "high",
      affected_pages_count: slowPages,
      estimated_improvement: "+20-25% improvement in Core Web Vitals score",
      implementation_guide:
        "1. Optimize and compress images\n2. Minify CSS, JavaScript, and HTML\n3. Enable browser caching\n4. Use a Content Delivery Network (CDN)\n5. Implement lazy loading for images\n6. Remove render-blocking resources\n7. Upgrade hosting if necessary",
    });
  }

  const missingSchema = issues.filter((i) => i.issue_type === "missing_schema").length;
  if (missingSchema > totalPages * 0.5) {
    recommendations.push({
      priority: "long-term",
      category: "Technical SEO",
      title: "Implement Structured Data",
      description: "Most pages lack schema markup, missing opportunities for rich snippets.",
      impact: "medium",
      effort: "medium",
      affected_pages_count: missingSchema,
      estimated_improvement: "+15-20% chance of earning rich snippets",
      implementation_guide:
        "1. Choose appropriate schema types (Article, Product, FAQ, etc.)\n2. Implement JSON-LD structured data\n3. Test with Google's Rich Results Test\n4. Add to all relevant page types\n5. Monitor rich snippet appearances in GSC",
    });
  }

  return recommendations;
}
