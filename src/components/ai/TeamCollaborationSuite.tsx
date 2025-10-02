import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Bell, 
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  UserPlus,
  Settings,
  Activity,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  lastActive: string;
  tasks: number;
  performance: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  project: string;
  tags: string[];
  comments: number;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'comment' | 'mention' | 'system';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'mention' | 'deadline' | 'update';
  read: boolean;
  timestamp: string;
  action?: string;
}

export function TeamCollaborationSuite({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    loadTeamData();
  }, [projectId]);

  const loadTeamData = async () => {
    setIsLoading(true);
    
    // Simulate data loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data
    const mockMembers: TeamMember[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        role: 'admin',
        status: 'online',
        lastActive: '2 minutes ago',
        tasks: 8,
        performance: 95
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike@company.com',
        role: 'manager',
        status: 'away',
        lastActive: '15 minutes ago',
        tasks: 12,
        performance: 87
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily@company.com',
        role: 'analyst',
        status: 'online',
        lastActive: '1 minute ago',
        tasks: 6,
        performance: 92
      },
      {
        id: '4',
        name: 'David Kim',
        email: 'david@company.com',
        role: 'viewer',
        status: 'offline',
        lastActive: '2 hours ago',
        tasks: 3,
        performance: 78
      }
    ];

    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Optimize Core Web Vitals',
        description: 'Improve page load times and user experience metrics',
        assignee: 'Sarah Johnson',
        priority: 'high',
        status: 'in-progress',
        dueDate: '2024-01-20',
        project: 'Technical SEO',
        tags: ['performance', 'technical'],
        comments: 5
      },
      {
        id: '2',
        title: 'Content Gap Analysis',
        description: 'Analyze competitor content and identify opportunities',
        assignee: 'Emily Rodriguez',
        priority: 'medium',
        status: 'pending',
        dueDate: '2024-01-25',
        project: 'Content Strategy',
        tags: ['content', 'analysis'],
        comments: 2
      },
      {
        id: '3',
        title: 'Link Building Campaign',
        description: 'Execute outreach for high-quality backlinks',
        assignee: 'Mike Chen',
        priority: 'high',
        status: 'overdue',
        dueDate: '2024-01-15',
        project: 'Link Building',
        tags: ['outreach', 'links'],
        comments: 8
      }
    ];

    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Task Overdue',
        message: 'Link Building Campaign is overdue',
        type: 'deadline',
        read: false,
        timestamp: '2 hours ago',
        action: 'View Task'
      },
      {
        id: '2',
        title: 'New Comment',
        message: 'Sarah mentioned you in Core Web Vitals task',
        type: 'mention',
        read: false,
        timestamp: '1 hour ago',
        action: 'View Comment'
      },
      {
        id: '3',
        title: 'Task Completed',
        message: 'Emily completed Content Audit task',
        type: 'task',
        read: true,
        timestamp: '3 hours ago'
      }
    ];

    setTeamMembers(mockMembers);
    setTasks(mockTasks);
    setNotifications(mockNotifications);
    setIsLoading(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'analyst': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
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

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'mention': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'deadline': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'update': return <Activity className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const inviteMember = () => {
    toast({
      title: 'Invitation Sent',
      description: 'Team member invitation has been sent successfully',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Collaboration Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Manage your team, tasks, and collaboration in one place
            </p>
            <Button onClick={inviteMember} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-muted-foreground">
                {teamMembers.filter(m => m.status === 'online').length} online
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status !== 'completed').length}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm text-red-600">
                {tasks.filter(t => t.status === 'overdue').length} overdue
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notifications</p>
                <p className="text-2xl font-bold">{notifications.filter(n => !n.read).length}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">Unread messages</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Performance</p>
                <p className="text-2xl font-bold">
                  {Math.round(teamMembers.reduce((sum, m) => sum + m.performance, 0) / teamMembers.length)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-green-600">+5% this week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {member.lastActive}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="font-bold">{member.tasks}</div>
                          <div className="text-xs text-muted-foreground">Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{member.performance}%</div>
                          <div className="text-xs text-muted-foreground">Performance</div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge className={getTaskStatusColor(task.status)}>
                              {task.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">Assigned to: {task.assignee}</span>
                            <span className="text-muted-foreground">Due: {task.dueDate}</span>
                            <span className="text-muted-foreground">{task.comments} comments</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Avatar>
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">Sarah Johnson</div>
                    <p className="text-sm text-muted-foreground">Completed task "Optimize Core Web Vitals"</p>
                    <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Avatar>
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">Mike Chen</div>
                    <p className="text-sm text-muted-foreground">Added comment to "Link Building Campaign"</p>
                    <div className="text-xs text-muted-foreground mt-1">4 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Avatar>
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">Emily Rodriguez</div>
                    <p className="text-sm text-muted-foreground">Started working on "Content Gap Analysis"</p>
                    <div className="text-xs text-muted-foreground mt-1">6 hours ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="font-medium">{notification.title}</div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                          {notification.action && (
                            <Button variant="outline" size="sm">
                              {notification.action}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
