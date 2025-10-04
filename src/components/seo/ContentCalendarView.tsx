import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Trash2 } from "lucide-react";

interface ContentCalendarViewProps {
  projectId: string;
}

export const ContentCalendarView = ({ projectId }: ContentCalendarViewProps) => {
  const [items, setItems] = useState<unknown[]>([]);
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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Editorial Calendar</h3>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Content
          </Button>
        </div>

        {showForm && (
          <div className="space-y-4 p-4 border rounded-lg mb-4">
            <Input
              placeholder="Content title..."
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Select value={formData.content_type} onValueChange={(v) => setFormData({...formData, content_type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog Post</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="email">Email Campaign</SelectItem>
                </SelectContent>
              </Select>

              <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Target keyword..."
              value={formData.target_keyword}
              onChange={(e) => setFormData({...formData, target_keyword: e.target.value})}
            />

            <Input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
            />

            <Textarea
              placeholder="Content brief..."
              value={formData.content_brief}
              onChange={(e) => setFormData({...formData, content_brief: e.target.value})}
              rows={3}
            />

            <Button onClick={addItem} className="w-full">Save</Button>
          </div>
        )}
      </Card>

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.scheduled_date).toLocaleDateString()}
                    <span>•</span>
                    <span>{item.content_type}</span>
                    {item.target_keyword && (
                      <>
                        <span>•</span>
                        <span>🎯 {item.target_keyword}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(item.priority)}>
                    {item.priority}
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
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {item.content_brief && (
                <p className="text-sm text-muted-foreground mt-2">{item.content_brief}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Content Scheduled</h3>
          <p className="text-muted-foreground">Add content to your editorial calendar</p>
        </Card>
      )}
    </div>
  );
};