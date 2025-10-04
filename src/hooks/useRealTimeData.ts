import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { errorHandler } from '@/lib/errorHandler';
import { cache, CACHE_KEYS } from '@/lib/cache';

interface UseRealTimeDataOptions {
  table: string;
  projectId?: string;
  userId?: string;
  filters?: Record<string, unknown>;
  enabled?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
}

interface UseRealTimeDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  subscribe: () => void;
  unsubscribe: () => void;
  isSubscribed: boolean;
  lastUpdated: Date | null;
}

export function useRealTimeData<T = unknown>(
  options: UseRealTimeDataOptions
): UseRealTimeDataReturn<T> {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const {
    table,
    projectId,
    userId,
    filters = {},
    enabled = true,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
  } = options;

  const channelRef = useRef<unknown>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!user || !enabled) return;

    try {
      setLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      let query = supabase.from(table).select('*');
      
      // Apply filters
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'string' && value.includes('%')) {
            query = query.ilike(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      const { data: fetchedData, error: fetchError } = await query;

      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setData(fetchedData || []);
      setLastUpdated(new Date());

      // Cache the data if cacheKey is provided
      if (cacheKey) {
        cache.set(cacheKey, fetchedData || [], cacheTTL);
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      errorHandler.handle(err, { table, projectId, userId, filters });
    } finally {
      setLoading(false);
    }
  }, [user, enabled, table, projectId, userId, filters, cacheKey, cacheTTL]);

  const subscribe = useCallback(() => {
    if (!user || !enabled || isSubscribed) return;

    const channelName = `realtime-${table}-${projectId || userId || 'global'}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: projectId ? `project_id=eq.${projectId}` : 
                  userId ? `user_id=eq.${userId}` : undefined,
        },
        (payload) => {
          console.log(`Real-time update for ${table}:`, payload);
          
          setData((prevData) => {
            let newData = [...prevData];
            
            switch (payload.eventType) {
              case 'INSERT':
                newData.unshift(payload.new as T);
                break;
              case 'UPDATE':
                newData = newData.map((item: Record<string, unknown>) =>
                  item.id === payload.new.id ? payload.new : item
                );
                break;
              case 'DELETE':
                newData = newData.filter((item: Record<string, unknown>) => item.id !== payload.old.id);
                break;
            }
            
            return newData;
          });
          
          setLastUpdated(new Date());
          
          // Update cache if cacheKey is provided
          if (cacheKey) {
            cache.delete(cacheKey);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${table}:`, status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });

  }, [user, enabled, isSubscribed, table, projectId, userId, cacheKey]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsSubscribed(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    if (!user || !enabled) return;

    // Try to get data from cache first
    if (cacheKey && cache.has(cacheKey)) {
      const cachedData = cache.get<T[]>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
      }
    }

    fetchData();
  }, [fetchData, user, enabled, cacheKey]);

  // Set up subscription
  useEffect(() => {
    if (!user || !enabled) return;

    // Small delay to ensure data is fetched first
    const timer = setTimeout(() => {
      subscribe();
    }, 1000);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [subscribe, unsubscribe, user, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribe();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [unsubscribe]);

  return {
    data,
    loading,
    error,
    refetch,
    subscribe,
    unsubscribe,
    isSubscribed,
    lastUpdated,
  };
}

// Specialized hooks for common use cases
export function useProjects() {
  return useRealTimeData({
    table: 'seo_projects',
    cacheKey: CACHE_KEYS.PROJECTS,
    cacheTTL: 10 * 60 * 1000, // 10 minutes
  });
}

export function useKeywords(projectId: string, filters?: Record<string, unknown>) {
  return useRealTimeData({
    table: 'serp_rankings',
    projectId,
    filters,
    cacheKey: `${CACHE_KEYS.KEYWORDS(projectId)}:${JSON.stringify(filters)}`,
    cacheTTL: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAnalytics(projectId: string, filters?: Record<string, unknown>) {
  return useRealTimeData({
    table: 'gsc_analytics',
    projectId,
    filters,
    cacheKey: `${CACHE_KEYS.ANALYTICS(projectId)}:${JSON.stringify(filters)}`,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCompetitors(projectId: string) {
  return useRealTimeData({
    table: 'competitor_analysis',
    projectId,
    cacheKey: CACHE_KEYS.COMPETITORS(projectId),
    cacheTTL: 15 * 60 * 1000, // 15 minutes
  });
}

export function useBacklinks(projectId: string) {
  return useRealTimeData({
    table: 'backlink_data',
    projectId,
    cacheKey: CACHE_KEYS.BACKLINKS(projectId),
    cacheTTL: 30 * 60 * 1000, // 30 minutes
  });
}

export function useAIRecommendations(projectId: string) {
  return useRealTimeData({
    table: 'ai_recommendations',
    projectId,
    cacheKey: CACHE_KEYS.AI_RECOMMENDATIONS(projectId),
    cacheTTL: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for subscribing to multiple tables
// Note: This function has been disabled due to React Hooks rules
// Hooks cannot be called inside loops or conditionally
// Use individual useRealTimeData calls instead
export function useMultipleRealTimeData<T>(
  _subscriptions: Array<UseRealTimeDataOptions & { key: string }>
): Record<string, UseRealTimeDataReturn<T>> {
  console.warn('useMultipleRealTimeData is deprecated. Use individual useRealTimeData hooks instead.');
  return {};
}
