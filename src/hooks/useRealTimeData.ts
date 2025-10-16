import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { errorHandler } from '@/lib/errorHandler';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { safeQuery, getMockData } from '@/lib/databaseUtils';

interface UseRealTimeDataOptions {
  table: string;
  projectId?: string;
  userId?: string;
  filters?: Record<string, any>;
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

export function useRealTimeData<T = any>(
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

  const channelRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const FETCH_COOLDOWN = 2000; // 2 seconds cooldown between fetches

  const fetchData = useCallback(async () => {
    if (!user || !enabled) return;

    // Rate limiting: prevent excessive API calls
    const now = Date.now();
    if (now - lastFetchTimeRef.current < FETCH_COOLDOWN) {
      console.log(`Rate limited: skipping fetch for ${table}`);
      return;
    }
    lastFetchTimeRef.current = now;

    try {
      setLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Use safe query wrapper to handle missing tables
      const result = await safeQuery(table, async () => {
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

        return await query;
      });

      const { data: fetchedData, error: fetchError, tableExists } = result;

      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      if (fetchError) {
        // Handle table not found by using mock data for demo purposes
        if (!tableExists || fetchError.code === 'TABLE_NOT_FOUND') {
          console.warn(`Table ${table} not found, using mock data for demo`);
          const mockData = getMockData(table);
          setData(mockData);
          setLastUpdated(new Date());
          return;
        }
        
        // Don't throw for 404 errors - just log and return empty data
        if (fetchError.code === 'PGRST116' || fetchError.message.includes('404')) {
          console.warn(`Table ${table} not found or no data available`);
          setData([]);
          setLastUpdated(new Date());
          return;
        }
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
      
      // Don't spam error logs for expected database errors
      if (err instanceof Error && (err.message.includes('404') || err.message.includes('Failed to fetch') || err.message.includes('ERR_INSUFFICIENT_RESOURCES'))) {
        console.warn(`Database error for table ${table}:`, err.message);
        setData([]);
        setLastUpdated(new Date());
        return;
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
                newData = newData.map((item: any) =>
                  item.id === payload.new.id ? payload.new : item
                );
                break;
              case 'DELETE':
                newData = newData.filter((item: any) => item.id !== payload.old.id);
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

export function useKeywords(projectId: string, filters?: Record<string, any>) {
  return useRealTimeData({
    table: 'serp_rankings',
    projectId,
    filters,
    cacheKey: `${CACHE_KEYS.KEYWORDS(projectId)}:${JSON.stringify(filters)}`,
    cacheTTL: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAnalytics(projectId: string, filters?: Record<string, any>) {
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
// Removed invalid multi-hook aggregator to comply with Rules of Hooks
