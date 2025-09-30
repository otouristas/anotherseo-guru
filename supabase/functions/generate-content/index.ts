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
    const { content, platforms, tone, style } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating content for platforms:', platforms);

    const generatedContent = [];

    for (const platform of platforms) {
      const systemPrompt = `You are a professional content writer specializing in ${platform} content. 
Your task is to adapt content for ${platform} while maintaining the core message but optimizing for the platform's style and audience.
Use a ${tone} tone and ${style} writing style.`;

      const userPrompt = getPlatformPrompt(platform, content, tone, style);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
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

function getPlatformPrompt(platform: string, content: string, tone: string, style: string): string {
  const prompts: Record<string, string> = {
    'seo-blog': `Transform this content into a comprehensive SEO-optimized blog post:
- Use proper heading hierarchy (H2, H3)
- Include relevant keywords naturally
- Add meta description suggestions
- Create engaging introduction and conclusion
- Aim for 800-1200 words
- Include internal linking suggestions

Original content:
${content}`,

    'medium': `Adapt this content for Medium readers:
- Start with a compelling hook
- Use personal storytelling elements
- Include relatable examples
- Break into digestible sections
- Add thought-provoking questions
- End with a memorable takeaway

Original content:
${content}`,

    'linkedin': `Transform this into a professional LinkedIn post:
- Start with attention-grabbing opening
- Use line breaks for readability
- Include professional insights
- Add 3-5 relevant hashtags
- End with a question to drive engagement
- Keep it under 1300 characters

Original content:
${content}`,

    'reddit': `Adapt this for Reddit discussion:
- Use conversational, authentic tone
- Break down into clear points
- Include relevant context
- Invite discussion and questions
- Avoid promotional language
- Keep it genuine and helpful

Original content:
${content}`,

    'quora': `Transform this into a Quora answer:
- Start with direct answer to implied question
- Provide expert insights
- Use clear structure with bullet points
- Back up with examples or data
- Keep it authoritative yet accessible
- End with actionable takeaway

Original content:
${content}`,

    'twitter': `Create a Twitter/X thread from this content:
- Break into 5-8 tweets
- Each tweet under 280 characters
- Use thread numbering (1/n)
- Start with hook tweet
- Include line breaks for readability
- End with CTA or question
- Add 2-3 relevant hashtags in final tweet

Original content:
${content}`
  };

  return prompts[platform] || `Adapt this content for ${platform}:\n\n${content}`;
}
