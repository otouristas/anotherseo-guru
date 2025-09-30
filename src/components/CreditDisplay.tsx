import { Coins } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CreditDisplayProps {
  credits: number;
  planType: string;
}

export const CreditDisplay = ({ credits, planType }: CreditDisplayProps) => {
  const isUnlimited = planType === 'pro';
  
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Coins className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Available Credits</p>
          <p className="text-2xl font-bold">
            {isUnlimited ? '∞' : credits}
          </p>
        </div>
        {!isUnlimited && credits < 10 && (
          <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            Low credits
          </div>
        )}
      </div>
    </Card>
  );
};
