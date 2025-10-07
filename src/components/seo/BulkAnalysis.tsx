import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Play, 
  FileText, 
  Activity,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Search,
  Eye,
  MousePointerClick,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Globe,
  Target,
  Brain,
  MessageSquare,
  Clock,
  TrendingUp,
  Database,
  Layers,
  Filter,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAndTriggerJob } from "@/lib/jobHelpers";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';

interface BulkAnalysisProps {
  projectId: string;
}

export const BulkAnalysis = ({ projectId }: BulkAnalysisProps) => {
  const [analysisType, setAnalysisType] = useState<"backlinks" | "keywords" | "clustering">("keywords");
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  const parseInput = (): any[] => {
    const lines = inputText.split("\n").filter((line) => line.trim());
    
    if (analysisType === "keywords") {
      return lines.map((line) => {
        const parts = line.split(",");
        return {
          keyword: parts[0].trim(),
          location: parts[1]?.trim() || "2840", // Default US
        };
      });
    } else if (analysisType === "clustering") {
      return lines.map((line) => line.trim());
    } else {
      return lines.map((line) => ({
        domain: line.trim(),
      }));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to use bulk analysis.",
      });
      return;
    }

    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "Empty input",
        description: "Please provide at least one item to analyze.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const items = parseInput();

      // For clustering, use keyword_clustering job type directly
      const jobType = analysisType === "clustering" ? "keyword_clustering" : "bulk_analysis";
      const inputData = analysisType === "clustering"
        ? { keywords: items, projectId }
        : { items, analysisType, project_id: projectId };

      const job = await createAndTriggerJob({
        jobType: jobType as any,
        inputData,
        totalItems: items.length,
      });

      toast({
        title: "Bulk analysis started",
        description: `Processing ${items.length} items. Job ID: ${job.id.slice(0, 8)}...`,
      });

      // Navigate to jobs page
      navigate("/jobs");
    } catch (error: any) {
      console.error("Bulk analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const itemCount = inputText.split("\n").filter((l) => l.trim()).length;

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <CardHeader className="relative pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Bulk Analysis Engine
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Advanced bulk processing for keywords, backlinks, and clustering with intelligent data processing and analytics
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                {itemCount} Items Ready
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Bulk Analysis Dashboard */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Bulk Analysis Dashboard
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure and execute large-scale SEO analysis with advanced processing capabilities
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Database className="w-3 h-3 text-blue-500" />
              Processing Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="configure" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="configure" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Configure
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="configure" className="space-y-6">
              {/* Analysis Configuration */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column - Configuration */}
                <div className="space-y-6">
                  <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="w-5 h-5 text-blue-500" />
                        Analysis Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Analysis Type</Label>
                        <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="keywords">Keyword Research</SelectItem>
                            <SelectItem value="backlinks">Backlink Analysis</SelectItem>
                            <SelectItem value="clustering">Keyword Clustering</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Input Data</Label>
                        <Textarea
                          placeholder={
                            analysisType === "keywords"
                              ? "Enter one keyword per line, optionally with location code:\nkeyword1, 2840\nkeyword2\nkeyword3, 2826"
                              : analysisType === "clustering"
                              ? "Enter one keyword per line for semantic clustering:\nseo tools\nkeyword research\nbacklink analysis\nrank tracker"
                              : "Enter one domain per line:\nexample.com\ncompetitor.com\nanother-site.com"
                          }
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          rows={8}
                          className="font-mono text-sm resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {itemCount} items ready for processing
                          </p>
                          {itemCount > 0 && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {itemCount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Or Upload CSV/TXT File</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                          <Button variant="outline" asChild className="w-full h-12">
                            <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Choose File
                            </label>
                          </Button>
                        </div>
                      </div>

                      <Button 
                        onClick={handleSubmit} 
                        disabled={isProcessing || itemCount === 0} 
                        className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium"
                      >
                        {isProcessing ? (
                          <>
                            <Activity className="h-4 w-4 mr-2 animate-spin" />
                            Starting Analysis...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Start Bulk Analysis ({itemCount} items)
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Processing Information */}
                  <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-green-500" />
                        Processing Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            icon: Database,
                            title: "Background Processing",
                            description: "Analysis runs in the background while you continue working"
                          },
                          {
                            icon: BarChart3,
                            title: "Real-time Monitoring",
                            description: "Track progress and view results as they're processed"
                          },
                          {
                            icon: Download,
                            title: "Export Results",
                            description: "Download results as CSV, JSON, or Excel formats"
                          },
                          {
                            icon: Target,
                            title: "Auto-saved Results",
                            description: "All results automatically saved to your project"
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                            <div className="p-2 rounded-lg bg-green-500/10">
                              <item.icon className="w-4 h-4 text-green-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">{item.title}</h4>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Analysis Preview */}
                <div className="space-y-6">
                  {/* Analysis Preview */}
                  <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="w-5 h-5 text-purple-500" />
                        Analysis Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg bg-background/50 border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Database className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium">Total Items</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">{itemCount}</div>
                          </div>
                          <div className="p-4 border rounded-lg bg-background/50 border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-orange-500" />
                              <span className="text-sm font-medium">Est. Time</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">
                              {Math.ceil(itemCount * 0.5)}m
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg bg-background/50 border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium">Analysis Type</span>
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {analysisType.replace('_', ' ')} Analysis
                          </div>
                        </div>

                        {itemCount > 0 && (
                          <div className="p-4 border rounded-lg bg-background/50 border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Layers className="w-4 h-4 text-purple-500" />
                              <span className="text-sm font-medium">Sample Items</span>
                            </div>
                            <div className="space-y-1">
                              {inputText.split("\n").filter((l) => l.trim()).slice(0, 3).map((item, idx) => (
                                <div key={idx} className="text-xs text-muted-foreground font-mono">
                                  {item.trim()}
                                </div>
                              ))}
                              {itemCount > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  ... and {itemCount - 3} more items
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Processing Stats */}
                  <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        Processing Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            title: "Avg Processing Speed",
                            value: "2.3 items/sec",
                            icon: Zap,
                            color: "text-blue-500"
                          },
                          {
                            title: "Success Rate",
                            value: "98.7%",
                            icon: CheckCircle,
                            color: "text-green-500"
                          },
                          {
                            title: "Queue Position",
                            value: itemCount > 0 ? "Ready" : "Empty",
                            icon: Clock,
                            color: "text-orange-500"
                          }
                        ].map((stat, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                              </div>
                              <span className="text-sm font-medium">{stat.title}</span>
                            </div>
                            <span className="text-sm font-bold text-primary">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              {/* Data Preview */}
              <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    Data Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {itemCount > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1">
                            <Database className="w-3 h-3" />
                            {itemCount} Items
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Target className="w-3 h-3" />
                            {analysisType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Ready for processing
                        </div>
                      </div>

                      <div className="max-h-64 overflow-y-auto border rounded-lg bg-background/50">
                        <div className="divide-y divide-border/50">
                          {inputText.split("\n").filter((l) => l.trim()).map((item, idx) => (
                            <div key={idx} className="p-3 text-sm font-mono">
                              {item.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Data to Preview</h3>
                      <p className="text-muted-foreground">Add some data to see the preview.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Processing Performance */}
                <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Processing Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { day: 'Mon', processed: 45, queued: 12 },
                          { day: 'Tue', processed: 67, queued: 8 },
                          { day: 'Wed', processed: 34, queued: 15 },
                          { day: 'Thu', processed: 89, queued: 5 },
                          { day: 'Fri', processed: 56, queued: 9 },
                          { day: 'Sat', processed: 23, queued: 3 },
                          { day: 'Sun', processed: 41, queued: 7 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Area type="monotone" dataKey="processed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                          <Area type="monotone" dataKey="queued" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Types Distribution */}
                <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-500" />
                      Analysis Types Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Keyword Research', value: 45, fill: '#3b82f6' },
                              { name: 'Backlink Analysis', value: 25, fill: '#ef4444' },
                              { name: 'Keyword Clustering', value: 30, fill: '#10b981' }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Keyword Research', value: 45, fill: '#3b82f6' },
                              { name: 'Backlink Analysis', value: 25, fill: '#ef4444' },
                              { name: 'Keyword Clustering', value: 30, fill: '#10b981' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
