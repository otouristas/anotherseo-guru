import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Download, Globe, HelpCircle, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface CategorizedSuggestions {
  questions: string[];
  prepositions: string[];
  comparisons: string[];
  modifiers: string[];
  alphabetical: string[];
  others: string[];
}

export const PublicResearchRealTime = () => {
  const [seedQuery, setSeedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [categorized, setCategorized] = useState<CategorizedSuggestions | null>(null);
  const [expandAZ, setExpandAZ] = useState(false);
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
        const { data, error } = await supabase.functions.invoke('google-autocomplete', {
          body: { query: debouncedQuery, expand: false },
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
    setCategorized(null);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSeedQuery(suggestion);
    setShowSuggestions(false);
    handleGenerate(suggestion, false);
  };

  const handleGenerate = async (query?: string, expand = false) => {
    const targetQuery = query || seedQuery;
    if (!targetQuery) return;

    setGenerating(true);
    setExpandAZ(expand);

    try {
      const { data, error } = await supabase.functions.invoke('google-autocomplete', {
        body: { query: targetQuery, expand },
      });

      if (error) throw error;

      setCategorized(data.categorized);

      toast({
        title: expand ? "A-Z Expansion Complete!" : "Research Complete!",
        description: `Found ${data.total} suggestions from Google Autocomplete`,
      });
    } catch (error: any) {
      console.error('Generation failed:', error);
      toast({
        title: "Research Failed",
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
      handleGenerate(suggestions[0], false);
    } else if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  const exportToCSV = () => {
    if (!categorized) return;

    const csvRows = ['Category,Suggestion'];
    Object.entries(categorized).forEach(([category, queries]) => {
      queries.forEach(query => {
        csvRows.push(`${category},${query.replace(/"/g, '""')}`);
      });
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `public-research-${seedQuery.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported to CSV",
      description: "Public research data downloaded successfully",
    });
  };

  const chartData = categorized
    ? Object.entries(categorized).map(([category, items]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        count: items.length,
      }))
    : [];

  const totalSuggestions = categorized
    ? Object.values(categorized).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Public Research - Real Time
          </CardTitle>
          <CardDescription>
            Real-time Google Autocomplete research with advanced categorization and A-Z expansion
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
                placeholder="Enter seed keyword (e.g., 'car rental paros')"
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
                {suggestions.slice(0, 10).map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-muted cursor-pointer text-sm transition-colors flex items-center gap-2"
                  >
                    <Search className="w-3 h-3 text-muted-foreground" />
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleGenerate()}
              disabled={!seedQuery || generating}
              className="flex-1"
            >
              {generating && !expandAZ ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Get Suggestions
                </>
              )}
            </Button>

            <Button
              onClick={() => handleGenerate(undefined, true)}
              disabled={!seedQuery || generating}
              variant="outline"
              className="flex-1"
            >
              {generating && expandAZ ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Expanding A-Z...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  A-Z Expansion
                </>
              )}
            </Button>
          </div>

          {generating && (
            <div className="p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
              {expandAZ
                ? "Fetching suggestions for A-Z variations... This may take 30-60 seconds"
                : "Fetching real-time suggestions from Google Autocomplete..."}
            </div>
          )}
        </CardContent>
      </Card>

      {categorized && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Visual breakdown of suggestion types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8b5cf6" name="Suggestions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Research Summary</CardTitle>
                <CardDescription>Statistics from Google Autocomplete</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="font-semibold">Total Suggestions</span>
                    <span className="text-2xl font-bold text-primary">{totalSuggestions}</span>
                  </div>
                  {Object.entries(categorized).map(([category, queries]) => (
                    queries.length > 0 && (
                      <div key={category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {category}
                          </Badge>
                        </div>
                        <span className="text-xl font-bold">{queries.length}</span>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Research Results</CardTitle>
                  <CardDescription>
                    Real-time data from Google Autocomplete • Source: suggestqueries.google.com
                  </CardDescription>
                </div>
                <Button onClick={exportToCSV} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto flex-wrap">
                  <TabsTrigger value="all">All ({totalSuggestions})</TabsTrigger>
                  {Object.entries(categorized).map(([category, queries]) => (
                    queries.length > 0 && (
                      <TabsTrigger key={category} value={category} className="capitalize">
                        {category} ({queries.length})
                      </TabsTrigger>
                    )
                  ))}
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.entries(categorized).flatMap(([category, queries]) =>
                      queries.map((query, i) => (
                        <div
                          key={`${category}-${i}`}
                          className="p-3 border rounded-lg hover:bg-muted/50 transition-colors text-sm"
                        >
                          <div className="flex items-start gap-2">
                            <Badge variant="secondary" className="text-xs capitalize shrink-0">
                              {category}
                            </Badge>
                            <span className="flex-1">{query}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                {Object.entries(categorized).map(([category, queries]) => (
                  queries.length > 0 && (
                    <TabsContent key={category} value={category} className="mt-4">
                      <div className="space-y-2">
                        {queries.map((query, i) => (
                          <div
                            key={i}
                            className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            {query}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <strong>Data Source:</strong> Google Autocomplete API (suggestqueries.google.com)
                </p>
                <p>
                  <strong>Note:</strong> This is real-time data from Google's unofficial autocomplete endpoint.
                  For production use with high volume, consider using paid SERP APIs like DataForSEO or SerpApi.
                </p>
                <p>
                  <strong>Categories:</strong> Questions (who/what/how), Prepositions (for/with/near),
                  Comparisons (vs/like), Modifiers (best/cheap/free), and Alphabetical (A-Z expansion results).
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
