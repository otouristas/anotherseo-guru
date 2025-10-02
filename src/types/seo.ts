// SEO Project Types
export interface SEOProject {
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
  user_id: string;
}

// Keyword Data Types
export interface KeywordData {
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
  user_id: string;
}

// Analytics Types
export interface Analytics {
  totalKeywords: number;
  avgPosition: number;
  totalTraffic: number;
  trafficChange: number;
  topKeywords: KeywordData[];
  worstKeywords: KeywordData[];
  newKeywords: KeywordData[];
  lostKeywords: KeywordData[];
}

// Competitor Analysis Types
export interface CompetitorAnalysis {
  id: string;
  domain: string;
  projectId: string;
  avgPosition: number;
  totalKeywords: number;
  backlinksCount: number;
  domainAuthority: number;
  estimatedTraffic: number;
  contentGaps: string[];
  opportunities: string[];
  user_id: string;
  createdAt: string;
}

// Backlink Data Types
export interface BacklinkData {
  id: string;
  url: string;
  domain: string;
  projectId: string;
  anchorText: string;
  targetUrl: string;
  domainAuthority: number;
  pageAuthority: number;
  linkType: 'follow' | 'nofollow';
  discoveryDate: string;
  user_id: string;
}

// AI Recommendation Types
export interface AIRecommendation {
  id: string;
  projectId: string;
  analysisId: string;
  category: string;
  title: string;
  description: string;
  detailedSteps: string[];
  impactScore: number;
  effortLevel: 'low' | 'medium' | 'high';
  priorityLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedTrafficLift: number;
  implementationTimeHours: number;
  codeExamples: string[];
  beforeAfterExamples: Record<string, any>;
  relatedKeywords: string[];
  status: 'pending' | 'applied' | 'dismissed';
  appliedDate?: string;
  dismissedDate?: string;
  dismissalReason?: string;
  customNotes?: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

// SERP Analysis Types
export interface SERPAnalysis {
  id: string;
  keyword: string;
  projectId: string;
  position: number;
  title: string;
  description: string;
  url: string;
  domain: string;
  serpFeatures: {
    featuredSnippet: boolean;
    peopleAlsoAsk: boolean;
    relatedSearches: boolean;
    imagePack: boolean;
    videoCarousel: boolean;
    localPack: boolean;
  };
  user_id: string;
  analyzedAt: string;
}

// Content Analysis Types
export interface ContentAnalysis {
  id: string;
  url: string;
  projectId: string;
  content: string;
  wordCount: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  internalLinks: number;
  externalLinks: number;
  images: number;
  videos: number;
  user_id: string;
  analyzedAt: string;
}

// Technical Audit Types
export interface TechnicalAudit {
  id: string;
  url: string;
  projectId: string;
  pageSpeed: {
    desktop: number;
    mobile: number;
  };
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  mobileFriendly: boolean;
  https: boolean;
  metaTags: {
    title: string;
    description: string;
    keywords?: string;
  };
  structuredData: boolean;
  user_id: string;
  auditedAt: string;
}

// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  plan_type: 'free' | 'starter' | 'professional' | 'agency';
  credits: number;
  created_at: string;
  updated_at: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan_type: 'free' | 'starter' | 'professional' | 'agency';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface APIResponse<T = any> {
  data: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Types
export interface KeywordFilters {
  search: string;
  positionRange: [number, number];
  volumeRange: [number, number];
  difficultyRange: [number, number];
  trend: 'all' | 'up' | 'down' | 'stable';
}

export interface ProjectFilters {
  search: string;
  status: 'all' | 'active' | 'paused' | 'archived';
  sortBy: 'name' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface KeywordTrendData {
  date: string;
  position: number;
  keyword: string;
  volume: number;
  difficulty: number;
}

export interface TrafficData {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface PositionDistribution {
  name: string;
  value: number;
  color: string;
}

// Export all types
export type {
  SEOProject,
  KeywordData,
  Analytics,
  CompetitorAnalysis,
  BacklinkData,
  AIRecommendation,
  SERPAnalysis,
  ContentAnalysis,
  TechnicalAudit,
  UserProfile,
  Subscription,
  APIResponse,
  KeywordFilters,
  ProjectFilters,
  ChartDataPoint,
  KeywordTrendData,
  TrafficData,
  PositionDistribution,
};
