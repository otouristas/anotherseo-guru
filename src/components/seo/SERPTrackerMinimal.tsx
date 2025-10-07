import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Activity, 
  ArrowUp, 
  ArrowDown, 
  Eye,
  Calendar,
  Globe,
  Plus,
  Trash2,
  Edit
} from "lucide-react";

interface SERPTrackerProps {
  projectId: string;
}

interface KeywordRanking {
  id: string;
  keyword: string;
  position: number;
  url: string;
  date: string;
  project_id: string;
  clicks?: number;
  impressions?: number;
}

export default function SERPTracker({ projectId }: SERPTrackerProps) {
  const [rankings, setRankings] = useState<KeywordRanking[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ keyword: "", position: 0, url: "" });
  const { toast } = useToast();

  useEffect(() => {
    loadRankings();
  }, [projectId]);

  const loadRankings = async () => {
    try {
      const { data, error } = await supabase
        .from('keyword_analysis')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform keyword_analysis data to KeywordRanking format
      const transformedData = (data || []).map(item => ({
        id: item.id,
        keyword: item.keyword,
        position: 0, // Default position since current_position doesn't exist
        url: item.page_url || '',
        date: item.created_at,
        project_id: item.project_id,
        clicks: item.clicks || 0,
        impressions: item.impressions || 0
      }));
      
      setRankings(transformedData);
    } catch (error: any) {
      console.error('Error loading rankings:', error);
      toast({
        title: "Error loading rankings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('keyword_analysis')
        .insert({
          project_id: projectId,
          keyword: newKeyword.trim(),
          page_url: '',
          search_volume: 0,
          difficulty_score: 0,
          potential_score: 0,
          opportunity_type: 'informational',
          cluster_name: '',
          ai_recommendations: {}
        });

      if (error) throw error;

      setNewKeyword('');
      loadRankings();
      toast({
        title: "Keyword added successfully! ✅",
        description: `Added "${newKeyword}" to tracking`,
      });
    } catch (error: any) {
      console.error('Error adding keyword:', error);
      toast({
        title: "Error adding keyword",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRanking = async (id: string, updates: Partial<KeywordRanking>) => {
    try {
      const { error } = await supabase
        .from('keyword_analysis')
        .update({
          page_url: updates.url,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      loadRankings();
    } catch (error: any) {
      console.error('Error updating ranking:', error);
      toast({
        title: "Error updating ranking",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteRanking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('keyword_analysis')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadRankings();
      toast({
        title: "Ranking deleted",
        description: "Keyword ranking has been removed",
      });
    } catch (error: any) {
      console.error('Error deleting ranking:', error);
      toast({
        title: "Error deleting ranking",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPositionChange = (keyword: string) => {
    const keywordRankings = rankings.filter(r => r.keyword === keyword).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (keywordRankings.length < 2) return null;
    
    const latest = keywordRankings[0];
    const previous = keywordRankings[1];
    
    if (!latest.position || !previous.position) return null;
    
    return previous.position - latest.position;
  };

  const getChangeIcon = (change: number | null) => {
    if (change === null) return <Minus className="w-4 h-4 text-gray-400" />;
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getChangeColor = (change: number | null) => {
    if (change === null) return "text-gray-400";
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-400";
  };

  const uniqueKeywords = Array.from(new Set(rankings.map(r => r.keyword)));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Minimal Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">SERP Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor your keyword rankings and track SERP changes</p>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Enter keyword to track..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            className="w-64"
          />
          <Button 
            onClick={addKeyword} 
            disabled={loading || !newKeyword.trim()}
            className="px-6"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Add Keyword
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Minimal Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total Keywords</div>
          <div className="text-2xl font-semibold text-gray-900">{uniqueKeywords.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Avg. Position</div>
          <div className="text-2xl font-semibold text-gray-900">
            {rankings.length > 0 ? Math.round(rankings.reduce((sum, r) => sum + (r.position || 0), 0) / rankings.length) : 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Improvements</div>
          <div className="text-2xl font-semibold text-green-600">
            {rankings.filter(r => getPositionChange(r.keyword) && getPositionChange(r.keyword)! > 0).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Declines</div>
          <div className="text-2xl font-semibold text-red-600">
            {rankings.filter(r => getPositionChange(r.keyword) && getPositionChange(r.keyword)! < 0).length}
          </div>
        </div>
      </div>

      {/* Minimal Rankings Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Keyword Rankings ({uniqueKeywords.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Keyword</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Current Position</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Change</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">URL</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Last Updated</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uniqueKeywords.map((keyword) => {
                const latestRanking = rankings.filter(r => r.keyword === keyword).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                const change = getPositionChange(keyword);
                
                return (
                  <tr key={keyword} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{keyword}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{latestRanking?.position || 0}</span>
                        {latestRanking?.position && latestRanking.position <= 10 && (
                          <Badge className="bg-green-100 text-green-800">Top 10</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getChangeIcon(change)}
                        <span className={`text-sm font-medium ${getChangeColor(change)}`}>
                          {change !== null ? Math.abs(change) : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs truncate text-gray-600">
                        {latestRanking?.url || '-'}
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">
                      {latestRanking?.date ? new Date(latestRanking.date).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingKeyword(keyword);
                            setEditForm({
                              keyword: keyword,
                              position: latestRanking?.position || 0,
                              url: latestRanking?.url || ''
                            });
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRanking(latestRanking?.id || '')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Minimal Edit Modal */}
      {editingKeyword && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit Ranking</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingKeyword(null);
                    setEditForm({ keyword: "", position: 0, url: "" });
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Position</label>
                <Input
                  type="number"
                  value={editForm.position}
                  onChange={(e) => setEditForm(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">URL</label>
                <Input
                  value={editForm.url}
                  onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="Enter ranking URL..."
                  className="w-full"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => {
                    const latestRanking = rankings.filter(r => r.keyword === editingKeyword).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                    if (latestRanking) {
                      updateRanking(latestRanking.id, {
                        position: editForm.position,
                        url: editForm.url
                      });
                    }
                    setEditingKeyword(null);
                    setEditForm({ keyword: "", position: 0, url: "" });
                  }}
                  className="px-6"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingKeyword(null);
                    setEditForm({ keyword: "", position: 0, url: "" });
                  }}
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
