import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Download, Sparkles } from 'lucide-react';
import {
  PolarArea,
} from 'recharts';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';

interface KeywordWheel {
  who: string[];
  what: string[];
  why: string[];
  how: string[];
  where: string[];
}

export const MvpAnswerThePublic = () => {
  const [seedQuery, setSeedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [keywords, setKeywords] = useState<KeywordWheel | null>(null);
  const { toast } = useToast();

  const debouncedQuery = useDebounce(seedQuery, 300);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const { data, error } = await supabase.functions.invoke('keyword-autocomplete', {
          body: { query: debouncedQuery },
        });

        if (error) throw error;

        setSuggestions(data.suggestions || []);
        setShowSuggestions((data.suggestions || []).length > 0);
      } catch (error: any) {
        console.error('Autocomplete failed:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeedQuery(e.target.value);
    setKeywords(null);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSeedQuery(suggestion);
    setShowSuggestions(false);
    handleGenerate(suggestion);
  };

  const handleGenerate = async (query?: string) => {
    const targetQuery = query || seedQuery;
    if (!targetQuery) return;

    setGenerating(true);
    try {
      const wheelData: KeywordWheel = {
        who: [
          `who ${targetQuery}`,
          `who is ${targetQuery}`,
          `who uses ${targetQuery}`,
          `who needs ${targetQuery}`,
          `who benefits from ${targetQuery}`,
        ],
        what: [
          `what is ${targetQuery}`,
          `what does ${targetQuery} do`,
          `what are ${targetQuery} benefits`,
          `what ${targetQuery} means`,
          `what is ${targetQuery} used for`,
        ],
        why: [
          `why ${targetQuery}`,
          `why use ${targetQuery}`,
          `why is ${targetQuery} important`,
          `why choose ${targetQuery}`,
          `why ${targetQuery} matters`,
        ],
        how: [
          `how to ${targetQuery}`,
          `how does ${targetQuery} work`,
          `how to use ${targetQuery}`,
          `how to implement ${targetQuery}`,
          `how ${targetQuery} helps`,
        ],
        where: [
          `where to ${targetQuery}`,
          `where is ${targetQuery}`,
          `where to find ${targetQuery}`,
          `where to buy ${targetQuery}`,
          `where ${targetQuery} is used`,
        ],
      };

      setKeywords(wheelData);

      toast({
        title: "Wheel Generated!",
        description: `Created ${Object.values(wheelData).flat().length} keyword variations`,
      });
    } catch (error: any) {
      console.error('Generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      setSeedQuery(suggestions[0]);
      setShowSuggestions(false);
      handleGenerate(suggestions[0]);
    } else if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  const exportToCSV = () => {
    if (!keywords) return;

    const csvRows = ['Category,Keyword'];
    Object.entries(keywords).forEach(([category, queries]) => {
      queries.forEach(query => {
        csvRows.push(`${category},${query}`);
      });
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `answer-the-public-${seedQuery.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported to CSV",
      description: "Keywords downloaded successfully",
    });
  };

  const chartData = keywords
    ? [
        { category: 'Who', count: keywords.who.length, fullMark: 10 },
        { category: 'What', count: keywords.what.length, fullMark: 10 },
        { category: 'Why', count: keywords.why.length, fullMark: 10 },
        { category: 'How', count: keywords.how.length, fullMark: 10 },
        { category: 'Where', count: keywords.where.length, fullMark: 10 },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            MVP Answer The Public
          </CardTitle>
          <CardDescription>
            Generate "Who, What, Why, How, Where" keyword variations with real-time autocomplete
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={seedQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter seed query (e.g., 'AI SEO')"
                className="pl-10 pr-20"
              />
              {loadingSuggestions && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full bg-card border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-muted cursor-pointer text-sm transition-colors"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={() => handleGenerate()}
            disabled={!seedQuery || generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Wheel...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Keyword Wheel
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {keywords && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyword Distribution</CardTitle>
                <CardDescription>Visual representation of keyword categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar
                      name="Keywords"
                      dataKey="count"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>Keyword breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(keywords).map(([category, queries]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">questions</span>
                      </div>
                      <span className="text-2xl font-bold">{queries.length}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="font-semibold">Total Keywords</span>
                    <span className="text-2xl font-bold text-primary">
                      {Object.values(keywords).flat().length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Keywords</CardTitle>
                  <CardDescription>All keyword variations organized by category</CardDescription>
                </div>
                <Button onClick={exportToCSV} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(keywords).map(([category, queries]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Badge className="capitalize">{category}</Badge>
                      <span className="text-xs text-muted-foreground">{queries.length}</span>
                    </div>
                    <ul className="space-y-1">
                      {queries.map((query, i) => (
                        <li key={i} className="text-sm p-2 hover:bg-muted/50 rounded transition-colors">
                          {query}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
