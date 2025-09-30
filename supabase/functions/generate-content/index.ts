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
  
  const prompts: Record<string, string> = {
    'seo-blog': `You are an expert SEO content writer. Rewrite the following content so it is optimized for search engines and readability:

Original Content:
${content}

Requirements:
- Use primary keyword: "${seoData?.primaryKeyword || 'N/A'}" and secondary keywords "${seoData?.secondaryKeywords?.join(', ') || 'N/A'}".
- Logical heading structure: H1, H2, H3.
- Include anchor links naturally: ${anchorsText}
- Generate meta title (≤60 chars) + meta description (140–160 chars).
- Aim for ${seoData?.targetWordCount || 800} words.
- Professional, friendly tone.

Provide the rewritten content with proper SEO optimization, including the anchor links where they fit naturally.`,

    'medium': `You are a creative content writer skilled in Medium storytelling. Rewrite the content into a Medium post:

Original Content:
${content}

Requirements:
- Narrative, engaging opening hook
- Conversational tone with smooth transitions
- Natural keyword use: "${seoData?.primaryKeyword || 'N/A'}"
- Include anchor links naturally: ${anchorsText}
- Add pull-quotes or emphasis for key points
- Engaging conclusion with takeaway

Provide an engaging Medium-style article.`,

    'linkedin': `You are a thought-leadership writer for LinkedIn. Convert the content into a professional post:

Original Content:
${content}

Requirements:
- Hook/insight opening that grabs attention
- Professional but approachable tone
- Logical structure with clear sections
- Use "${seoData?.primaryKeyword || 'N/A'}" naturally
- Add anchor links where appropriate: ${anchorsText}
- Conclude with key takeaway + call-to-action
- Use line breaks for readability

Provide a LinkedIn post optimized for engagement.`,

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

    'twitter': `Create a Twitter/X thread from this content:

Original Content:
${content}

Requirements:
- Break into 5-8 tweets
- Each tweet under 280 characters
- Use thread numbering (1/n, 2/n, etc.)
- Start with attention-grabbing hook tweet
- Include line breaks for readability
- End with CTA or question
- Add 2-3 relevant hashtags in final tweet
- Use "${seoData?.primaryKeyword || 'N/A'}" naturally

Provide a complete Twitter thread.`,

    'instagram': `Create Instagram caption from this content:

Original Content:
${content}

Requirements:
- Engaging opening line that hooks followers
- 3-5 paragraph caption with line breaks
- Include storytelling or personal touch
- Use "${seoData?.primaryKeyword || 'N/A'}" naturally
- Add 15-25 relevant hashtags at the end
- Include emoji naturally (don't overdo it)
- End with call to action or question

Provide a complete Instagram caption.`,

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
