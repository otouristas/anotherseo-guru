import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, TrendingUp, Users } from "lucide-react";

interface MultiLocationTrackerProps {
  projectId: string;
}

export const MultiLocationTracker = ({ projectId }: MultiLocationTrackerProps) => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<any[]>([]);
  const [newLocation, setNewLocation] = useState({ city: "", state: "", country: "United States" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLocations();
  }, [projectId]);

  const loadLocations = async () => {
    const { data } = await supabase
      .from('multi_location_tracking')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (data) setLocations(data);
  };

  const addLocation = async () => {
    if (!newLocation.city || !newLocation.country) {
      toast({
        title: "Missing Information",
        description: "Please provide at least city and country",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('multi_location_tracking')
        .insert({
          project_id: projectId,
          location_name: `${newLocation.city}${newLocation.state ? ', ' + newLocation.state : ''}, ${newLocation.country}`,
          city: newLocation.city,
          state: newLocation.state || null,
          country: newLocation.country,
          local_pack_rankings: { keywords: [], positions: [] },
          organic_rankings: {},
          gmb_insights: {},
          local_competitors: [],
          local_search_volume: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Location Added",
        description: `Now tracking SEO for ${data.location_name}`,
      });

      setNewLocation({ city: "", state: "", country: "United States" });
      loadLocations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Multi-Location SEO Command Center</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Track and optimize SEO performance across multiple geographic locations
        </p>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Input
            placeholder="City"
            value={newLocation.city}
            onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
          />
          <Input
            placeholder="State/Province (optional)"
            value={newLocation.state}
            onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
          />
          <Input
            placeholder="Country"
            value={newLocation.country}
            onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
          />
          <Button onClick={addLocation} disabled={loading}>
            <MapPin className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {location.city}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {location.state && `${location.state}, `}{location.country}
                </p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Local Pack</span>
                <Badge variant="outline">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Top 3
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Organic Rank</span>
                <span className="font-semibold">#12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Competitors</span>
                <Badge variant="outline">
                  <Users className="w-3 h-3 mr-1" />
                  8
                </Badge>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full mt-4">
              View Details
            </Button>
          </Card>
        ))}
      </div>

      {locations.length === 0 && (
        <Card className="p-12 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No locations added yet. Add your first location to start tracking.</p>
        </Card>
      )}
    </div>
  );
};
