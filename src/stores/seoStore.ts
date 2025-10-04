import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface SEOProject {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'paused' | 'archived';
  createdAt: string;
  updatedAt: string;
  description?: string;
  keywords?: string[];
  competitors?: string[];
  settings?: {
    location: string;
    language: string;
    device: 'desktop' | 'mobile' | 'both';
  };
}

interface KeywordData {
  id: string;
  keyword: string;
  position: number;
  volume: number;
  difficulty: number;
  cpc: number;
  trend: 'up' | 'down' | 'stable';
  lastChecked: string;
  projectId: string;
  url?: string;
  serpFeatures?: string[];
}

interface Analytics {
  totalKeywords: number;
  avgPosition: number;
  totalTraffic: number;
  trafficChange: number;
  topKeywords: KeywordData[];
  worstKeywords: KeywordData[];
  newKeywords: KeywordData[];
  lostKeywords: KeywordData[];
}

interface SEOState {
  // Projects
  projects: SEOProject[];
  activeProject: SEOProject | null;
  
  // Keywords
  keywords: KeywordData[];
  keywordFilters: {
    search: string;
    positionRange: [number, number];
    volumeRange: [number, number];
    difficultyRange: [number, number];
    trend: 'all' | 'up' | 'down' | 'stable';
  };
  
  // Analytics
  analytics: Analytics;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // View Settings
  viewMode: 'grid' | 'table' | 'chart';
  sortBy: 'position' | 'volume' | 'difficulty' | 'trend' | 'keyword';
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setActiveProject: (project: SEOProject) => void;
  addProject: (project: Omit<SEOProject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<SEOProject>) => void;
  deleteProject: (id: string) => void;
  
  setKeywords: (keywords: KeywordData[]) => void;
  addKeyword: (keyword: KeywordData) => void;
  updateKeyword: (id: string, updates: Partial<KeywordData>) => void;
  deleteKeyword: (id: string) => void;
  updateKeywordFilters: (filters: Partial<SEOState['keywordFilters']>) => void;
  
  setAnalytics: (analytics: Partial<Analytics>) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  setViewMode: (mode: SEOState['viewMode']) => void;
  setSortBy: (sortBy: SEOState['sortBy']) => void;
  setSortOrder: (order: SEOState['sortOrder']) => void;
  
  // Computed getters
  getFilteredKeywords: () => KeywordData[];
  getProjectKeywords: (projectId: string) => KeywordData[];
  getKeywordStats: () => {
    total: number;
    avgPosition: number;
    top10: number;
    page1: number;
    improving: number;
    declining: number;
  };
}

