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
    const { keywords, projectId } = await req.json();

    if (!keywords || keywords.length === 0) {
      throw new Error("No keywords provided");
    }

    console.log(`Clustering ${keywords.length} keywords for project ${projectId}`);

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Step 1: Get embeddings for all keywords
    console.log("Generating embeddings...");
    const embeddings = await generateEmbeddings(keywords, lovableApiKey);

    // Step 2: Perform clustering using similarity
    console.log("Performing clustering...");
    const clusters = performClustering(keywords, embeddings);

    // Step 3: Generate labels for clusters using AI
    console.log("Generating cluster labels...");
    const labeledClusters = await generateClusterLabels(clusters, lovableApiKey);

    // Step 4: Store clusters in database if projectId provided
    if (projectId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      console.log("Storing clusters in database...");
      for (const cluster of labeledClusters) {
        await supabase.from("keyword_clusters").insert({
          project_id: projectId,
          cluster_name: cluster.name,
          cluster_label: cluster.label,
          keywords: cluster.keywords,
          center_keyword: cluster.centerKeyword,
        });
      }
    }

    console.log(`Successfully created ${labeledClusters.length} clusters`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        clusters: labeledClusters,
        totalClusters: labeledClusters.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Clustering error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateEmbeddings(keywords: string[], apiKey: string): Promise<number[][]> {
  const embeddings: number[][] = [];

  // Process in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize);
    
    for (const keyword of batch) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "text-embedding-004",
            input: keyword,
          }),
        });

        if (!response.ok) {
          console.error(`Embedding failed for "${keyword}":`, response.statusText);
          // Use zero vector as fallback
          embeddings.push(new Array(768).fill(0));
          continue;
        }

        const data = await response.json();
        embeddings.push(data.data[0].embedding);
      } catch (error) {
        console.error(`Error generating embedding for "${keyword}":`, error);
        embeddings.push(new Array(768).fill(0));
      }
    }
  }

  return embeddings;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function performClustering(
  keywords: string[],
  embeddings: number[][]
): Array<{ keywords: string[]; centerKeyword: string }> {
  const clusters: Array<{ keywords: string[]; centerKeyword: string }> = [];
  const assigned = new Set<number>();
  const threshold = 0.75; // Similarity threshold for clustering

  for (let i = 0; i < keywords.length; i++) {
    if (assigned.has(i)) continue;

    const cluster: string[] = [keywords[i]];
    assigned.add(i);

    // Find similar keywords
    for (let j = i + 1; j < keywords.length; j++) {
      if (assigned.has(j)) continue;

      const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
      if (similarity >= threshold) {
        cluster.push(keywords[j]);
        assigned.add(j);
      }
    }

    clusters.push({
      keywords: cluster,
      centerKeyword: keywords[i], // First keyword as center
    });
  }

  return clusters;
}

async function generateClusterLabels(
  clusters: Array<{ keywords: string[]; centerKeyword: string }>,
  apiKey: string
): Promise<Array<{ name: string; label: string; keywords: string[]; centerKeyword: string }>> {
  const labeled = [];

  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    
    try {
      // Generate a semantic label using AI
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are a semantic clustering expert. Generate a short, descriptive label (2-4 words) that captures the semantic theme of the given keywords. Respond with ONLY the label, nothing else."
            },
            {
              role: "user",
              content: `Keywords: ${cluster.keywords.join(", ")}\n\nGenerate a semantic label:`
            }
          ],
          max_completion_tokens: 20,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const label = data.choices[0].message.content.trim();
        
        labeled.push({
          name: `Cluster ${i + 1}`,
          label,
          keywords: cluster.keywords,
          centerKeyword: cluster.centerKeyword,
        });
      } else {
        // Fallback label
        labeled.push({
          name: `Cluster ${i + 1}`,
          label: cluster.centerKeyword,
          keywords: cluster.keywords,
          centerKeyword: cluster.centerKeyword,
        });
      }
    } catch (error) {
      console.error("Label generation error:", error);
      labeled.push({
        name: `Cluster ${i + 1}`,
        label: cluster.centerKeyword,
        keywords: cluster.keywords,
        centerKeyword: cluster.centerKeyword,
      });
    }
  }

  return labeled;
}
