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
    const { content, platforms, tone, style, seoData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating content for platforms:', platforms);

    const generatedContent = [];

    for (const platform of platforms) {
      const systemPrompt = getSystemPrompt(platform, tone, style);
      const userPrompt = getPlatformPrompt(platform, content, seoData);
      const model = getModelForPlatform(platform);

      console.log(`Using model ${model} for platform ${platform}`);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`AI generation error for ${platform}:`, error);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`AI API error: ${error}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content;

      generatedContent.push({
        platform,
        content: generatedText
      });
    }

    return new Response(
      JSON.stringify({ generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-content function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getModelForPlatform(platform: string): string {
  // Use Pro for complex SEO content
  if (platform === 'seo-blog') {
    return 'google/gemini-2.5-pro';
  }
  // Use lite for simple formats
  if (platform === 'twitter' || platform === 'instagram' || platform === 'tiktok') {
    return 'google/gemini-2.5-flash-lite';
  }
  // Use flash for everything else
  return 'google/gemini-2.5-flash';
}

function getSystemPrompt(platform: string, tone: string, style: string): string {
  const basePrompt = `You are a professional content writer specializing in ${platform} content optimization.
Your task is to adapt content for ${platform} while maintaining the core message but optimizing for the platform's style and audience.
Use a ${tone} tone and ${style} writing style.`;

  return basePrompt;
}

function getPlatformPrompt(platform: string, content: string, seoData: any): string {
  const anchorsText = seoData?.anchors?.length > 0 
    ? JSON.stringify(seoData.anchors) 
    : '[]';
  
  // Enhanced SEO context for data-driven prompts
  const seoContext = `
SEO Intelligence:
- Primary Keyword: "${seoData?.primaryKeyword || 'N/A'}"
- Secondary Keywords: ${seoData?.secondaryKeywords?.join(', ') || 'N/A'}
- Target Word Count: ${seoData?.targetWordCount || 800} words
- Anchor Links: ${anchorsText}

CRITICAL: Use these keywords naturally and strategically throughout the content. Consider search intent and user value.`;
  
  const prompts: Record<string, string> = {
    'seo-blog': `You are an expert SEO content writer trained in 2025 best practices. Rewrite the following content to be optimized for search engines, user experience, and E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).
${seoContext}

Original Content:
${content}

2025 SEO Requirements:
- Semantic keyword integration: Use primary + secondary keywords naturally, including LSI (Latent Semantic Indexing) variations
- Content structure: Logical H1 > H2 > H3 hierarchy with keyword-rich headings
- Featured snippet optimization: Include concise answers in first 2-3 paragraphs
- Internal linking: Naturally incorporate these anchor links: ${anchorsText}
- Meta tags: Generate SEO title (50-60 chars) + compelling meta description (140-160 chars)
- Word count: Target ${seoData?.targetWordCount || 800} words for topical authority
- E-E-A-T signals: Demonstrate expertise, include data/statistics, maintain authoritative tone
- User intent: Address searcher's query comprehensively
- Readability: Use short paragraphs (2-3 sentences), bullet points, and clear transitions
- Schema opportunities: Suggest FAQ, HowTo, or Article schema where applicable

Provide the fully optimized content with meta tags, headings, and strategic keyword placement.`,

    'medium': `You are a creative content writer specialized in Medium's storytelling format and algorithmic preferences for 2025.
${seoContext}

Original Content:
${content}

Medium Algorithm Optimization (2025):
- Hook: Start with a question, bold statement, or story that triggers curiosity
- Reading time: Aim for 5-8 minute read (1,400-2,000 words) for best distribution
- Subheadings: Use descriptive H2s every 3-4 paragraphs to improve scannability
- Keyword placement: Naturally use primary keyword in title, subtitle, first paragraph, and 2-3 H2s
- Internal linking: Weave in anchor links contextually: ${anchorsText}
- Visual breaks: Suggest image placements every 300-400 words
- Engagement signals: Include thought-provoking questions, relatable examples, or controversial angles
- Lists & formatting: Use numbered lists, bold key phrases, italics for emphasis
- Conclusion: End with actionable insight + open-ended question to drive comments
- SEO for Medium: Optimize for both Google and Medium's internal search

Provide a Medium article optimized for maximum distribution and engagement.`,

    'linkedin': `You are a LinkedIn content strategist specializing in high-engagement professional posts for 2025.
${seoContext}

Original Content:
${content}

LinkedIn Algorithm & Best Practices (2025):
- Hook (Line 1): Start with bold statement, question, or statistic that stops the scroll
- Post length: 1,300-2,000 characters for maximum reach (LinkedIn favors substantial posts)
- Formatting: Use single-line breaks, emojis sparingly (1-3 max), and white space strategically
- Storytelling: Use "I/we" perspective, personal anecdotes, or case studies for authenticity
- Keyword integration: Naturally use "${seoData?.primaryKeyword || 'N/A'}" for LinkedIn search visibility
- Value delivery: Provide 3-5 actionable insights, not just theory
- Link strategy: Include 1 link from ${anchorsText} (LinkedIn deprioritizes multi-link posts)
- Engagement triggers: End with thoughtful question or controversial (but professional) take
- Hashtags: Use 3-5 relevant hashtags at the end (including primary keyword variations)
- Call-to-action: Invite comments, shares, or connections
- Credibility signals: Reference data, experience, or results to establish authority

