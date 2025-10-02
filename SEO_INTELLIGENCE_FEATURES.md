# SEO Intelligence Engine - Complete Implementation Guide

## Overview

The SEO Intelligence Engine is a comprehensive AI-powered system that analyzes content using Google Search Console data, DataForSEO intelligence, and cutting-edge LLM models to provide detailed, actionable SEO recommendations.

## Features Implemented

### 1. **Database Schema**
Located in: `supabase/migrations/20251002120000_create_seo_intelligence_tables.sql`

New tables created:
- `seo_analysis_results` - Stores complete analysis results with optimization scores
- `algorithm_drops` - Tracks detected ranking declines and algorithm impacts
- `content_optimization_history` - Records optimization changes and ROI
- `competitor_intelligence` - SERP competitor data from DataForSEO
- `keyword_opportunities` - Prioritized keyword opportunities from GSC + DataForSEO
- `ai_recommendations` - Detailed AI-generated action plans with status tracking
- `performance_snapshots` - Before/after performance metrics

All tables include:
- Row Level Security (RLS) enabled
- User-based access control policies
- Proper indexing for performance
- JSONB columns for flexible data storage

### 2. **Edge Function: seo-intelligence-analyzer**
Located in: `supabase/functions/seo-intelligence-analyzer/index.ts`

Capabilities:
- **GSC Data Processing**: Fetches and analyzes Google Search Console data for URLs
- **Algorithm Drop Detection**: Identifies sudden ranking drops and correlates with known updates
- **DataForSEO Integration**: Pulls keyword intelligence and SERP competitor data
- **Keyword Opportunity Identification**: Finds quick wins (positions 11-20) and recovery opportunities
- **AI Analysis**: Uses Gemini 2.5 Flash (configurable) for comprehensive SEO analysis
- **Detailed Recommendations**: Generates step-by-step action plans with impact scores
- **Optimization Scoring**: Calculates overall content optimization score (0-100)
- **Data Persistence**: Stores all results in Supabase for historical tracking

### 3. **UI Components**

#### GSCDataAnalyzer (`src/components/seo-intelligence/GSCDataAnalyzer.tsx`)
- Summary cards showing total keywords, clicks, impressions, average position
- Keyword trend visualization (improving/declining/stable)
- Position history charts using Recharts
- Top performing keywords table with detailed metrics
- Trend indicators and position change tracking

#### AlgorithmDropDetector (`src/components/seo-intelligence/AlgorithmDropDetector.tsx`)
- Alert system for detected ranking drops
- Severity badges (severe/high/moderate)
- Affected keywords display
- AI diagnosis explanations
- Recovery action recommendations with priority levels
- Impact metrics (traffic loss, position drop averages)
- Likely algorithm identification

#### KeywordOpportunities (`src/components/seo-intelligence/KeywordOpportunities.tsx`)
- Summary of total opportunities and traffic potential
- Three categories: Quick Wins, Recovery, High Potential
- Priority scoring system
- Progress bars showing position improvement needed
- Traffic potential estimates
- Recommended actions for each opportunity
- Quick win badges for page 2 keywords

#### AIRecommendations (`src/components/seo-intelligence/AIRecommendations.tsx`)
- Category filtering (Algorithm Recovery, Quick Wins, Content Optimization, Technical SEO)
- Priority badges (critical/high/medium/low)
- Impact scores and effort levels
- Detailed implementation steps
- Code examples for technical recommendations
- Related keywords integration
- Apply/Dismiss functionality
- Time estimates for implementation
- Traffic lift predictions

#### SEOIntelligenceDashboard (`src/components/seo-intelligence/SEOIntelligenceDashboard.tsx`)
- Main orchestration component
- One-click analysis trigger
- Real-time progress indicators
- Tabbed interface:
  - Overview: Summary and AI analysis
  - GSC Data: Performance metrics and trends
  - Drops: Algorithm impact detection
  - Opportunities: Keyword opportunities
  - AI Actions: Detailed recommendations
- Export functionality (JSON report download)
- Integration with parent components

### 4. **Repurpose Page Integration**
Updated: `src/pages/Repurpose.tsx`

New workflow step added:
1. Input (scrape/type/upload content)
2. Review (content structure analysis)
3. **SEO Intelligence (NEW)** - Comprehensive AI analysis
4. Generate (configure platforms)
5. Results (platform-optimized content)

Features:
- URL tracking from scraped content
- Automatic keyword extraction
- Recommendations applied to SEO settings
- Seamless flow between steps
- Toast notifications for user feedback

## Usage Flow

### For Users:

1. **Add Content**
   - Type, scrape from URL, or upload file
   - System captures URL if scraped

2. **Review Content**
   - See content structure
   - Get optimization tips

3. **Run SEO Intelligence Analysis**
   - Click "Run Comprehensive SEO Analysis"
   - System performs:
     - GSC data fetch (if URL matches project)
     - Algorithm drop detection
     - DataForSEO keyword research
     - SERP competitor analysis
     - AI-powered analysis using Gemini 2.5 Flash
   - Processing time: 30-60 seconds

4. **Review Results**
   - Overview tab: Summary and traffic impact
   - GSC Data tab: Historical performance
   - Drops tab: Algorithm issues
   - Opportunities tab: Keyword targets
   - AI Actions tab: Detailed recommendations

5. **Apply Recommendations**
   - Click "Apply Recommendation" to integrate keywords
   - Export full report as JSON
   - Continue to generation step with enhanced SEO data

