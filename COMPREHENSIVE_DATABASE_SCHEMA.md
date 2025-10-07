# Comprehensive SEO Platform Database Schema

## Overview

This document outlines the complete database schema for the AnotherSEOGuru SaaS platform. The schema supports all modules including AI-powered features, enterprise tools, analytics, and comprehensive SEO functionality.

## Core Tables

### User Management
- **profiles** - User profile information and plan types
- **subscriptions** - Stripe subscription management
- **usage_tracking** - API usage and credit tracking

### Project Management
- **seo_projects** - Main SEO project containers
- **user_settings** - User preferences and configurations
- **api_keys** - External API key management

## SEO Core Tables

### Keyword Research & Tracking
- **keyword_analysis** - Keyword research data from DataForSEO
- **keyword_clusters** - Grouped keywords by topic similarity
- **keyword_tracking** - Rank tracking data over time
- **serp_rankings** - SERP position tracking
- **keyword_opportunities** - Prioritized keyword opportunities

### SERP Analysis
- **serp_tracker** - SERP tracking configurations
- **serp_monitoring** - Real-time SERP monitoring
- **serp_alerts** - SERP change notifications
- **serp_feature_analysis** - SERP feature optimization analysis
- **serp_optimization_recommendations** - AI-powered SERP optimization suggestions

### Competitor Analysis
- **competitor_analysis** - Competitor research data
- **competitor_intelligence** - Detailed competitor intelligence
- **competitor_content_gaps** - Content gap analysis

### Content Management
- **content_history** - Content creation and optimization history
- **content_calendar** - Editorial calendar management
- **content_calendar_items** - Detailed calendar items
- **content_strategies** - AI-generated content strategies
- **content_pillars** - Content strategy pillars
- **content_scores** - Content quality scoring
- **content_optimization_history** - Content optimization tracking

### Technical SEO
- **technical_seo_audits** - Technical audit results
- **site_audit_scores** - Overall site health scores
- **page_seo_issues** - Individual page SEO issues
- **crawl_jobs** - Website crawling operations
- **crawled_pages** - Individual page crawl data
- **internal_links** - Internal link structure mapping
- **external_links** - External link tracking

### Backlink Management
- **backlink_analysis** - Backlink research and tracking
- **backlink_monitoring** - Backlink change monitoring

## AI & Machine Learning Tables

### Content Strategy AI
- **content_strategies** - AI-generated content strategies
- **content_pillars** - Strategy pillars and topics
- **content_calendar_items** - AI-scheduled content
- **competitor_content_gaps** - AI-identified content gaps

### Predictive Analytics
- **predictive_models** - ML model configurations
- **predictive_forecasts** - Prediction results and accuracy
- **ranking_predictions** - AI-powered ranking forecasts
- **content_performance_predictions** - Content performance predictions

### SERP Optimization AI
- **serp_feature_analysis** - AI analysis of SERP features
- **serp_optimization_recommendations** - AI optimization suggestions

### Search Intent Analysis
- **intent_analysis_sessions** - Search intent analysis sessions
- **intent_matches** - Query-to-intent matching results

### AI Overview Optimization
- **aio_optimization_attempts** - AI Overview optimization attempts

## Enterprise Features

### Query Wheel
- **query_wheel_sessions** - Enterprise keyword generation sessions

### Team Collaboration
- **team_members** - Team member management
- **collaboration_tasks** - Task assignment and tracking
- **team_activity_log** - Team activity monitoring

### White Label
- **white_label_clients** - Client management
- **white_label_report_templates** - Report template customization
- **white_label_reports** - Generated client reports

## Advanced Analytics

### Custom Dashboards
- **analytics_dashboards** - Custom dashboard configurations
- **analytics_widgets** - Dashboard widget definitions

### Cross-Channel Analytics
- **cross_channel_campaigns** - Multi-channel campaign tracking
- **cross_channel_performance** - Cross-channel performance data

### Revenue Attribution
- **revenue_attribution_models** - Attribution model configurations
- **revenue_attribution_data** - Revenue attribution tracking

## Internal Linking System (NEW)

