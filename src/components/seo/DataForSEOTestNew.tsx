import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  CheckCircle, 
  AlertTriangle,
  Database,
  Globe,
  BarChart3,
  Target
} from "lucide-react";
import { 
  dfsGoogleLiveAdvanced,
  dfsSearchVolumeLive,
  dfsLocations,
  dfsSerpEndpoints,
  dfsLabsCategories,
  dfsOnPageSummary
} from "@/lib/dataforseo";

interface DataForSEOTestProps {
  projectId: string;
}

export const DataForSEOTest = ({ projectId }: DataForSEOTestProps) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentTest, setCurrentTest] = useState("");
  const [progress, setProgress] = useState(0);
  const [testKeyword, setTestKeyword] = useState("best running shoes");
  const [testUrl, setTestUrl] = useState("https://example.com");
  const { toast } = useToast();

  const runDataForSEOTests = async () => {
    setIsTesting(true);
    setProgress(0);
    setTestResults([]);

    const tests = [
      { name: "Locations (Free)", operation: "locations", icon: Globe },
      { name: "SERP Endpoints (Free)", operation: "endpoints", icon: Database },
      { name: "Labs Categories (Free)", operation: "categories", icon: Target },
      { name: "SERP Analysis", operation: "serp", icon: Search },
      { name: "Keyword Volume", operation: "keywords", icon: BarChart3 },
      { name: "On-Page Analysis", operation: "onpage", icon: Target }
    ];

    try {
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        setCurrentTest(test.name);
        setProgress((i / tests.length) * 100);

        try {
          let data;
          
          switch (test.operation) {
            case "serp":
              data = await dfsGoogleLiveAdvanced(testKeyword);
              break;
            case "keywords":
              data = await dfsSearchVolumeLive([testKeyword]);
              break;
            case "locations":
              data = await dfsLocations();
              break;
            case "endpoints":
              data = await dfsSerpEndpoints();
              break;
            case "categories":
              data = await dfsLabsCategories();
              break;
            case "onpage":
              data = await dfsOnPageSummary(testUrl);
              break;
            default:
              throw new Error(`Unknown test operation: ${test.operation}`);
          }

          setTestResults(prev => [...prev, {
            operation: test.operation,
            name: test.name,
            success: true,
            data: data,
            timestamp: new Date().toISOString()
          }]);

          toast({
            title: `${test.name} Test Passed! ✅`,
            description: `Successfully connected to DataForSEO API`,
          });

        } catch (error: any) {
          console.error(`${test.name} test error:`, error);
          
          setTestResults(prev => [...prev, {
            operation: test.operation,
            name: test.name,
            success: false,
            data: null,
            timestamp: new Date().toISOString(),
            error: error.message
          }]);

          toast({
            title: `${test.name} Test Failed ❌`,
            description: error.message || "Failed to connect to DataForSEO API",
            variant: "destructive",
          });
        }

        // Rate limiting between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setProgress(100);
      setCurrentTest("Complete");

      const successCount = testResults.filter(r => r.success).length;
      const totalTests = tests.length;

      toast({
        title: "DataForSEO Tests Complete! 🎉",
        description: `${successCount}/${totalTests} tests passed successfully`,
      });

    } catch (error) {
      console.error('Test suite error:', error);
      toast({
        title: "Test Suite Failed",
        description: "An unexpected error occurred during testing",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">DataForSEO Integration Test</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test your DataForSEO API connection and verify all endpoints are working correctly.
        </p>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>
            Configure test parameters for DataForSEO API testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Test Keyword</label>
              <Input
                value={testKeyword}
                onChange={(e) => setTestKeyword(e.target.value)}
                placeholder="Enter keyword to test..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Test URL (for On-Page)</label>
              <Input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={async () => {
                try {
                  const result = await dfsLocations();
                  toast({
                    title: "Connection Test Passed! ✅",
                    description: `Status: ${result.status_code} - ${result.status_message}`,
                  });
                } catch (error: any) {
                  toast({
                    title: "Connection Test Failed ❌",
                    description: error.message,
                    variant: "destructive",
                  });
                }
              }}
              variant="outline"
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
            
            <Button 
              onClick={runDataForSEOTests} 
              disabled={isTesting}
              className="flex-1"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Tests... ({Math.round(progress)}%)
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Progress */}
      {isTesting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current test: {currentTest}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Results from DataForSEO API tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Success" : "Failed"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
