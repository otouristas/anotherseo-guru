import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Plus, 
  Trash2, 
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
  FileText,
  Brain,
  MessageSquare,
  Clock,
  TrendingUp,
  Edit3,
  Users,
  CheckSquare
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
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';

interface ContentCalendarViewProps {
  projectId: string;
}

export const ContentCalendarView = ({ projectId }: ContentCalendarViewProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'blog',
    target_keyword: '',
    priority: 'medium',
    scheduled_date: '',
    content_brief: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadItems();
  }, [projectId]);

  const loadItems = async () => {
    const { data } = await supabase
      .from('content_calendar')
      .select('*')
      .eq('project_id', projectId)
      .order('scheduled_date', { ascending: true });
    setItems(data || []);
  };

  const addItem = async () => {
    if (!formData.title || !formData.scheduled_date) {
      toast({
        title: "Missing fields",
        description: "Please fill in title and date",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.from('content_calendar').insert({
      project_id: projectId,
      ...formData
    });

    if (error) {
      toast({
        title: "Error",
        description: "Could not add item",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Item added",
      description: "Content scheduled successfully"
    });

    setFormData({
      title: '',
      content_type: 'blog',
      target_keyword: '',
      priority: 'medium',
      scheduled_date: '',
      content_brief: ''
    });
    setShowForm(false);
    loadItems();
  };

  const deleteItem = async (id: string) => {
    await supabase.from('content_calendar').delete().eq('id', id);
    loadItems();
    toast({
      title: "Item deleted",
      description: "Content removed from calendar"
    });
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('content_calendar').update({ status }).eq('id', id);
    loadItems();
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return "destructive";
    if (priority === 'medium') return "default";
    return "secondary";
  };

  const getStatusColor = (status: string) => {
    if (status === 'published') return "default";
    if (status === 'in_progress') return "secondary";
    return "outline";
  };

  const publishedCount = items.filter(item => item.status === 'published').length;
  const inProgressCount = items.filter(item => item.status === 'in_progress').length;
  const plannedCount = items.filter(item => item.status === 'planned').length;
  const totalCount = items.length;

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <CardHeader className="relative pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Content Calendar & Editorial Planning
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Advanced content planning with AI-powered scheduling, performance tracking, and editorial workflow management
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                Active Planning
              </Badge>
              <Button 
                onClick={() => setShowForm(!showForm)} 
                className="h-10 px-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Content
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Add Content Form */}
      {showForm && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Schedule New Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <Input
                placeholder="Content title..."
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="h-12"
              />
              
              <Select value={formData.content_type} onValueChange={(v) => setFormData({...formData, content_type: v})}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog Post</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="email">Email Campaign</SelectItem>
                  <SelectItem value="whitepaper">Whitepaper</SelectItem>
                  <SelectItem value="case_study">Case Study</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-4">
              <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Target keyword..."
                value={formData.target_keyword}
                onChange={(e) => setFormData({...formData, target_keyword: e.target.value})}
                className="h-12"
              />

              <Input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                className="h-12"
              />
            </div>

            <Textarea
              placeholder="Content brief and strategy notes..."
              value={formData.content_brief}
              onChange={(e) => setFormData({...formData, content_brief: e.target.value})}
              rows={3}
              className="resize-none"
            />

            <div className="flex gap-4">
              <Button 
                onClick={addItem} 
                className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Schedule Content
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="h-12 px-6"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Content Calendar Dashboard */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Content Calendar Dashboard
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive editorial planning with performance analytics and workflow management
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="w-3 h-3 text-green-500" />
              {totalCount} Items Scheduled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Workflow
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Content Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
                {[
                  {
                    title: "Total Content",
                    value: totalCount,
                    icon: FileText,
                    color: "text-blue-500",
                    bgColor: "bg-blue-500/10",
                    change: "+12%"
                  },
                  {
                    title: "Published",
                    value: publishedCount,
                    icon: CheckCircle,
                    color: "text-green-500",
                    bgColor: "bg-green-500/10",
                    change: "+8%"
                  },
                  {
                    title: "In Progress",
                    value: inProgressCount,
                    icon: Clock,
                    color: "text-orange-500",
                    bgColor: "bg-orange-500/10",
                    change: "+15%"
                  },
                  {
                    title: "Planned",
                    value: plannedCount,
                    icon: Calendar,
                    color: "text-purple-500",
                    bgColor: "bg-purple-500/10",
                    change: "+5%"
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
                          <div className="flex items-center gap-1">
                            <ArrowUp className="w-3 h-3 text-green-500" />
                            <span className="text-xs font-medium text-green-600">{metric.change}</span>
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

              {/* Content Performance Summary */}
              <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Content Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        title: "Completion Rate",
                        value: totalCount > 0 ? Math.round((publishedCount / totalCount) * 100) : 0,
                        icon: CheckCircle,
                        description: "Published vs planned content",
                        color: "text-green-500"
                      },
                      {
                        title: "Avg Time to Publish",
                        value: "5.2",
                        icon: Clock,
                        description: "Days from planning to publication",
                        color: "text-blue-500"
                      },
                      {
                        title: "Keyword Coverage",
                        value: items.filter(item => item.target_keyword).length,
                        icon: Target,
                        description: "Content with target keywords",
                        color: "text-orange-500"
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-background/50 border-border/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">{item.title}</h4>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {item.value}{item.title === "Avg Time to Publish" ? " days" : item.title === "Completion Rate" ? "%" : ""}
                            </div>
                            <Progress value={item.title === "Completion Rate" ? item.value : 75} className="w-16 h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              {/* Content List */}
              {items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item) => (
                    <Card 
                      key={item.id} 
                      className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-secondary/5"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                      <CardContent className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.scheduled_date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {item.content_type.replace('_', ' ')}
                              </span>
                              {item.target_keyword && (
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  {item.target_keyword}
                                </span>
                              )}
                            </div>
                            {item.content_brief && (
                              <p className="text-sm text-muted-foreground mb-4">{item.content_brief}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                              {item.priority.toUpperCase()}
                            </Badge>
                            <Select value={item.status} onValueChange={(v) => updateStatus(item.id, v)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planned">Planned</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteItem(item.id)}
                              className="hover:bg-red-500/10 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 bg-gradient-to-br from-muted/5 to-muted/10">
                  <CardContent className="text-center py-16">
                    <Calendar className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-50" />
                    <h3 className="text-2xl font-bold mb-4">No Content Scheduled</h3>
                    <p className="text-muted-foreground text-lg mb-6">
                      Start building your editorial calendar by adding your first content piece.
                    </p>
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Your First Content
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Content Type Distribution */}
                <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      Content Type Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Blog Posts', value: items.filter(i => i.content_type === 'blog').length, fill: '#3b82f6' },
                              { name: 'Videos', value: items.filter(i => i.content_type === 'video').length, fill: '#ef4444' },
                              { name: 'Social Media', value: items.filter(i => i.content_type === 'social').length, fill: '#10b981' },
                              { name: 'Email Campaigns', value: items.filter(i => i.content_type === 'email').length, fill: '#f59e0b' }
                            ].filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Blog Posts', value: items.filter(i => i.content_type === 'blog').length, fill: '#3b82f6' },
                              { name: 'Videos', value: items.filter(i => i.content_type === 'video').length, fill: '#ef4444' },
                              { name: 'Social Media', value: items.filter(i => i.content_type === 'social').length, fill: '#10b981' },
                              { name: 'Email Campaigns', value: items.filter(i => i.content_type === 'email').length, fill: '#f59e0b' }
                            ].filter(item => item.value > 0).map((entry, index) => (
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

                {/* Publishing Timeline */}
                <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                      Publishing Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { week: 'Week 1', published: 2, planned: 4 },
                          { week: 'Week 2', published: 3, planned: 5 },
                          { week: 'Week 3', published: 1, planned: 3 },
                          { week: 'Week 4', published: 4, planned: 6 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Area type="monotone" dataKey="planned" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                          <Area type="monotone" dataKey="published" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="workflow" className="space-y-6">
              {/* Workflow Status */}
              <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    Editorial Workflow Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { status: 'planned', count: plannedCount, color: 'bg-gray-500', description: 'Content planned and scheduled' },
                      { status: 'in_progress', count: inProgressCount, color: 'bg-blue-500', description: 'Content currently being created' },
                      { status: 'review', count: items.filter(i => i.status === 'review').length, color: 'bg-yellow-500', description: 'Content under review' },
                      { status: 'published', count: publishedCount, color: 'bg-green-500', description: 'Content published and live' }
                    ].map((workflow, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                        <div className={`w-4 h-4 rounded-full ${workflow.color}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm capitalize">{workflow.status.replace('_', ' ')}</h4>
                            <span className="text-lg font-bold text-primary">{workflow.count}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{workflow.description}</p>
                        </div>
                        <Progress value={(workflow.count / totalCount) * 100} className="w-24 h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};