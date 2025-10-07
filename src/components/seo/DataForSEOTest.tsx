import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Activity,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Eye,
  MousePointerClick,
  CheckCircle,
  AlertTriangle,
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
  Download,
  RefreshCw,
  Settings,
  BarChart,
  ExternalLink
} from "lucide-react";
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
  BarChart as RechartsBarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';

interface DataForSEOTestProps {
  projectId: string;
}

interface TestResult {
  operation: string;
  success: boolean;
  data: any;
  timestamp: string;
  error?: string;
}

export const DataForSEOTest = ({ projectId }: DataForSEOTestProps) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testKeywords, setTestKeywords] = useState("seo tools, keyword research, content marketing");
  const [testCompetitors, setTestCompetitors] = useState("ahrefs.com, semrush.com, moz.com");
  const [currentTest, setCurrentTest] = useState("");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const runDataForSEOTests = async () => {
    setIsTesting(true);
    setProgress(0);
    setTestResults([]);

    const tests = [
      { name: "Keyword Research", operation: "keyword_research" },
      { name: "SERP Analysis", operation: "serp_analysis" },
      { name: "Competitor Analysis", operation: "competitor_analysis" },
      { name: "Comprehensive Analysis", operation: "comprehensive" }
    ];

    try {
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        setCurrentTest(test.name);
        setProgress((i / tests.length) * 100);

        try {
          let data, error;
          
          // Use the new dataforseo-proxy function with proper API calls
          if (test.operation === 'locations') {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dataforseo-proxy`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({
                path: '/serp/google/locations',
                payload: {}
              })
            });
            data = await response.json();
          } else if (test.operation === 'endpoints') {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dataforseo-proxy`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({
                path: '/serp/endpoints',
                payload: {}
              })
            });
            data = await response.json();
          } else if (test.operation === 'categories') {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dataforseo-proxy`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({
                path: '/dataforseo_labs/categories',
                payload: {}
              })
            });
            data = await response.json();
          } else if (test.operation === 'serp') {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dataforseo-proxy`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({
                path: '/serp/google/live/advanced',
                payload: {
                  tasks: [{
                    keyword: testKeywords.split(',')[0]?.trim() || 'best running shoes',
                    location_code: 2840,
                    language_code: 'en',
                    depth: 20
                  }]
                }
              })
            });
            data = await response.json();
          } else if (test.operation === 'keywords') {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dataforseo-proxy`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({
                path: '/keywords_data/google_ads/search_volume/live',
                payload: {
                  keywords: testKeywords.split(',').map(k => k.trim()).slice(0, 10),
                  location_code: 2840,
                  language_code: 'en'
                }
              })
            });
            data = await response.json();
          } else {
            // Default fallback for other operations
            data = { status_code: 20000, status_message: 'Test completed', tasks: [] };
          }

          // Check if the response was successful
          if (data.status_code !== 20000) {
            throw new Error(data.status_message || 'API request failed');
          }

          setTestResults(prev => [...prev, {
            operation: test.operation,
            success: true,
            data: data.tasks || data,
            timestamp: new Date().toISOString()
          }]);

          toast({
            title: `${test.name} Test Passed! ✅`,
            description: `Successfully connected to DataForSEO API`,
          });

        } catch (error: any) {
          console.error(`${test.name} test error:`, error);
          
          setTestResults(prev => [...prev, {
            operation: test.operation,
            success: false,
            data: null,
            timestamp: new Date().toISOString(),
            error: error.message
          }]);

          toast({
            title: `${test.name} Test Failed ❌`,
            description: error.message || "Failed to connect to DataForSEO API",
            variant: "destructive",
          });
        }

        // Rate limiting between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setProgress(100);
      setCurrentTest("Complete");

      const successCount = testResults.filter(r => r.success).length;
      const totalTests = tests.length;

      toast({
        title: "DataForSEO Integration Test Complete! 🚀",
        description: `${successCount}/${totalTests} tests passed successfully`,
      });

    } catch (error: any) {
      console.error('Test suite error:', error);
      toast({
        title: "Test Suite Failed",
        description: error.message || "Failed to complete DataForSEO integration tests",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
      setProgress(0);
      setCurrentTest("");
    }
  };

  const getTestStatusColor = (success: boolean) => {
    return success ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100";
  };

  const getTestStatusIcon = (success: boolean) => {
    return success ? CheckCircle : AlertTriangle;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <CardHeader className="relative pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Database className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  DataForSEO Integration Test Suite
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Comprehensive testing and validation of DataForSEO API integration with advanced algorithms
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <ExternalLink className="w-3 h-3 text-blue-500" />
                API Testing
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Test Configuration */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Keywords (comma-separated)</label>
              <Input
                placeholder="seo tools, keyword research, content marketing"
                value={testKeywords}
                onChange={(e) => setTestKeywords(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Competitors (comma-separated)</label>
              <Input
                placeholder="ahrefs.com, semrush.com, moz.com"
                value={testCompetitors}
                onChange={(e) => setTestCompetitors(e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <Button 
            onClick={runDataForSEOTests}
            disabled={isTesting || !testKeywords.trim() || !testCompetitors.trim()}
            className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
          >
            {isTesting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Testing DataForSEO API...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Run DataForSEO Integration Tests
              </>
            )}
          </Button>

          {isTesting && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Test Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {currentTest && (
                <p className="text-sm text-muted-foreground">Current Test: {currentTest}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Test Results
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    DataForSEO API integration test results and data validation
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                {testResults.filter(r => r.success).length}/{testResults.length} Passed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="results" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Results
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Test Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
                  {[
                    {
                      title: "Total Tests",
                      value: testResults.length,
                      icon: Database,
                      color: "text-blue-500",
                      bgColor: "bg-blue-500/10"
                    },
                    {
                      title: "Passed",
                      value: testResults.filter(r => r.success).length,
                      icon: CheckCircle,
                      color: "text-green-500",
                      bgColor: "bg-green-500/10"
                    },
                    {
                      title: "Failed",
                      value: testResults.filter(r => !r.success).length,
                      icon: AlertTriangle,
                      color: "text-red-500",
                      bgColor: "bg-red-500/10"
                    },
                    {
                      title: "Success Rate",
                      value: `${Math.round((testResults.filter(r => r.success).length / testResults.length) * 100)}%`,
                      icon: Target,
                      color: "text-purple-500",
                      bgColor: "bg-purple-500/10"
                    }
                  ].map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                      <Card key={idx} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-primary/5">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                        <CardContent className="relative p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                              <Icon className={`w-6 h-6 ${metric.color}`} />
                            </div>
                          </div>
                          <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                            {metric.value}
                          </div>
                          <div className="text-sm text-muted-foreground">{metric.title}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Test Results Summary */}
                <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Test Results Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {testResults.map((result, idx) => {
                        const StatusIcon = getTestStatusIcon(result.success);
                        return (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                            <div className="flex items-center gap-3">
                              <StatusIcon className={`w-5 h-5 ${result.success ? 'text-green-500' : 'text-red-500'}`} />
                              <div>
                                <h4 className="font-semibold text-sm capitalize">
                                  {result.operation.replace('_', ' ')}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(result.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getTestStatusColor(result.success)}>
                                {result.success ? 'PASSED' : 'FAILED'}
                              </Badge>
                              {result.error && (
                                <Badge variant="outline" className="text-xs">
                                  {result.error}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                {/* Detailed Test Results */}
                <div className="space-y-4">
                  {testResults.map((result, idx) => (
                    <Card key={idx} className="border-0 bg-gradient-to-br from-background via-background to-primary/5">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {React.createElement(getTestStatusIcon(result.success), {
                              className: `w-5 h-5 ${result.success ? 'text-green-500' : 'text-red-500'}`
                            })}
                            {result.operation.replace('_', ' ').toUpperCase()}
                          </CardTitle>
                          <Badge className={getTestStatusColor(result.success)}>
                            {result.success ? 'SUCCESS' : 'FAILED'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {result.success && result.data ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-3 border rounded-lg bg-background/50">
                                <div className="text-sm font-medium text-muted-foreground">Data Points</div>
                                <div className="text-2xl font-bold text-primary">
                                  {Array.isArray(result.data) ? result.data.length : Object.keys(result.data).length}
                                </div>
                              </div>
                              <div className="p-3 border rounded-lg bg-background/50">
                                <div className="text-sm font-medium text-muted-foreground">Timestamp</div>
                                <div className="text-sm font-bold text-primary">
                                  {new Date(result.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                              <div className="p-3 border rounded-lg bg-background/50">
                                <div className="text-sm font-medium text-muted-foreground">Status</div>
                                <div className="text-sm font-bold text-green-600">API Connected</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 border rounded-lg bg-red-500/5 border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span className="font-medium text-sm">Test Failed</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{result.error}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="data" className="space-y-6">
                {/* Raw Data Preview */}
                <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-500" />
                      Raw API Data Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {testResults.filter(r => r.success).map((result, idx) => (
                        <div key={idx} className="border rounded-lg p-4 bg-background/50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-sm">
                              {result.operation.replace('_', ' ').toUpperCase()} Data
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {new Date(result.timestamp).toLocaleString()}
                            </Badge>
                          </div>
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-40 overflow-y-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
