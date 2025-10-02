import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar, 
  Users, 
  BarChart3, 
  Sparkles,
  ArrowRight,
  Lightbulb,
  Zap
} from 'lucide-react';

interface ContentStrategy {
  overview: {
    totalContent: number;
    estimatedTraffic: number;
    timeToComplete: string;
    priorityScore: number;
  };
  contentPillars: Array<{
    pillar: string;
    topics: string[];
    keywords: string[];
    estimatedPosts: number;
    trafficPotential: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  contentCalendar: Array<{
    date: string;
    type: 'blog' | 'video' | 'infographic' | 'podcast';
    topic: string;
    keywords: string[];
    estimatedTraffic: number;
    status: 'planned' | 'in-progress' | 'published';
  }>;
  competitorGaps: Array<{
    topic: string;
    competitor: string;
    opportunity: string;
    difficulty: number;
    potential: number;
  }>;
}

export function AIContentStrategyGenerator({ projectId }: { projectId: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [strategy, setStrategy] = useState<ContentStrategy | null>(null);
  const [currentStep, setCurrentStep] = useState('');
  
  const [inputs, setInputs] = useState({
    industry: '',
    targetAudience: '',
    businessGoals: '',
    contentGoals: '',
    budget: '',
    timeline: '3 months',
    teamSize: '1-3 people',
    existingContent: '',
    competitors: '',
    brandVoice: 'professional'
  });

  const { toast } = useToast();

  const generateStrategy = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStrategy(null);

    try {
      const steps = [
        'Analyzing industry landscape...',
        'Researching competitor content...',
        'Identifying content gaps...',
        'Generating content pillars...',
        'Creating content calendar...',
        'Calculating traffic potential...',
        'Optimizing strategy...'
      ];

      // Simulate progress
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        setProgress((i + 1) * (100 / steps.length));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Generate mock strategy data (replace with real AI call)
      const mockStrategy: ContentStrategy = {
        overview: {
          totalContent: 45,
          estimatedTraffic: 125000,
          timeToComplete: '3 months',
          priorityScore: 87
        },
        contentPillars: [
          {
            pillar: 'Technical SEO',
            topics: ['Core Web Vitals', 'Page Speed', 'Mobile Optimization', 'Schema Markup'],
            keywords: ['technical seo', 'page speed optimization', 'core web vitals'],
            estimatedPosts: 15,
            trafficPotential: 45000,
            priority: 'high'
          },
          {
            pillar: 'Content Marketing',
            topics: ['Blog Strategy', 'Video Content', 'Infographics', 'Case Studies'],
            keywords: ['content marketing strategy', 'blog optimization', 'content creation'],
            estimatedPosts: 20,
            trafficPotential: 55000,
            priority: 'high'
          },
          {
            pillar: 'Link Building',
            topics: ['Guest Posting', 'Resource Pages', 'Broken Link Building', 'PR Outreach'],
            keywords: ['link building strategies', 'guest posting', 'digital pr'],
            estimatedPosts: 10,
            trafficPotential: 25000,
            priority: 'medium'
          }
        ],
        contentCalendar: [
          {
            date: '2024-01-15',
            type: 'blog',
            topic: 'Complete Guide to Core Web Vitals',
            keywords: ['core web vitals', 'page speed', 'user experience'],
            estimatedTraffic: 8500,
            status: 'planned'
          },
          {
            date: '2024-01-22',
            type: 'video',
            topic: 'Technical SEO Audit Walkthrough',
            keywords: ['technical seo audit', 'seo checklist'],
            estimatedTraffic: 6200,
            status: 'planned'
          }
        ],
        competitorGaps: [
          {
            topic: 'AI SEO Tools Comparison',
            competitor: 'competitor1.com',
            opportunity: 'They rank for this topic but content is outdated',
            difficulty: 3,
            potential: 8
          }
        ]
      };

      setStrategy(mockStrategy);
      
      toast({
        title: 'Strategy Generated! 🎉',
        description: 'Your AI-powered content strategy is ready with 45 content pieces planned.',
      });

    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate content strategy. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
            <Brain className="h-5 w-5" />
            AI Content Strategy Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Industry</label>
              <Input
                placeholder="e.g., SaaS, E-commerce, Healthcare"
                value={inputs.industry}
                onChange={(e) => setInputs(prev => ({ ...prev, industry: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target Audience</label>
              <Input
                placeholder="e.g., Small business owners, SEO professionals"
                value={inputs.targetAudience}
                onChange={(e) => setInputs(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
            </div>
          </div>

          <Button 
            onClick={generateStrategy} 
            disabled={isGenerating || !inputs.industry}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Generating Strategy...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Strategy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Strategy Generation</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-muted-foreground animate-pulse" />
                    <span className="text-sm text-muted-foreground">{currentStep}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strategy Results */}
      <AnimatePresence>
        {strategy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pillars">Content Pillars</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="gaps">Opportunities</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{strategy.overview.totalContent}</div>
                        <div className="text-sm text-muted-foreground">Content Pieces</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{strategy.overview.estimatedTraffic.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Est. Traffic</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{strategy.overview.timeToComplete}</div>
                        <div className="text-sm text-muted-foreground">Timeline</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">{strategy.overview.priorityScore}/100</div>
                        <div className="text-sm text-muted-foreground">Priority Score</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="pillars" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {strategy.contentPillars.map((pillar, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{pillar.pillar}</CardTitle>
                          <Badge className={getPriorityColor(pillar.priority)}>
                            {pillar.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>{pillar.estimatedPosts} posts</span>
                          <span className="font-medium">{pillar.trafficPotential.toLocaleString()} traffic</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2">Topics:</div>
                          <div className="flex flex-wrap gap-1">
                            {pillar.topics.slice(0, 3).map((topic, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {pillar.topics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{pillar.topics.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="space-y-4">
                <div className="space-y-3">
                  {strategy.contentCalendar.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{item.type}</Badge>
                              <span className="text-sm text-muted-foreground">{item.date}</span>
                            </div>
                            <h4 className="font-medium">{item.topic}</h4>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.keywords.map((keyword, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {item.estimatedTraffic.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">traffic</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="gaps" className="space-y-4">
                <div className="space-y-3">
                  {strategy.competitorGaps.map((gap, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">{gap.topic}</h4>
                            <p className="text-sm text-muted-foreground mb-3">{gap.opportunity}</p>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline">{gap.competitor}</Badge>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">Difficulty:</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-3 h-3 rounded-full mr-1 ${
                                        i < gap.difficulty ? 'bg-red-500' : 'bg-gray-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">Potential:</span>
                                <div className="flex">
                                  {[...Array(10)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full mr-1 ${
                                        i < gap.potential ? 'bg-green-500' : 'bg-gray-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
