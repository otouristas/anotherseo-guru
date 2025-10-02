import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader as Loader2, Search, Users, CircleHelp as HelpCircle, Info, MapPin, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PolarArea } from "recharts/Polar";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

interface QueryWheelData {
  who: string[];
  what: string[];
  why: string[];
  how: string[];
  where: string[];
}

interface Props {
  onKeywordsGenerated?: (keywords: string[]) => void;
}

export function QueryWheel({ onKeywordsGenerated }: Props) {
  const [seedQuery, setSeedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [wheelData, setWheelData] = useState<QueryWheelData>({
    who: [],
    what: [],
    why: [],
    how: [],
    where: [],
  });
  const { toast } = useToast();

  const generateWheel = async () => {
    if (!seedQuery.trim()) {
      toast({
        title: "Seed query required",
        description: "Please enter a keyword to generate the query wheel",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const wheelData: QueryWheelData = {
        who: [],
        what: [],
        why: [],
        how: [],
        where: [],
      };

      const modifiers = {
        who: ["who", "who is", "who are", "who can", "who should", "which", "best for"],
        what: ["what", "what is", "what are", "what does", "examples", "types of", "kinds of"],
        why: ["why", "why is", "why should", "benefits", "advantages", "reasons", "importance"],
        how: ["how", "how to", "how do", "guide", "tutorial", "steps", "ways to"],
        where: ["where", "where to", "near me", "locations", "places", "online", "local"],
      };

      for (const [category, prefixes] of Object.entries(modifiers)) {
        for (const prefix of prefixes) {
          const query = `${prefix} ${seedQuery}`;
          wheelData[category as keyof QueryWheelData].push(query);
        }
      }

      const { data: dataforSeoData, error } = await supabase.functions.invoke("dataforseo-research", {
        body: {
          action: "keyword_research",
          keywords: [
            ...wheelData.who.slice(0, 2),
            ...wheelData.what.slice(0, 2),
            ...wheelData.why.slice(0, 2),
            ...wheelData.how.slice(0, 2),
            ...wheelData.where.slice(0, 2),
          ],
        },
      });

      if (error) throw error;

      setWheelData(wheelData);

      const allKeywords = [
        ...wheelData.who,
        ...wheelData.what,
        ...wheelData.why,
        ...wheelData.how,
        ...wheelData.where,
      ];

      if (onKeywordsGenerated) {
        onKeywordsGenerated(allKeywords);
      }

      toast({
        title: "Query Wheel Generated!",
        description: `Generated ${allKeywords.length} keyword variations across 5 categories`,
      });
    } catch (error) {
      console.error("Query wheel error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate query wheel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { category: "Who", count: wheelData.who.length, fullMark: 10 },
    { category: "What", count: wheelData.what.length, fullMark: 10 },
    { category: "Why", count: wheelData.why.length, fullMark: 10 },
    { category: "How", count: wheelData.how.length, fullMark: 10 },
    { category: "Where", count: wheelData.where.length, fullMark: 10 },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "who":
        return <Users className="w-4 h-4" />;
      case "what":
        return <Info className="w-4 h-4" />;
      case "why":
        return <HelpCircle className="w-4 h-4" />;
      case "how":
        return <Wrench className="w-4 h-4" />;
      case "where":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const totalQueries = Object.values(wheelData).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            5W Query Wheel Generator
          </h2>
          <p className="text-sm text-muted-foreground">
            Generate comprehensive keyword variations across Who, What, Why, How, and Where dimensions
            for complete topical coverage.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Enter seed keyword (e.g., 'AI SEO tools')"
            value={seedQuery}
            onChange={(e) => setSeedQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !loading && generateWheel()}
          />
          <Button onClick={generateWheel} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Generate
          </Button>
        </div>

        {totalQueries > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(wheelData).map(([category, queries]) => (
                <div key={category} className="text-center p-4 rounded-lg bg-accent/5 border">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getCategoryIcon(category)}
                    <div className="text-sm font-medium capitalize">{category}</div>
                  </div>
                  <div className="text-2xl font-bold">{queries.length}</div>
                  <div className="text-xs text-muted-foreground">queries</div>
                </div>
              ))}
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} />
                  <Radar name="Queries" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {Object.entries(wheelData).map(([category, queries]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <h3 className="font-semibold capitalize">{category} Queries</h3>
                    <Badge variant="secondary">{queries.length}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {queries.slice(0, 8).map((query, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {query}
                      </Badge>
                    ))}
                    {queries.length > 8 && (
                      <Badge variant="secondary" className="text-xs">
                        +{queries.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {totalQueries === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Enter a seed keyword to generate the query wheel</p>
          </div>
        )}
      </div>
    </Card>
  );
}
