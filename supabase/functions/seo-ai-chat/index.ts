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
    const { messages, projectContext, sessionId, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let contextualPrompt = "";
    if (projectContext && projectContext.projects && projectContext.projects.length > 0) {
      contextualPrompt = `\n\n**USER'S CURRENT DATA:**\n`;
      contextualPrompt += `- Active Projects: ${projectContext.projects.map((p: unknown) => p.domain).join(", ")}\n`;

      if (projectContext.recent_keywords && projectContext.recent_keywords.length > 0) {
        contextualPrompt += `- Recent Keywords: ${projectContext.recent_keywords.slice(0, 10).map((k: unknown) =>
          `${k.keyword} (vol: ${k.search_volume || 'N/A'}, diff: ${k.difficulty || 'N/A'})`
        ).join(", ")}\n`;
      }

      if (projectContext.pending_recommendations && projectContext.pending_recommendations.length > 0) {
        contextualPrompt += `- Pending AI Recommendations: ${projectContext.pending_recommendations.length} items\n`;
        contextualPrompt += `  Top recommendations: ${projectContext.pending_recommendations.slice(0, 3).map((r: unknown) =>
          r.title
        ).join("; ")}\n`;
      }

      contextualPrompt += `\nWhen answering, reference the user's actual data when relevant. Provide personalized, specific recommendations based on their projects and keywords.`;
    }

    const systemPrompt = `You are an expert SEO AI assistant for AnotherSEOGuru, a professional enterprise-level SEO platform.${contextualPrompt} 

Your knowledge base includes:

**Core SEO Features:**
- **Keyword Research & DataForSEO Integration**: Access to 9 billion keywords database, 200+ keyword modifiers on Google and Bing Autocomplete. Bulk keyword generation with high-intent discovery.
- **Keyword Clustering**: Unlimited SERP and Semantic clustering. Group keywords that can target the same page without limits or subscription fees.
- **SERP Similarity Tool**: Analyze keyword overlap to determine if two keywords should be targeted together on the same page.
- **Keyword Tracking**: Monitor unlimited keywords including competitor analysis. Track desktop, mobile, and local results across unknown location.
- **Backlink Analysis**: Comprehensive link profile evaluation. Compare backlinks with competitors and discover new link-building opportunities.
- **Backlink Gap Analysis**: Find backlink opportunities your competitors have that you don't. Discover new linking domains.
- **Traffic Analytics**: Uncover competitor traffic stats, export their keywords, analyze top pages. Identify growth opportunities and market gaps.
- **Rank Tracking (Google & GMB)**: Track Google My Business and organic rankings. Monitor unlimited keywords with competitor insights. Support for desktop, mobile, and local searches.
- **Content Gap Analysis**: Find topics and keywords your competitors cover that you don't. Fill content gaps to enhance SEO coverage.
- **AI Content Writer**: Generate unlimited SEO-optimized content using local AI models. No additional API fees. Supports multiple languages.
- **NLP Text Analysis**: Extract key topics and entities using Google NLP, TextRazor, and Dandelion in 20+ languages.
- **Site Audit & Technical SEO**: Automated crawling of unlimited URLs. Analyze technical issues, Core Web Vitals, mobile-friendliness, schema markup, and indexability.
- **Google Search Console Integration**: Bulk indexing on autopilot, check keyword mentions, pull unlimited keywords (not limited to 1K or 25K GSC limits). Access real SERP data and indexing status.
- **Google Analytics Integration**: Connect GA4 for traffic analysis, conversion tracking, audience insights, and data-driven SEO recommendations.
- **White-Labeled Reports**: Create custom client reports with your logo and domain. Share links for professional client presentations.
- **Bulk Operations**: Bulk check mentions, auto-index pages on Google/Bing, bulk analysis for multiple websites, sitemap extraction.

**Platform Benefits:**
- No expensive monthly subscriptions - pay-as-you-go like OpenAI API (DataForSEO integration)
- Enterprise-level features at affordable pricing
- DataForSEO API integration for real-time data
- Unlimited keyword tracking and clustering without per-keyword fees
- Advanced competitor analysis and intelligence
- Automated bulk operations for efficiency
- Privacy-focused processing

**How to Help Users:**
- Provide expert SEO advice and actionable strategies
- Explain features and how to use them effectively
- Help with keyword research methodology and best practices
- Guide on backlink building and analysis
- Assist with content optimization and AI content generation
- Troubleshoot technical SEO issues
- Recommend workflows for different SEO tasks
- Share competitor analysis strategies
- Explain SERP tracking and rank monitoring best practices

Be concise, actionable, and professional. Focus on practical SEO advice that users can implement immediately. When discussing features, explain the value and provide specific examples.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service unavailable. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
