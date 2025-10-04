import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProjectSelectorProps {
  projects: unknown[];
  selectedProject: string | null;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectSelector = ({ projects, selectedProject, onSelectProject, onDeleteProject }: ProjectSelectorProps) => {
  if (projects.length === 0) return null;

  const currentProject = projects.find(p => p.id === selectedProject);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <label className="text-sm font-medium">Active Project:</label>
      <Select value={selectedProject || undefined} onValueChange={onSelectProject}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name} ({project.domain})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {currentProject && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete Project</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{currentProject.name}"? This will permanently remove all associated data including keywords, rankings, audits, and analytics. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDeleteProject(currentProject.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};