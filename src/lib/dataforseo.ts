export type DFSTask<T> = {
  id?: string;
  result?: T;
};

export type DFSResponse<T> = {
  status_code: number;
  status_message: string;
  tasks?: Array<DFSTask<T>>;
};

const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dataforseo-proxy`;

export async function dfsPost<T>(path: string, payload: unknown): Promise<DFSResponse<T>> {
  const r = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, payload }),
  });
  
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`DFS ${r.status}: ${txt}`);
  }
  
  return r.json();
}

// Helper functions for common DataForSEO operations
export const dfsGoogleLiveAdvanced = (
  keyword: string, 
  location_code = 2840, 
  language_code = "en",
  depth = 20
) =>
  dfsPost<any>("/serp/google/live/advanced", {
    tasks: [{ keyword, location_code, language_code, depth }],
  });

export const dfsSearchVolumeLive = (
  keywords: string[], 
  location_code = 2840, 
  language_code = "en"
) =>
  dfsPost<any>("/keywords_data/google_ads/search_volume/live", {
    keywords, 
    location_code, 
    language_code,
  });

export const dfsRelatedKeywordsLive = (
  keywords: string[], 
  location_code = 2840, 
  language_code = "en",
  limit = 100
) =>
  dfsPost<any>("/keywords_data/google_ads/related_keywords/live", {
    keywords, 
    location_code, 
    language_code,
    limit,
  });

export const dfsLocations = () => 
  dfsPost<any>("/serp/google/locations", {});

export const dfsSerpEndpoints = () => 
  dfsPost<any>("/serp/endpoints", {});

export const dfsLabsCategories = () => 
  dfsPost<any>("/dataforseo_labs/categories", {});

export const dfsOnPageSummary = (url: string) =>
  dfsPost<any>("/on_page/summary", {
    tasks: [{ url }],
  });

export const dfsOnPageLinks = (url: string, limit = 100) =>
  dfsPost<any>("/on_page/links", {
    tasks: [{ url, limit }],
  });

export const dfsOnPageKeywords = (url: string, limit = 100) =>
  dfsPost<any>("/on_page/keywords", {
    tasks: [{ url, limit }],
  });