export const useSEOStore = create<SEOState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        projects: [],
        activeProject: null,
        keywords: [],
        keywordFilters: {
          search: '',
          positionRange: [1, 100],
          volumeRange: [0, 10000],
          difficultyRange: [0, 100],
          trend: 'all',
        },
        analytics: {
          totalKeywords: 0,
          avgPosition: 0,
          totalTraffic: 0,
          trafficChange: 0,
          topKeywords: [],
          worstKeywords: [],
          newKeywords: [],
          lostKeywords: [],
        },
        isLoading: false,
        error: null,
        lastUpdated: null,
        viewMode: 'table',
        sortBy: 'position',
        sortOrder: 'asc',

        // Actions
        setActiveProject: (project) => set((state) => {
          state.activeProject = project;
        }),

        addProject: (projectData) => set((state) => {
          const newProject: SEOProject = {
            ...projectData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          state.projects.push(newProject);
          if (!state.activeProject) {
            state.activeProject = newProject;
          }
        }),

        updateProject: (id, updates) => set((state) => {
          const index = state.projects.findIndex(p => p.id === id);
          if (index !== -1) {
            state.projects[index] = {
              ...state.projects[index],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
            
            if (state.activeProject?.id === id) {
              state.activeProject = state.projects[index];
            }
          }
        }),

        deleteProject: (id) => set((state) => {
          state.projects = state.projects.filter(p => p.id !== id);
          state.keywords = state.keywords.filter(k => k.projectId !== id);
          if (state.activeProject?.id === id) {
            state.activeProject = state.projects[0] || null;
          }
        }),

        setKeywords: (keywords) => set((state) => {
          state.keywords = keywords;
          state.lastUpdated = new Date().toISOString();
          
          // Update analytics
          const analytics = get().getKeywordStats();
          state.analytics.totalKeywords = analytics.total;
          state.analytics.avgPosition = analytics.avgPosition;
        }),

        addKeyword: (keyword) => set((state) => {
          state.keywords.push(keyword);
          state.lastUpdated = new Date().toISOString();
        }),

        updateKeyword: (id, updates) => set((state) => {
          const index = state.keywords.findIndex(k => k.id === id);
          if (index !== -1) {
            state.keywords[index] = {
              ...state.keywords[index],
              ...updates,
              lastChecked: new Date().toISOString(),
            };
            state.lastUpdated = new Date().toISOString();
          }
        }),

        deleteKeyword: (id) => set((state) => {
          state.keywords = state.keywords.filter(k => k.id !== id);
          state.lastUpdated = new Date().toISOString();
        }),

        updateKeywordFilters: (filters) => set((state) => {
          state.keywordFilters = { ...state.keywordFilters, ...filters };
        }),

        setAnalytics: (analytics) => set((state) => {
          state.analytics = { ...state.analytics, ...analytics };
        }),

        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),

        setError: (error) => set((state) => {
          state.error = error;
        }),

        setViewMode: (mode) => set((state) => {
          state.viewMode = mode;
        }),

        setSortBy: (sortBy) => set((state) => {
          state.sortBy = sortBy;
        }),

        setSortOrder: (order) => set((state) => {
          state.sortOrder = order;
        }),

        // Computed getters
        getFilteredKeywords: () => {
          const { keywords, keywordFilters, sortBy, sortOrder } = get();
          
          const filtered = keywords.filter(keyword => {
            // Search filter
            if (keywordFilters.search && 
                !keyword.keyword.toLowerCase().includes(keywordFilters.search.toLowerCase())) {
              return false;
            }
            
            // Position range filter
            if (keyword.position < keywordFilters.positionRange[0] || 
                keyword.position > keywordFilters.positionRange[1]) {
              return false;
            }
            
            // Volume range filter
            if (keyword.volume < keywordFilters.volumeRange[0] || 
                keyword.volume > keywordFilters.volumeRange[1]) {
              return false;
            }
            
            // Difficulty range filter
            if (keyword.difficulty < keywordFilters.difficultyRange[0] || 
                keyword.difficulty > keywordFilters.difficultyRange[1]) {
              return false;
            }
            
            // Trend filter
            if (keywordFilters.trend !== 'all' && keyword.trend !== keywordFilters.trend) {
              return false;
            }
            
            return true;
          });
          
          // Sort
          filtered.sort((a, b) => {
            let aValue: unknown = a[sortBy];
            let bValue: unknown = b[sortBy];
            
            if (sortBy === 'keyword') {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }
            
            if (sortOrder === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
          
          return filtered;
        },

        getProjectKeywords: (projectId) => {
          return get().keywords.filter(k => k.projectId === projectId);
        },

        getKeywordStats: () => {
          const { keywords } = get();
          
          if (keywords.length === 0) {
            return {
              total: 0,
              avgPosition: 0,
              top10: 0,
              page1: 0,
              improving: 0,
              declining: 0,
            };
          }
          
          const total = keywords.length;
          const avgPosition = keywords.reduce((sum, k) => sum + k.position, 0) / total;
          const top10 = keywords.filter(k => k.position <= 10).length;
          const page1 = keywords.filter(k => k.position <= 20).length;
          const improving = keywords.filter(k => k.trend === 'up').length;
          const declining = keywords.filter(k => k.trend === 'down').length;
          
          return {
            total,
            avgPosition: Math.round(avgPosition * 10) / 10,
            top10,
            page1,
            improving,
            declining,
          };
        },
      })),
      {
        name: 'seo-store',
        partialize: (state) => ({
          projects: state.projects,
          activeProject: state.activeProject,
          keywordFilters: state.keywordFilters,
          viewMode: state.viewMode,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
        }),
      }
    ),
    {
      name: 'seo-store',
    }
  )
);
