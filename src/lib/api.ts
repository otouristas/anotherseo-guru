import { supabase } from '@/integrations/supabase/client';
import { cache, CACHE_KEYS, shortTermCache, longTermCache } from './cache';
import { errorHandler, NetworkError, AuthError, RateLimitError } from './errorHandler';

export interface APIResponse<T = unknown> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private requestTimeout = 30000; // 30 seconds

  constructor() {
    this.baseURL = import.meta.env.VITE_SUPABASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthError('Authentication failed');
        }
        if (response.status === 429) {
          throw new RateLimitError('Rate limit exceeded');
        }
        if (response.status >= 500) {
          throw new NetworkError('Server error');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError('Request timeout');
      }
      
      errorHandler.handle(error, { endpoint, options });
      throw error;
    }
  }

  // SEO-specific API methods
  async getProjects() {
    return cache.getOrSet(
      CACHE_KEYS.PROJECTS,
      async () => {
        const { data, error } = await supabase
          .from('seo_projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
      },
      10 * 60 * 1000 // 10 minutes cache
    );
  }

  async getProject(id: string) {
    return cache.getOrSet(
      CACHE_KEYS.PROJECT(id),
      async () => {
        const { data, error } = await supabase
          .from('seo_projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw new Error(error.message);
        return data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async createProject(projectData: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('seo_projects')
      .insert(projectData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    // Invalidate projects cache
    cache.delete(CACHE_KEYS.PROJECTS);
    
    return data;
  }

  async updateProject(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('seo_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    // Invalidate caches
    cache.delete(CACHE_KEYS.PROJECTS);
    cache.delete(CACHE_KEYS.PROJECT(id));
    
    return data;
  }

  async deleteProject(id: string) {
    const { error } = await supabase
      .from('seo_projects')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    
    // Invalidate caches
    cache.invalidatePrefix(`project:${id}`);
    cache.delete(CACHE_KEYS.PROJECTS);
  }

  async getKeywords(projectId: string, filters?: {
    search?: string;
    positionRange?: [number, number];
    volumeRange?: [number, number];
    difficultyRange?: [number, number];
    trend?: 'up' | 'down' | 'stable';
    limit?: number;
    offset?: number;
  }) {
    const cacheKey = `${CACHE_KEYS.KEYWORDS(projectId)}:${JSON.stringify(filters)}`;
    
    return shortTermCache.getOrSet(
      cacheKey,
      async () => {
        let query = supabase
          .from('serp_rankings')
          .select('*')
          .eq('project_id', projectId)
          .order('checked_at', { ascending: false });

        if (filters) {
          if (filters.search) {
            query = query.ilike('keyword', `%${filters.search}%`);
          }
          if (filters.positionRange) {
            query = query
              .gte('position', filters.positionRange[0])
              .lte('position', filters.positionRange[1]);
          }
          if (filters.volumeRange) {
            query = query
              .gte('volume', filters.volumeRange[0])
              .lte('volume', filters.volumeRange[1]);
          }
          if (filters.difficultyRange) {
            query = query
              .gte('difficulty', filters.difficultyRange[0])
              .lte('difficulty', filters.difficultyRange[1]);
          }
          if (filters.trend) {
            query = query.eq('trend', filters.trend);
          }
          if (filters.limit) {
            query = query.limit(filters.limit);
          }
          if (filters.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
          }
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);
        return data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async addKeyword(projectId: string, keywordData: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('serp_rankings')
      .insert({ ...keywordData, project_id: projectId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    // Invalidate keywords cache
    cache.invalidatePrefix(`keywords:${projectId}`);
    
    return data;
  }

  async updateKeyword(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('serp_rankings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    // Invalidate caches
    cache.invalidatePrefix(`keywords:${data.project_id}`);
    
    return data;
  }

  async deleteKeyword(id: string) {
    // Get project_id before deleting
    const { data: keyword } = await supabase
      .from('serp_rankings')
      .select('project_id')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('serp_rankings')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    
    // Invalidate cache
    if (keyword?.project_id) {
      cache.invalidatePrefix(`keywords:${keyword.project_id}`);
    }
  }

  async analyzeSEO(projectId: string, url: string, options?: {
    keywords?: string[];
    llmModel?: string;
    includeCompetitors?: boolean;
    includeBacklinks?: boolean;
  }) {
    const { data, error } = await supabase.functions.invoke('seo-intelligence-analyzer', {
      body: { 
        projectId, 
        url,
        ...options
      }
    });

    if (error) throw new Error(error.message);
    return data;
  }

  async getCompetitors(projectId: string) {
    return cache.getOrSet(
      CACHE_KEYS.COMPETITORS(projectId),
      async () => {
        const { data, error } = await supabase
          .from('competitor_analysis')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
      },
      15 * 60 * 1000 // 15 minutes cache
    );
  }

  async analyzeCompetitor(projectId: string, competitorDomain: string) {
    const { data, error } = await supabase.functions.invoke('competitor-analyzer', {
      body: {
        domain: competitorDomain,
        projectId
      }
    });

    if (error) throw new Error(error.message);
    return data;
  }

  async getBacklinks(projectId: string) {
    return cache.getOrSet(
      CACHE_KEYS.BACKLINKS(projectId),
      async () => {
        const { data, error } = await supabase
          .from('backlink_data')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
      },
      30 * 60 * 1000 // 30 minutes cache
    );
  }

  async getAnalytics(projectId: string, dateRange?: { from: string; to: string }) {
    const cacheKey = `${CACHE_KEYS.ANALYTICS(projectId)}:${JSON.stringify(dateRange)}`;
    
    return shortTermCache.getOrSet(
      cacheKey,
      async () => {
        let query = supabase
          .from('gsc_analytics')
          .select('*')
          .eq('project_id', projectId);

        if (dateRange) {
          query = query
            .gte('date', dateRange.from)
            .lte('date', dateRange.to);
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  // Real-time subscriptions
  subscribeToProjectUpdates(projectId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seo_projects',
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          // Invalidate cache when data changes
          cache.delete(CACHE_KEYS.PROJECT(projectId));
          cache.delete(CACHE_KEYS.PROJECTS);
          callback(payload);
        }
      )
      .subscribe();
  }

  subscribeToKeywordUpdates(projectId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel(`keywords-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'serp_rankings',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          // Invalidate cache when data changes
          cache.invalidatePrefix(`keywords:${projectId}`);
          callback(payload);
        }
      )
      .subscribe();
  }

  // Batch operations
  async batchUpdateKeywords(updates: Array<{ id: string; updates: Record<string, unknown> }>) {
    const promises = updates.map(({ id, updates }) => 
      this.updateKeyword(id, updates)
    );
    
    return Promise.allSettled(promises);
  }

  async batchAddKeywords(projectId: string, keywords: Array<Record<string, unknown>>) {
    const { data, error } = await supabase
      .from('serp_rankings')
      .insert(keywords.map(keyword => ({ ...keyword, project_id: projectId })))
      .select();

    if (error) throw new Error(error.message);
    
    // Invalidate cache
    cache.invalidatePrefix(`keywords:${projectId}`);
    
    return data;
  }

  // Utility methods
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/health');
      return true;
    } catch {
      return false;
    }
  }

  setRequestTimeout(timeout: number): void {
    this.requestTimeout = timeout;
  }

  clearCache(): void {
    cache.clear();
    shortTermCache.clear();
    longTermCache.clear();
  }

  getCacheStats() {
    return {
      main: cache.getStats(),
      shortTerm: shortTermCache.getStats(),
      longTerm: longTermCache.getStats(),
    };
  }
}

export const apiClient = new APIClient();

// Export convenience functions
export const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getKeywords,
  addKeyword,
  updateKeyword,
  deleteKeyword,
  analyzeSEO,
  getCompetitors,
  analyzeCompetitor,
  getBacklinks,
  getAnalytics,
  subscribeToProjectUpdates,
  subscribeToKeywordUpdates,
  batchUpdateKeywords,
  batchAddKeywords,
  healthCheck,
  clearCache,
  getCacheStats,
} = apiClient;
