import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <Card className="fixed bottom-6 left-6 max-w-md p-4 shadow-[0_0_30px_hsl(240_10%_10%/0.15)] z-50 border-border">
      <div className="flex items-start gap-3">
        <Cookie className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm mb-3">
            We use cookies to enhance your experience, analyze traffic, and personalize content. By clicking "Accept", you consent to our use of cookies.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleAccept} size="sm" className="flex-1">
              Accept
            </Button>
            <Button onClick={handleDecline} size="sm" variant="outline" className="flex-1">
              Decline
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