6. **Generate Content**
   - AI recommendations pre-populate SEO settings
   - Enhanced keyword targeting
   - Platform-optimized content generation

### For Developers:

**Calling the Analysis Function:**
```typescript
const { data, error } = await supabase.functions.invoke("seo-intelligence-analyzer", {
  body: {
    userId: "user-uuid",
    projectId: "project-uuid", // optional
    content: "your content text",
    url: "https://example.com/page", // optional
    keywords: ["keyword1", "keyword2"], // optional
    llmModel: "gemini-2.5-flash", // optional, supports gpt-4, claude, gemini
  },
});
```

**Response Structure:**
```typescript
{
  success: true,
  analysisId: "uuid",
  optimizationScore: 75,
  gscData: {
    totalKeywords: 150,
    totalClicks: 1245,
    totalImpressions: 45200,
    avgPosition: 15.2,
    keywordStats: [...]
  },
  algorithmDrops: [...],
  keywordOpportunities: [...],
  recommendations: [...],
  aiAnalysis: {
    summary: "...",
    trafficImpact: 500,
    recommendations: [...]
  },
  competitorData: [...],
  processingTime: 45000
}
```

## LLM Model Support

Currently integrated with Lovable AI Gateway supporting:
- **Gemini 2.5 Flash** (default) - Fast, cost-effective
- **GPT-4** - Available via model parameter
- **Claude 3.5 Sonnet** - Available via model parameter

To change the model, pass `llmModel` parameter in the request.

## Algorithm Drop Detection Logic

The system detects drops by:
1. Comparing average positions day-over-day
2. Identifying drops > 5 positions as significant
3. Severity levels:
   - **Severe**: > 15 position drop
   - **High**: > 10 position drop
   - **Moderate**: > 5 position drop
4. Correlating with known Google update schedules
5. Generating recovery action plans

## Keyword Opportunity Identification

### Quick Wins
- Keywords ranking positions 11-20
- High traffic potential
- Easier to push to page 1

### Recovery Opportunities
- Keywords with declining trends (> 3 position drop)
- Previously ranking better
- Focused on regaining lost positions

### Priority Scoring
Calculated based on:
- Current position (closer to top = higher score)
- Click volume
- Impression volume
- Trend direction (declining gets priority)
- Traffic potential

## Optimization Score Calculation

The 0-100 score is based on:
- **Content Length** (20 points max): Longer, comprehensive content scores higher
- **Average Position** (30 points max): Better rankings increase score
- **Quick Win Opportunities** (20 points max): Fewer opportunities = better optimization
- **Heading Structure** (15 points max): Proper H1-H6 hierarchy
- **Internal/External Links** (10 points max): Presence of links
- **Keyword Density** (15 points max): Optimal 1-3% density

## Integration with Existing Features

### Google Search Console
- Pulls real performance data from `gsc_analytics` table
- Requires GSC connection in SEO Dashboard
- Analyzes up to 90 days of historical data

### DataForSEO
- Uses existing `dataforseo-research` function
- Gets keyword intelligence and search volume
- Pulls SERP competitor data

### SEO AI Chatbot
- Can reference analysis results in conversations
- Project context includes pending recommendations
- Personalized advice based on actual data

## Future Enhancements

Potential additions:
1. **Scheduled Automated Analysis**: Run weekly analyses automatically
2. **A/B Testing**: Test different optimizations
3. **Multi-Model Comparison**: Compare recommendations from different LLMs
4. **Bulk URL Analysis**: Analyze multiple pages simultaneously
5. **Custom Algorithm Calendar**: Track known Google update dates
6. **Competitor Tracking**: Monitor competitor changes over time
7. **ROI Dashboard**: Track actual traffic improvements from applied recommendations
8. **Integration with Content Generation**: Auto-apply recommendations to generated content
9. **Email Alerts**: Notify users of detected drops
10. **White-Label Reports**: PDF export with custom branding

## Performance Considerations

- **Analysis Time**: 30-60 seconds depending on data volume
- **GSC Data**: Limited by API rate limits (typically no issue for single requests)
- **LLM Costs**: ~$0.001-0.01 per analysis depending on model
- **Database**: Indexed for fast queries
- **Caching**: Consider implementing Redis cache for frequent analyses

## Security

All data access controlled by:
- Row Level Security on all tables
- User-based policies
- No cross-user data access
- Secure credential storage
- CORS headers properly configured

## Troubleshooting

**No GSC Data Showing:**
- Ensure GSC is connected in SEO Dashboard
- Verify project has URL that matches scraped URL
- Check `gsc_analytics` table has data for the URL

**Analysis Taking Too Long:**
- Normal range is 30-60 seconds
- Check DataForSEO API status
- Verify LLM API key is configured
- Monitor edge function logs

**No Recommendations Generated:**
- Ensure content is > 100 characters
- Check LLM API key is valid
- Review edge function logs for errors
- Verify AI response parsing logic

## API Keys Required

Environment variables needed:
- `LOVABLE_API_KEY` - For AI analysis
- DataForSEO credentials (already configured)
- Google OAuth credentials (for GSC)

## Conclusion

The SEO Intelligence Engine transforms the Repurpose page into a powerful SEO optimization tool by combining:
- Real performance data from Google Search Console
- Market intelligence from DataForSEO
- Cutting-edge AI analysis from top LLM models
- Actionable, prioritized recommendations
- Automated tracking and reporting

This creates a unique competitive advantage by connecting content creation directly to measurable SEO improvements.
