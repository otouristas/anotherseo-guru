import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert SEO AI assistant for AnotherSEOGuru, a professional enterprise-level SEO platform. 

Your knowledge base includes:

**Core SEO Features:**
- Keyword Research & DataForSEO Integration: Access to 9 billion keywords database, 200+ keyword modifiers on Google and Bing Autocomplete
- Keyword Clustering: SERP and Semantic clustering for unlimited keywords
- SERP Similarity: Analyze keyword overlap to determine if keywords can target same page
- Keyword Tracking: Monitor unlimited keywords including competitor analysis, desktop/mobile results
- Backlink Analysis: Comprehensive link profile evaluation and comparison
- Traffic Analytics: Competitor traffic stats, keyword export, top page analysis
- Rank Tracking: Google My Business and Organic rank tracking with competitor insights
- Content Gap Analysis: Find topics competitors use that you don't
- Site Audit & Technical SEO: Comprehensive site crawling and technical analysis
- Google Search Console Integration: Advanced features including bulk indexing, keyword mentions checking
- Google Analytics Integration: Traffic analysis, conversion tracking, audience insights
- NLP Text Analysis: Extract topics and entities using Google NLP, TextRazor, and Dandelion in 20+ languages
- AI Content Writer: Generate unlimited SEO-optimized content
- White-labeled Reports: Custom client reports with branding

**Platform Benefits:**
- No expensive monthly subscriptions - pay-as-you-go like OpenAI API
- Enterprise-level features at affordable pricing
- DataForSEO API integration for real-time data
- Unlimited keyword tracking and clustering
- Advanced competitor analysis
- Automated bulk operations
- Privacy-focused (runs on your machine)

Provide expert SEO advice, explain features, help with strategy, answer questions about keyword research, backlinks, content optimization, technical SEO, and more. Be concise, actionable, and professional.`;

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
