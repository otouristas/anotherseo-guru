import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { User, Loader as Loader2, Mail } from "lucide-react";

export const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  return (
    <Card className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Profile Settings</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Email address cannot be changed. Contact support if you need assistance.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-id">User ID</Label>
          <Input
            id="user-id"
            value={user?.id || ""}
            disabled
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Your unique user identifier
          </p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-amber-500" />
          Account Management
        </h4>
        <p className="text-xs text-muted-foreground mb-3">
          Need to update your email, delete your account, or manage security settings?
        </p>
        <Button variant="outline" size="sm">
          Contact Support
        </Button>
      </div>
    </Card>
  );
};
