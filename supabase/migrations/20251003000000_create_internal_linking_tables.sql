-- Internal Linking Analysis Tables
-- Created: October 03, 2025

-- Table for storing crawled pages and their content
CREATE TABLE internal_linking_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES seo_projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    content TEXT,
    markdown_content TEXT,
    word_count INTEGER DEFAULT 0,
    crawl_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    UNIQUE(project_id, url)
);

-- Table for storing extracted keywords with TF-IDF scores
CREATE TABLE internal_linking_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES seo_projects(id) ON DELETE CASCADE,
    page_id UUID NOT NULL REFERENCES internal_linking_pages(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    tf_idf_score DECIMAL(10, 6) NOT NULL,
    term_frequency INTEGER NOT NULL,
    document_frequency INTEGER NOT NULL,
    total_frequency INTEGER NOT NULL,
    is_relevant BOOLEAN DEFAULT false,
    extraction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_id, keyword)
);

-- Table for storing keyword metrics from DataForSEO
CREATE TABLE keyword_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES seo_projects(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    search_volume INTEGER DEFAULT 0,
    keyword_difficulty DECIMAL(5, 2) DEFAULT 0,
    cpc DECIMAL(8, 4) DEFAULT 0,
    competition_index DECIMAL(5, 2) DEFAULT 0,
    data_source TEXT DEFAULT 'dataforseo',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, keyword)
);

-- Table for storing GSC performance data
CREATE TABLE gsc_page_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES seo_projects(id) ON DELETE CASCADE,
    page_url TEXT NOT NULL,
    query TEXT,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(8, 4) DEFAULT 0,
    position DECIMAL(8, 2) DEFAULT 0,
    date DATE NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, page_url, query, date)
);

-- Table for storing internal link structure
CREATE TABLE internal_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES seo_projects(id) ON DELETE CASCADE,
    source_page_id UUID NOT NULL REFERENCES internal_linking_pages(id) ON DELETE CASCADE,
    target_page_id UUID NOT NULL REFERENCES internal_linking_pages(id) ON DELETE CASCADE,
    anchor_text TEXT,
    link_position INTEGER, -- Position in content (word count)
    link_context TEXT, -- Surrounding text
    is_follow BOOLEAN DEFAULT true,
    is_external BOOLEAN DEFAULT false,
    discovered_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_page_id, target_page_id, link_position)
);

