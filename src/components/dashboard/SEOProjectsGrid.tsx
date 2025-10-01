import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Calendar, TrendingUp, ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface SEOProject {
  id: string;
  name: string;
  domain: string;
  status: string;
  created_at: string;
}

interface SEOProjectsGridProps {
  projects: SEOProject[];
}

export const SEOProjectsGrid = memo(({ projects }: SEOProjectsGridProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              SEO Projects
            </CardTitle>
            <CardDescription className="mt-1">Active projects and their status</CardDescription>
          </div>
          <Button asChild size="sm" className="gap-2">
            <Link to="/seo">
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {projects.map((project) => (
              <Card key={project.id} className="group hover:shadow-md transition-all duration-300 hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate group-hover:text-primary transition-colors">{project.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{project.domain}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Tracking
                    </span>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                    <Link to="/seo" className="gap-2">
                      View Project
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No SEO Projects Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first project to start tracking rankings</p>
            <Button asChild>
              <Link to="/seo" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Project
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

SEOProjectsGrid.displayName = "SEOProjectsGrid";
