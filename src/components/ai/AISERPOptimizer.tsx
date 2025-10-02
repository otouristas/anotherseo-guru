import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Target, 
  TrendingUp, 
  Eye, 
  Zap,
  Brain,
  Sparkles,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Star,
  Users,
  Globe
} from 'lucide-react';

interface SERPFeature {
  type: 'featured_snippet' | 'people_also_ask' | 'related_searches' | 'image_pack' | 'video_carousel' | 'local_pack' | 'shopping_results';
  position: number;
  title: string;
  description: string;
  opportunity: string;
  difficulty: number;
  potential: number;
  optimization: string;
}

interface SERPAnalysis {
  keyword: string;
  currentRank: number;
  serpFeatures: SERPFeature[];
  opportunities: Array<{
    feature: string;
    action: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
  competitors: Array<{
    domain: string;
    position: number;
    features: string[];
    strengths: string[];
  }>;
}

export function AISERPOptimizer({ projectId }: { projectId: string }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SERPAnalysis | null>(null);
  const [keyword, setKeyword] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const { toast } = useToast();

  const analyzeSERP = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Keyword Required",
        description: "Please enter a keyword to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setAnalysis(null);

    try {
      const steps = [
        'Fetching SERP data...',
        'Analyzing featured snippets...',
        'Identifying People Also Ask...',
        'Checking image opportunities...',
        'Evaluating video content...',
        'Analyzing competitor features...',
        'Generating optimization plan...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        setProgress((i + 1) * (100 / steps.length));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Mock analysis data
      const mockAnalysis: SERPAnalysis = {
        keyword,
        currentRank: 8,
        serpFeatures: [
          {
            type: 'featured_snippet',
            position: 1,
            title: 'Featured Snippet Available',
            description: 'There\'s a featured snippet for this keyword that you can target',
            opportunity: 'High traffic potential with featured snippet',
            difficulty: 4,
            potential: 9,
            optimization: 'Create a comprehensive guide with clear headings and bullet points'
          },
          {
            type: 'people_also_ask',
            position: 2,
            title: 'People Also Ask',
            description: '5 PAA questions detected with high search volume',
            opportunity: 'Answer PAA questions to capture more traffic',
            difficulty: 3,
            potential: 7,
            optimization: 'Add FAQ section with structured data markup'
          },
          {
            type: 'image_pack',
            position: 3,
            title: 'Image Pack',
            description: 'Image results showing for this keyword',
            opportunity: 'Optimize images for better visibility',
            difficulty: 2,
            potential: 6,
            optimization: 'Create high-quality images with proper alt text and file names'
          }
        ],
        opportunities: [
          {
            feature: 'Featured Snippet',
            action: 'Create comprehensive guide with clear structure',
            impact: 'high',
            effort: 'medium',
            timeline: '2-3 weeks'
          },
          {
            feature: 'People Also Ask',
            action: 'Add FAQ section with structured data',
            impact: 'medium',
            effort: 'low',
            timeline: '1 week'
          },
          {
            feature: 'Image Pack',
            action: 'Optimize existing images and create new ones',
            impact: 'medium',
            effort: 'medium',
            timeline: '1-2 weeks'
          }
        ],
        competitors: [
          {
            domain: 'competitor1.com',
            position: 1,
            features: ['Featured Snippet', 'People Also Ask'],
            strengths: ['Comprehensive content', 'Good structure']
          },
          {
            domain: 'competitor2.com',
            position: 3,
            features: ['Image Pack'],
            strengths: ['Visual content', 'Good images']
          }
        ]
      };

      setAnalysis(mockAnalysis);
      
      toast({
        title: 'SERP Analysis Complete! 🎯',
        description: `Found ${mockAnalysis.serpFeatures.length} optimization opportunities for "${keyword}"`,
      });

    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze SERP features. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const getFeatureIcon = (type: string) => {
    switch (type) {
      case 'featured_snippet': return <Star className="h-4 w-4" />;
      case 'people_also_ask': return <Users className="h-4 w-4" />;
      case 'image_pack': return <Eye className="h-4 w-4" />;
      case 'video_carousel': return <Globe className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            AI SERP Feature Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter keyword to analyze SERP features"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeSERP()}
              className="flex-1"
            />
            <Button 
              onClick={analyzeSERP} 
              disabled={isAnalyzing}
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze SERP
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">SERP Analysis</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground animate-pulse" />
                    <span className="text-sm text-muted-foreground">{currentStep}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="features" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="features">SERP Features</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
                <TabsTrigger value="strategy">Strategy</TabsTrigger>
              </TabsList>

              <TabsContent value="features" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Detected SERP Features</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Current rank: #{analysis.currentRank} for "{analysis.keyword}"
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {analysis.serpFeatures.map((feature, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              {getFeatureIcon(feature.type)}
                              <CardTitle className="text-base">{feature.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Difficulty:</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-3 h-3 rounded-full mr-1 ${
                                        i < feature.difficulty ? 'bg-red-500' : 'bg-gray-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Potential:</span>
                                <div className="flex">
                                  {[...Array(10)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full mr-1 ${
                                        i < feature.potential ? 'bg-green-500' : 'bg-gray-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="pt-2 border-t">
                              <p className="text-xs font-medium text-primary">{feature.optimization}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Optimization Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.opportunities.map((opportunity, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium">{opportunity.feature}</h4>
                                  <Badge className={getImpactColor(opportunity.impact)}>
                                    {opportunity.impact} impact
                                  </Badge>
                                  <Badge className={getEffortColor(opportunity.effort)}>
                                    {opportunity.effort} effort
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {opportunity.action}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">Timeline: {opportunity.timeline}</span>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                <Sparkles className="h-4 w-4 mr-1" />
                                Optimize
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="competitors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Competitor Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.competitors.map((competitor, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium">{competitor.domain}</h4>
                                  <Badge variant="outline">#{competitor.position}</Badge>
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-sm font-medium">SERP Features:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {competitor.features.map((feature, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                          {feature}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium">Strengths:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {competitor.strengths.map((strength, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                          {strength}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <BarChart3 className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="strategy" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Generated Strategy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <CardContent className="pt-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            Priority Actions
                          </h4>
                          <ol className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">1</span>
                              <span>Optimize content structure for featured snippet opportunity</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">2</span>
                              <span>Add FAQ section with structured data markup</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">3</span>
                              <span>Create and optimize images for image pack visibility</span>
                            </li>
                          </ol>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            Expected Results
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">+45%</div>
                              <div className="text-muted-foreground">Traffic Increase</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">#4</div>
                              <div className="text-muted-foreground">Target Position</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">3-4</div>
                              <div className="text-muted-foreground">Weeks to Results</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