-- Table for storing link opportunities and recommendations
CREATE TABLE internal_linking_opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES seo_projects(id) ON DELETE CASCADE,
    source_page_id UUID NOT NULL REFERENCES internal_linking_pages(id) ON DELETE CASCADE,
    target_page_id UUID NOT NULL REFERENCES internal_linking_pages(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    keyword_score DECIMAL(12, 2) NOT NULL,
    page_score DECIMAL(12, 2) NOT NULL,
    priority_score DECIMAL(15, 2) NOT NULL,
    suggested_anchor_text TEXT NOT NULL,
    link_context TEXT,
    estimated_traffic_lift INTEGER DEFAULT 0,
    implementation_status TEXT DEFAULT 'pending' CHECK (implementation_status IN ('pending', 'implemented', 'rejected', 'expired')),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    implemented_date TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Table for storing analysis sessions
CREATE TABLE internal_linking_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES seo_projects(id) ON DELETE CASCADE,
    analysis_name TEXT NOT NULL,
    total_pages_crawled INTEGER DEFAULT 0,
    total_keywords_extracted INTEGER DEFAULT 0,
    total_opportunities_found INTEGER DEFAULT 0,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed')),
    configuration JSONB DEFAULT '{}',
    results_summary JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX idx_internal_linking_pages_project_id ON internal_linking_pages(project_id);
CREATE INDEX idx_internal_linking_pages_url ON internal_linking_pages(url);
CREATE INDEX idx_internal_linking_keywords_project_id ON internal_linking_keywords(project_id);
CREATE INDEX idx_internal_linking_keywords_page_id ON internal_linking_keywords(page_id);
CREATE INDEX idx_internal_linking_keywords_tf_idf ON internal_linking_keywords(tf_idf_score DESC);
CREATE INDEX idx_keyword_metrics_project_id ON keyword_metrics(project_id);
CREATE INDEX idx_keyword_metrics_keyword ON keyword_metrics(keyword);
CREATE INDEX idx_gsc_page_metrics_project_id ON gsc_page_metrics(project_id);
CREATE INDEX idx_gsc_page_metrics_page_url ON gsc_page_metrics(page_url);
CREATE INDEX idx_internal_links_project_id ON internal_links(project_id);
CREATE INDEX idx_internal_links_source_page ON internal_links(source_page_id);
CREATE INDEX idx_internal_links_target_page ON internal_links(target_page_id);
CREATE INDEX idx_internal_linking_opportunities_project_id ON internal_linking_opportunities(project_id);
CREATE INDEX idx_internal_linking_opportunities_priority ON internal_linking_opportunities(priority_score DESC);
CREATE INDEX idx_internal_linking_analyses_project_id ON internal_linking_analyses(project_id);

-- RLS Policies
ALTER TABLE internal_linking_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_linking_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_page_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_linking_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_linking_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for internal_linking_pages
CREATE POLICY "Users can view their own internal linking pages" ON internal_linking_pages
    FOR SELECT USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own internal linking pages" ON internal_linking_pages
    FOR INSERT WITH CHECK (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own internal linking pages" ON internal_linking_pages
    FOR UPDATE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own internal linking pages" ON internal_linking_pages
    FOR DELETE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

-- RLS Policies for internal_linking_keywords
CREATE POLICY "Users can view their own internal linking keywords" ON internal_linking_keywords
    FOR SELECT USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own internal linking keywords" ON internal_linking_keywords
    FOR INSERT WITH CHECK (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own internal linking keywords" ON internal_linking_keywords
    FOR UPDATE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own internal linking keywords" ON internal_linking_keywords
    FOR DELETE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

-- RLS Policies for keyword_metrics
CREATE POLICY "Users can view their own keyword metrics" ON keyword_metrics
    FOR SELECT USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own keyword metrics" ON keyword_metrics
    FOR INSERT WITH CHECK (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own keyword metrics" ON keyword_metrics
    FOR UPDATE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own keyword metrics" ON keyword_metrics
    FOR DELETE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

-- RLS Policies for gsc_page_metrics
CREATE POLICY "Users can view their own GSC page metrics" ON gsc_page_metrics
    FOR SELECT USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own GSC page metrics" ON gsc_page_metrics
    FOR INSERT WITH CHECK (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own GSC page metrics" ON gsc_page_metrics
    FOR UPDATE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own GSC page metrics" ON gsc_page_metrics
    FOR DELETE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

-- RLS Policies for internal_links
CREATE POLICY "Users can view their own internal links" ON internal_links
    FOR SELECT USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own internal links" ON internal_links
    FOR INSERT WITH CHECK (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own internal links" ON internal_links
    FOR UPDATE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own internal links" ON internal_links
    FOR DELETE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

-- RLS Policies for internal_linking_opportunities
CREATE POLICY "Users can view their own internal linking opportunities" ON internal_linking_opportunities
    FOR SELECT USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own internal linking opportunities" ON internal_linking_opportunities
    FOR INSERT WITH CHECK (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own internal linking opportunities" ON internal_linking_opportunities
    FOR UPDATE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own internal linking opportunities" ON internal_linking_opportunities
    FOR DELETE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

-- RLS Policies for internal_linking_analyses
CREATE POLICY "Users can view their own internal linking analyses" ON internal_linking_analyses
    FOR SELECT USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own internal linking analyses" ON internal_linking_analyses
    FOR INSERT WITH CHECK (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own internal linking analyses" ON internal_linking_analyses
    FOR UPDATE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own internal linking analyses" ON internal_linking_analyses
    FOR DELETE USING (project_id IN (SELECT id FROM seo_projects WHERE user_id = auth.uid()));

-- Functions for internal linking analysis
CREATE OR REPLACE FUNCTION calculate_tf_idf(
    term_frequency INTEGER,
    document_frequency INTEGER,
    total_documents INTEGER
) RETURNS DECIMAL(10, 6) AS $$
BEGIN
    RETURN term_frequency * LN(total_documents::DECIMAL / GREATEST(document_frequency, 1));
END;
$$ LANGUAGE plpgsql;

-- Function to get top keywords for a page
CREATE OR REPLACE FUNCTION get_page_keywords(
    p_project_id UUID,
    p_page_id UUID,
    p_limit INTEGER DEFAULT 20
) RETURNS TABLE (
    keyword TEXT,
    tf_idf_score DECIMAL(10, 6),
    term_frequency INTEGER,
    search_volume INTEGER,
    keyword_difficulty DECIMAL(5, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ilk.keyword,
        ilk.tf_idf_score,
        ilk.term_frequency,
        COALESCE(km.search_volume, 0) as search_volume,
        COALESCE(km.keyword_difficulty, 0) as keyword_difficulty
    FROM internal_linking_keywords ilk
    LEFT JOIN keyword_metrics km ON ilk.project_id = km.project_id AND ilk.keyword = km.keyword
    WHERE ilk.project_id = p_project_id 
    AND ilk.page_id = p_page_id
    ORDER BY ilk.tf_idf_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate keyword opportunity score
CREATE OR REPLACE FUNCTION calculate_keyword_score(
    search_volume INTEGER,
    impressions INTEGER,
    keyword_difficulty DECIMAL(5, 2),
    relevance_score DECIMAL(3, 2) DEFAULT 1.0
) RETURNS DECIMAL(12, 2) AS $$
BEGIN
    RETURN (search_volume::DECIMAL * impressions::DECIMAL) / 
           (GREATEST(keyword_difficulty, 1) + 1) * relevance_score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate page opportunity score
CREATE OR REPLACE FUNCTION calculate_page_score(
    impressions INTEGER,
    avg_position DECIMAL(8, 2),
    incoming_links INTEGER
) RETURNS DECIMAL(12, 2) AS $$
DECLARE
    ctr_potential DECIMAL(8, 4);
    rank_factor DECIMAL(8, 4);
BEGIN
    -- Estimate CTR potential based on position (simplified curve)
    ctr_potential := GREATEST(0.3 - (avg_position * 0.002), 0.01);
    
    -- Rank factor (lower position = better)
    rank_factor := GREATEST(1 - (avg_position / 100), 0.1);
    
    RETURN (impressions::DECIMAL * ctr_potential) / 
           (GREATEST(incoming_links, 1) + 1) * rank_factor;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE internal_linking_pages IS 'Stores crawled pages and their content for internal linking analysis';
COMMENT ON TABLE internal_linking_keywords IS 'Stores extracted keywords with TF-IDF scores for each page';
COMMENT ON TABLE keyword_metrics IS 'Stores keyword metrics from DataForSEO API';
COMMENT ON TABLE gsc_page_metrics IS 'Stores Google Search Console performance data';
COMMENT ON TABLE internal_links IS 'Stores discovered internal link structure';
COMMENT ON TABLE internal_linking_opportunities IS 'Stores calculated link opportunities and recommendations';
COMMENT ON TABLE internal_linking_analyses IS 'Stores analysis sessions and results';
