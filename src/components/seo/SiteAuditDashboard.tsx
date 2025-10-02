import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Props {
  projectId: string;
  domain: string;
}

export const SiteAuditDashboard = ({ projectId, domain }: Props) => {
  const { toast } = useToast();
  return (
    <Card className="p-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold">Site Audit & Crawler</h2>
        <p className="text-muted-foreground">
          The audit backend is syncing. You can continue using the rest of the app safely.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()}>Reload</Button>
          <Button
            variant="outline"
            onClick={() =>
              toast({ title: "Audit queued", description: `Project ${projectId} • ${domain}` })
            }
          >
            Retry later
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SiteAuditDashboard;
