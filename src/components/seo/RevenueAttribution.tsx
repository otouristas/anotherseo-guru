import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Target, BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueAttributionProps {
  projectId: string;
}

export const RevenueAttribution = ({ projectId }: RevenueAttributionProps) => {
  const [data, setData] = useState<unknown[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 125430,
    totalConversions: 342,
    avgOrderValue: 367,
    roi: 456
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    // Simulate revenue attribution data
    const mockData = [
      { month: 'Jan', organic: 15000, paid: 8000, social: 3000, direct: 5000 },
      { month: 'Feb', organic: 18000, paid: 9500, social: 3500, direct: 5500 },
      { month: 'Mar', organic: 22000, paid: 11000, social: 4000, direct: 6000 },
      { month: 'Apr', organic: 25000, paid: 12000, social: 4500, direct: 6500 },
      { month: 'May', organic: 28000, paid: 13500, social: 5000, direct: 7000 },
      { month: 'Jun', organic: 32000, paid: 15000, social: 5500, direct: 7500 },
    ];
    setData(mockData);
  };

  const topKeywords = [
    { keyword: 'seo services', revenue: 24500, conversions: 67, roi: 523 },
    { keyword: 'digital marketing', revenue: 18300, conversions: 52, roi: 412 },
    { keyword: 'seo consultant', revenue: 15600, conversions: 43, roi: 389 },
    { keyword: 'content marketing', revenue: 12800, conversions: 38, roi: 356 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold">${summary.totalRevenue.toLocaleString()}</p>
          <Badge variant="outline" className="mt-2">
            <TrendingUp className="w-3 h-3 mr-1" />
            +23%
          </Badge>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Conversions</span>
            <Target className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold">{summary.totalConversions}</p>
          <Badge variant="outline" className="mt-2">
            <TrendingUp className="w-3 h-3 mr-1" />
            +18%
          </Badge>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Order Value</span>
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold">${summary.avgOrderValue}</p>
          <Badge variant="outline" className="mt-2">
            +5%
          </Badge>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">ROI</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold">{summary.roi}%</p>
          <Badge variant="default" className="mt-2">
            Excellent
          </Badge>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Revenue by Channel</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="organic" fill="hsl(var(--primary))" name="Organic" />
            <Bar dataKey="paid" fill="hsl(var(--chart-2))" name="Paid" />
            <Bar dataKey="social" fill="hsl(var(--chart-3))" name="Social" />
            <Bar dataKey="direct" fill="hsl(var(--chart-4))" name="Direct" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Top Revenue-Generating Keywords</h3>
        <div className="space-y-4">
          {topKeywords.map((kw, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <p className="font-semibold">{kw.keyword}</p>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{kw.conversions} conversions</span>
                  <span>ROI: {kw.roi}%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">${kw.revenue.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
