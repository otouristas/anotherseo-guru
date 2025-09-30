import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectSelectorProps {
  projects: any[];
  selectedProject: string | null;
  onSelectProject: (id: string) => void;
}

export const ProjectSelector = ({ projects, selectedProject, onSelectProject }: ProjectSelectorProps) => {
  if (projects.length === 0) return null;

  return (
    <div className="flex items-center gap-4">
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
    </div>
  );
};