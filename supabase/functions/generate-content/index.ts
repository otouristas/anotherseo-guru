import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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
  // Format anchor links for prompt injection
  const anchorsText = seoData?.anchors?.length > 0 
    ? seoData.anchors.map((a: any) => `[${a.anchor}] -> ${a.url}`).join(', ')
    : 'none';
  
  // Format keywords
  const keywords = [seoData?.primaryKeyword, ...(seoData?.secondaryKeywords || [])]
    .filter(Boolean)
    .join(', ');
  
  const prompts: Record<string, string> = {
    'seo-blog': `Act as a Senior SEO & CRO Content Strategist. 
You will transform the provided content into a fully optimized blog article.

Guidelines:
- Target keyword(s): ${keywords || 'N/A'}
- Insert internal/external links with proper anchor text: ${anchorsText}
- Follow SEO structure: H1 (main keyword), H2 (supporting topics), H3 (FAQs).
- Optimize for Featured Snippets & People Also Ask.
- Add meta title (<= 60 chars) and meta description (<= 155 chars).
- Tone: authoritative, yet conversational.
- Format with bullet points, tables, and schema-ready FAQ sections.
- Target length: ${seoData?.targetWordCount || 800} words
- Include E-E-A-T signals (expertise, experience, authority, trustworthiness)
- Use semantic keyword variations and LSI keywords
- Suggest schema markup opportunities (FAQ, HowTo, Article)

Content: ${content}

Provide the fully optimized blog article with proper heading structure, meta tags, and strategic keyword placement.`,

    'medium': `You are an experienced Medium writer. 
Repurpose the content into a Medium-style post that is engaging and thought-provoking.

Guidelines:
- Use storytelling and personal tone
- Add strong intro hook (first 2 lines must stop scroll)
- Add subheadings every 300 words for scannability
- Include call-to-discussion at the end
- Subtle SEO, but prioritize shareability and readability
- Target keywords: ${keywords || 'N/A'}
- Weave in these links naturally: ${anchorsText}
- Use relevant Medium tags
- Reading time: 5-8 minutes (1,400-2,000 words)
- Include thought-provoking questions and relatable examples
- Use bold text and italics for emphasis

Content: ${content}

Provide a complete Medium article with engaging narrative flow.`,

    'linkedin': `You are a Senior LinkedIn Content Strategist. 
Rewrite the content into a LinkedIn post.

Guidelines:
- Start with a bold statement or question to hook
- Short paragraphs, max 3 lines each
- Use storytelling + insights
- Use emojis sparingly (max 2-3)
- Target keywords: ${keywords || 'N/A'}
- Include 1 link from: ${anchorsText}
- Post length: 1,300-2,000 characters for maximum reach
- Use "I/we" perspective for authenticity
- Provide 3-5 actionable insights
- End with a call to engage (ask readers to comment/share)
- Add 3-5 relevant hashtags at the end
- Include credibility signals (data, experience, results)

Content: ${content}

Provide a LinkedIn post optimized for maximum visibility and engagement.`,

    'reddit': `Act as a Senior Redditor who knows how to spark discussions and provide value. 
Rewrite the content for Reddit.

Guidelines:
- Avoid sounding like marketing; be authentic, transparent, and helpful
- Provide practical value, answer questions, or share a guide
- Use casual formatting (bullet points, bold text sparingly)
- End with an open-ended question to encourage comments
- Target keywords: ${keywords || 'N/A'}
- No external links in main body (suggest putting link in comments: ${anchorsText})
- Use peer-to-peer tone, conversational style
- Short paragraphs, easy to scan
- Be authentic and helpful, not promotional
- Start with a question or relatable hook

Content: ${content}

Provide a Reddit-friendly post that sparks genuine discussion.`,

    'quora': `Act as a Senior Thought Leader answering a Quora question. 
Repurpose the content into a Quora answer.

Guidelines:
- Start with a clear, direct answer
- Structure with bullets or subheadings
- Authority-driven, concise tone
- Target keywords: ${keywords || 'N/A'}
- Include links naturally: ${anchorsText}
- Back up claims with logic or examples
- Keep answer 500–800 words max
- Provide actionable takeaway
- Use data/statistics where possible
- Optimize for featured answers
- Include subtle CTA at the end

Content: ${content}

Provide a comprehensive Quora answer that demonstrates expertise.`,

    'twitter': `Act as a Senior Twitter Growth Expert. 
Repurpose the content into a high-impact Twitter thread.

Guidelines:
- Hook tweet = bold, curiosity-driven (max 240 chars)
- Break content into 7–10 short tweets (1 idea each)
- Target keywords: ${keywords || 'N/A'}
- Use thread numbering (1/n, 2/n, etc.)
- Character count: 200-250 per tweet for readability
- Use line breaks, bullet points (•), and strategic emojis (1-2 per tweet)
- Include link from ${anchorsText} in a dedicated tweet (not the hook)
- Add questions or "RT if you agree" in middle tweets
- Use 1-2 specific hashtags max
- End with CTA: "Follow for more" or engaging question
- Use conversational tone with authority

Content: ${content}

Provide a complete Twitter thread optimized for virality and engagement.`,

    'instagram': `Act as a Senior Instagram Content Strategist. 
Repurpose the content for Instagram posts and Reels.

Guidelines:
- Hook first slide/line: bold statement or question
- Use emojis, short sentences, high impact visual suggestions
- Include CTA: Save, Share, Comment
- Target keywords: ${keywords || 'N/A'}
- Caption length: 1,500-2,000 characters for best reach
- Use storytelling and first-person narrative
- Short paragraphs (1-2 sentences), strategic line breaks
- 5-10 relevant emojis throughout (contextual, not decorative)
- If carousel: suggest captions per slide (5-7 slides)
- If Reel: suggest narration script (30-60 seconds)
- Mention "Link in bio" if using: ${anchorsText}
- Add 20-30 hashtags at end (mix of high, medium, low competition)
- Include branded, niche, and keyword variation hashtags
- CTA: "Save this", "Tag someone", "Share to story"

Content: ${content}

Provide complete Instagram content (caption + hashtags + visual suggestions).`,

    'facebook': `Act as a Senior Facebook Content Strategist. 
Repurpose the content for Facebook posts and ads.

Guidelines:
- Tone: conversational, engaging, community-driven
- Post length: 80–150 words for feed; up to 300 for groups
- Include 1–2 questions or CTAs to encourage comments/shares
- Target keywords: ${keywords || 'N/A'}
- Incorporate links naturally: ${anchorsText}
- Include emojis subtly (max 2–3 per post)
- For ads: bold, curiosity-driven headline
- For ads: concise, benefit-focused description
- Use short paragraphs for mobile readability
- Include visual suggestions (image/video type)
- End with engaging question or CTA
- Optimize for shares and comments

Content: ${content}

Provide Facebook post optimized for engagement (specify if Feed, Group, or Ad format).`,

    'youtube': `Act as a Senior Video Content Strategist. 
Repurpose the content into a YouTube Short script.

Guidelines:
- Hook in first 5 seconds
- Duration: 45–60 seconds
- Break into intro, 3 key points, outro CTA
- Conversational & energetic tone
- Target keywords: ${keywords || 'N/A'}
- Include compelling description (first 2 lines visible before "show more")
- Add timestamps if applicable
- Include links: ${anchorsText}
- Add social media links section
- Use 3-5 relevant hashtags
- CTA: Subscribe or link in description
- Suggest B-roll, text overlays, visual ideas

Content: ${content}

Provide complete YouTube script + description optimized for engagement.`,

    'tiktok': `Act as a Senior TikTok Growth Content Strategist.
Repurpose the content into a TikTok script optimized for engagement.

Guidelines:
- Hook: first 3 seconds must grab attention
- Script length: 45–60 seconds (~100–150 words)
- Break content into short, punchy sentences suitable for captions & voiceover
- Suggest visual ideas per line: text overlays, B-roll, transitions, effects
- Target keywords: ${keywords || 'N/A'}
- Include CTA at end: Follow, Like, or Link in bio
- Suggest trending audio/music style
- Tone: energetic, relatable, entertaining, yet authoritative
- Use text overlay suggestions for key points
- Include hook variations (test A/B)
- Add 5-8 relevant hashtags

Content: ${content}

Provide complete TikTok script with visual suggestions and trending audio recommendations.`,

    'newsletter': `Act as a Senior Email Marketing Strategist.
Create newsletter content from this content.

Guidelines:
- Catchy subject line suggestion (<50 chars)
- Personal greeting
- Clear sections with subheadings
- Conversational, friendly tone
- Target keywords: ${keywords || 'N/A'}
- Include links naturally: ${anchorsText}
- Add value with tips or insights
- Strong CTA (clear next action)
- Professional sign-off
- P.S. section with extra value or urgency
- Mobile-friendly formatting (short paragraphs)
- Optimize for opens, clicks, and replies

Content: ${content}

Provide complete newsletter content with subject line, body, and CTA.`
  };

  return prompts[platform] || `Adapt this content for ${platform}:\n\n${content}`;
}