### Core Internal Linking Tables
- **internal_linking_pages** - Crawled pages for internal linking analysis
- **internal_linking_keywords** - Extracted keywords with TF-IDF scores
- **internal_linking_opportunities** - Calculated link opportunities
- **internal_linking_analyses** - Analysis session tracking

### Supporting Tables
- **keyword_metrics** - Keyword volume and difficulty data
- **gsc_page_metrics** - Google Search Console performance data
- **internal_links** - Existing internal link structure

## Content Repurposing System

### Repurposing Workflow
- **content_repurposing_sessions** - Repurposing session management
- **repurposed_content** - Generated repurposed content

## Multi-Location SEO

### Location Management
- **multi_location_projects** - Multi-location project configurations
- **multi_location_rankings** - Location-specific ranking data

## Public Research

### Research Sessions
- **public_research_sessions** - Public research session management
- **public_research_results** - Research result storage

## Integration Tables

### Google Services
- **google_api_settings** - Google API credentials per project
- **gsc_analytics** - Google Search Console data cache
- **ga4_analytics** - Google Analytics 4 data cache

### External APIs
- **jobs** - Background job queue for API operations

## Data Processing

### Crawling & Scraping
- **crawl_jobs** - Website crawl job management
- **crawled_pages** - Individual page data from crawls

### Analysis Results
- **seo_analysis_results** - AI-generated SEO analysis results
- **algorithm_drops** - Detected algorithm impact tracking
- **ai_recommendations** - AI-generated actionable recommendations
- **performance_snapshots** - Before/after performance tracking

## Key Features Supported

### 1. Advanced Tokenization & TF-IDF
- Sophisticated keyword extraction with mathematical scoring
- Document frequency and term frequency calculations
- Relevance scoring and filtering

### 2. Mathematical Scoring Algorithms
- Keyword opportunity scoring
- Page opportunity scoring
- Priority ranking algorithms
- Traffic lift estimation

### 3. Real-Time Data Integration
- DataForSEO Keywords API integration
- Google Search Console API integration
- Firecrawl website crawling
- Real-time SERP monitoring

### 4. AI-Powered Features
- Content strategy generation
- Predictive analytics
- SERP feature optimization
- Search intent matching
- AI Overview optimization

### 5. Enterprise Collaboration
- Team member management
- Task assignment and tracking
- Activity monitoring
- White label reporting

### 6. Advanced Analytics
- Custom dashboard creation
- Cross-channel campaign tracking
- Revenue attribution modeling
- Multi-location SEO tracking

## Security & Performance

### Row Level Security (RLS)
- All tables have RLS enabled
- User-based data isolation
- Project-based access control
- Team-based permissions

### Performance Optimization
- Comprehensive indexing strategy
- Foreign key relationship optimization
- Composite indexes for complex queries
- Query optimization functions

### Data Integrity
- Foreign key constraints
- Check constraints for data validation
- Unique constraints where appropriate
- Cascade delete policies

## Helper Functions

### Mathematical Calculations
- `calculate_tf_idf()` - TF-IDF calculation
- `calculate_keyword_score()` - Keyword opportunity scoring
- `calculate_page_score()` - Page opportunity scoring
- `predict_keyword_ranking()` - AI-powered ranking prediction

### Business Logic
- `calculate_content_strategy_roi()` - ROI calculation
- `get_team_performance_metrics()` - Team performance analysis
- `get_page_keywords()` - Page keyword extraction

## API Integration Points

### External APIs Supported
- **DataForSEO** - Keyword research, SERP data
- **Google Search Console** - Performance data
- **Google Analytics 4** - Traffic analytics
- **Firecrawl** - Website crawling
- **Lovable AI Gateway** - AI content generation
- **Stripe** - Payment processing

### Internal APIs
- **Supabase Edge Functions** - Serverless backend processing
- **Real-time subscriptions** - Live data updates
- **Background jobs** - Async processing

## Scalability Considerations

### Database Design
- Normalized schema for data integrity
- Denormalized views for performance
- Partitioning strategies for large tables
- Archive strategies for historical data

### Performance Monitoring
- Query performance tracking
- Index usage monitoring
- Connection pooling
- Caching strategies

This comprehensive schema supports all features of the AnotherSEOGuru platform, from basic SEO tracking to advanced AI-powered content strategy generation and enterprise collaboration tools.
