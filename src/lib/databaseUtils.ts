import { supabase } from '@/integrations/supabase/client';

interface TableCheckResult {
  exists: boolean;
  error?: string;
}

/**
 * Check if a table exists in the database
 */
export async function checkTableExists(tableName: string): Promise<TableCheckResult> {
  try {
    // Try to select from the table with a limit of 0 to check if it exists
    const { error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .limit(0);

    if (error) {
      // Check if it's a "table doesn't exist" error
      if (error.code === 'PGRST116' || 
          error.message.includes('relation') && error.message.includes('does not exist') ||
          error.message.includes('404')) {
        return { exists: false, error: error.message };
      }
      // Other errors might be permission issues, but table exists
      return { exists: true, error: error.message };
    }

    return { exists: true };
  } catch (err) {
    return { 
      exists: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Get a list of available tables for a user
 */
export async function getAvailableTables(): Promise<string[]> {
  try {
    // This is a simple approach - in a real app you might want to use
    // a dedicated endpoint that lists available tables
    const commonTables = [
      'seo_projects',
      'keyword_analysis', 
      'serp_rankings',
      'gsc_analytics',
      'competitor_analysis',
      'ai_recommendations',
      'crawl_results',
      'user_settings',
      'api_keys',
      'dataforseo_settings',
      'firecrawl_settings'
    ];

    const existingTables: string[] = [];
    
    for (const table of commonTables) {
      const result = await checkTableExists(table);
      if (result.exists) {
        existingTables.push(table);
      }
    }

    return existingTables;
  } catch (err) {
    console.error('Error checking available tables:', err);
    return [];
  }
}

/**
 * Safe query wrapper that handles missing tables gracefully
 */
export async function safeQuery<T>(
  tableName: string,
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any; tableExists: boolean }> {
  const tableCheck = await checkTableExists(tableName);
  
  if (!tableCheck.exists) {
    return {
      data: null,
      error: { message: `Table '${tableName}' does not exist`, code: 'TABLE_NOT_FOUND' },
      tableExists: false
    };
  }

  try {
    const result = await queryFn();
    return {
      ...result,
      tableExists: true
    };
  } catch (err) {
    return {
      data: null,
      error: err,
      tableExists: true
    };
  }
}

/**
 * Get mock data for missing tables (for development/demo purposes)
 */
export function getMockData(tableName: string): any[] {
  const mockData: Record<string, any[]> = {
    'keyword_analysis': [
      {
        id: 'mock-1',
        keyword: 'seo tools',
        search_volume: 12000,
        difficulty: 65,
        project_id: 'mock-project',
        created_at: new Date().toISOString()
      }
    ],
    'gsc_analytics': [
      {
        id: 'mock-1',
        clicks: 1250,
        impressions: 8500,
        ctr: 14.7,
        position: 8.5,
        project_id: 'mock-project',
        created_at: new Date().toISOString()
      }
    ],
    'serp_rankings': [
      {
        id: 'mock-1',
        keyword: 'seo analysis',
        position: 12,
        url: 'https://example.com/page',
        project_id: 'mock-project',
        checked_at: new Date().toISOString()
      }
    ],
    'ai_recommendations': [
      {
        id: 'mock-1',
        title: 'Improve page loading speed',
        description: 'Optimize images and reduce server response time',
        priority: 'high',
        confidence_score: 85,
        project_id: 'mock-project',
        created_at: new Date().toISOString()
      }
    ]
  };

  return mockData[tableName] || [];
}