Provide a LinkedIn post formatted for maximum visibility and professional engagement.`,

    'reddit': `You are a community-savvy writer. Convert content into a Reddit post:

Original Content:
${content}

Requirements:
- Casual, peer-to-peer tone
- Start with a question or relatable hook
- Short paragraphs, easy to scan
- Keyword: "${seoData?.primaryKeyword || 'N/A'}"
- Insert links from ${anchorsText} only if natural (avoid spam)
- Add CTA to spark discussion
- Be authentic and helpful

Provide a Reddit-friendly post.`,

    'quora': `You are a knowledgeable expert on Quora. Rewrite content as an authoritative answer:

Original Content:
${content}

Requirements:
- Start with a clear, direct answer
- Structure with bullets or subheadings
- Authority-driven, concise tone
- Primary keyword: "${seoData?.primaryKeyword || 'N/A'}"
- Include links naturally: ${anchorsText}
- Back up claims with logic or examples
- Provide actionable takeaway

Provide a comprehensive Quora answer.`,

    'twitter': `You are a viral Twitter/X thread expert optimized for 2025's algorithm changes.
${seoContext}

Original Content:
${content}

Twitter/X Algorithm Optimization (2025):
- Hook tweet (1/n): Start with a bold claim, surprising fact, or pattern interrupt (aim for replies/retweets)
- Thread length: 7-10 tweets for best distribution (X favors longer threads in 2025)
- Character count: Use 200-250 characters per tweet (not maxing out improves readability)
- Formatting: Use line breaks, bullet points (•), and strategic emojis (1-2 per tweet)
- Keyword strategy: Include "${seoData?.primaryKeyword || 'N/A'}" in tweet 1 and 2-3 others for searchability
- Engagement hooks: Add questions, polls, or "RT if you agree" in middle tweets
- Link placement: Include link from ${anchorsText} in a dedicated tweet (not the hook)
- Visual suggestions: Recommend image/graphic placements for key tweets
- Hashtags: Use 1-2 specific hashtags max (X algorithm deprioritizes hashtag-heavy posts)
- Final CTA: End with question, poll, or "Follow for more" to drive engagement
- Numbering: Use 1/n format for each tweet

Provide a complete Twitter thread formatted for maximum viral potential and algorithmic favor.`,

    'instagram': `You are an Instagram content creator optimized for 2025's discovery and engagement algorithms.
${seoContext}

Original Content:
${content}

Instagram Algorithm Best Practices (2025):
- Hook (First Line): Must grab attention immediately (appears above "more" button)
- Caption length: 1,500-2,000 characters for best reach (Instagram favors substantial captions)
- Storytelling: Use first-person narrative, relatable situations, or transformation stories
- Formatting: Short paragraphs (1-2 sentences), strategic line breaks, and white space
- Emoji strategy: 5-10 relevant emojis throughout (not just decorative, but contextual)
- Keyword optimization: Use "${seoData?.primaryKeyword || 'N/A'}" in first 125 characters for search
- Value delivery: Include 3-5 actionable tips, insights, or lessons
- Link strategy: If using link from ${anchorsText}, mention "Link in bio" or "Link in story"
- Hashtags: Use 20-30 hashtags (mix of high, medium, low competition) AFTER caption, separated by line breaks
- Hashtag strategy: Include branded, niche, and primary keyword variations
- CTA: End with engaging question, "Save for later", "Tag someone who needs this", or "Share to your story"
- Alternative text suggestion: Provide alt text for accessibility and SEO

Provide a complete Instagram caption optimized for discovery, saves, and shares.`,

    'youtube': `Create YouTube video description from this content:

Original Content:
${content}

Requirements:
- Compelling first 2 lines (visible before "show more")
- Detailed description of video content
- Use "${seoData?.primaryKeyword || 'N/A'}" for SEO
- Include timestamps if applicable
- Add links naturally: ${anchorsText}
- Social media links section
- Relevant hashtags (3-5)
- Call to action (subscribe, comment, etc.)

Provide a complete YouTube description.`,

    'newsletter': `Create newsletter content from this content:

Original Content:
${content}

Requirements:
- Catchy subject line suggestion
- Personal greeting
- Clear sections with subheadings
- Conversational, friendly tone
- Use "${seoData?.primaryKeyword || 'N/A'}" naturally
- Include links: ${anchorsText}
- Add value with tips or insights
- Strong CTA
- Professional sign-off

Provide complete newsletter content.`,

    'tiktok': `Create TikTok video script from this content:

Original Content:
${content}

Requirements:
- Hook in first 3 seconds
- 30-60 second script
- Fast-paced, energetic delivery
- Use "${seoData?.primaryKeyword || 'N/A'}" naturally
- Include text overlay suggestions
- Trending sounds/music suggestions
- Call to action at the end
- 5-8 relevant hashtags

Provide a complete TikTok script.`
  };

  return prompts[platform] || `Adapt this content for ${platform}:\n\n${content}`;
}
