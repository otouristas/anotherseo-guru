import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Target, TrendingUp, Brain } from "lucide-react";
import logo from "@/assets/logo.png";
import { signInSchema, signUpSchema } from "@/lib/validation";
import { Footer } from "@/components/Footer";

export default function Auth() {
  return (
    <>
      <Helmet>
        <title>Sign In - AnotherSEOGuru</title>
        <meta name="description" content="Sign in to your AnotherSEOGuru account" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AuthContent />
    </>
  );
}

function AuthContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate input
    const validation = signInSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(", ");
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errors,
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(validation.data.email, validation.data.password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message,
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate("/repurpose");
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate input
    const validation = signUpSchema.safeParse({ 
      email, 
      password, 
      firstName: firstName || undefined, 
      lastName: lastName || undefined 
    });
    
    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(", ");
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errors,
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(
      validation.data.email, 
      validation.data.password, 
      validation.data.firstName, 
      validation.data.lastName
    );

    if (error) {
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message,
      });
    } else {
      toast({
        title: "Account created!",
        description: "Welcome to AnotherSEOGuru. You can now start creating content.",
      });
      navigate("/repurpose");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex-1 flex">
        {/* Left Column - Features */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" style={{ backgroundSize: '30px 30px' }} />
          <div className="relative z-10 flex flex-col justify-center px-8 xl:px-12 2xl:px-16 3xl:px-20">
            <div className="max-w-md xl:max-w-lg 2xl:max-w-xl">
              <div className="flex items-center gap-3 mb-8 xl:mb-10">
                <img src={logo} alt="AnotherSEOGuru Logo" className="h-14 w-14 xl:h-16 xl:w-16" />
                <span className="text-3xl xl:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AnotherSEOGuru
                </span>
              </div>
              
              <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold text-foreground mb-6 xl:mb-8 leading-tight">
                Transform Your Content with
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block">
                  AI-Powered SEO
                </span>
              </h1>
              
              <p className="text-lg xl:text-xl text-muted-foreground mb-10 xl:mb-12 leading-relaxed">
                Join thousands of content creators and marketers who are already using our advanced SEO platform to dominate search rankings.
              </p>

              {/* Features Grid */}
              <div className="space-y-5 xl:space-y-6">
                <div className="flex items-start gap-3 xl:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 xl:w-6 xl:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base xl:text-lg font-semibold text-foreground mb-1 xl:mb-2">AI Content Generation</h3>
                    <p className="text-sm xl:text-base text-muted-foreground leading-relaxed">Generate SEO-optimized content for any platform with advanced AI that understands search intent.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 xl:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Target className="w-5 h-5 xl:w-6 xl:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base xl:text-lg font-semibold text-foreground mb-1 xl:mb-2">Keyword Research</h3>
                    <p className="text-sm xl:text-base text-muted-foreground leading-relaxed">Discover high-value keywords with our comprehensive research tools powered by DataForSEO.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 xl:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 xl:w-6 xl:h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base xl:text-lg font-semibold text-foreground mb-1 xl:mb-2">SERP Tracking</h3>
                    <p className="text-sm xl:text-base text-muted-foreground leading-relaxed">Monitor your rankings across multiple search engines and track competitor performance.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 xl:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 xl:w-6 xl:h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base xl:text-lg font-semibold text-foreground mb-1 xl:mb-2">Predictive Analytics</h3>
                    <p className="text-sm xl:text-base text-muted-foreground leading-relaxed">Get AI-powered insights and predictions to stay ahead of search algorithm changes.</p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="mt-10 xl:mt-12 pt-6 xl:pt-8 border-t border-border/50">
                <div className="flex items-center justify-between gap-4 xl:gap-6">
                  <div className="text-center">
                    <div className="text-xl xl:text-2xl font-bold text-foreground">10K+</div>
                    <div className="text-xs xl:text-sm text-muted-foreground">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl xl:text-2xl font-bold text-foreground">1M+</div>
                    <div className="text-xs xl:text-sm text-muted-foreground">Content Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl xl:text-2xl font-bold text-foreground">95%</div>
                    <div className="text-xs xl:text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Auth Form */}
        <div className="flex-1 lg:flex-none lg:w-[500px] xl:w-[550px] 2xl:w-[600px] flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center mb-6 sm:mb-8">
              <Link to="/" className="flex items-center gap-2 mb-3 sm:mb-4">
                <img src={logo} alt="AnotherSEOGuru Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AnotherSEOGuru
                </span>
              </Link>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8">
                <TabsTrigger value="signin" className="text-xs sm:text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-xs sm:text-sm">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Welcome back</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Sign in to continue your SEO journey</p>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-xs sm:text-sm font-medium">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-xs sm:text-sm font-medium">Password</Label>
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                      <Button type="submit" className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Create your account</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Start your SEO journey today</p>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name" className="text-xs sm:text-sm font-medium">First Name</Label>
                          <Input
                            id="first-name"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            disabled={isLoading}
                            className="h-10 sm:h-12 text-sm sm:text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name" className="text-xs sm:text-sm font-medium">Last Name</Label>
                          <Input
                            id="last-name"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            disabled={isLoading}
                            className="h-10 sm:h-12 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-xs sm:text-sm font-medium">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-xs sm:text-sm font-medium">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                      <Button type="submit" className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center leading-relaxed">
                        By signing up, you agree to our{" "}
                        <Link to="/terms" className="underline hover:text-primary font-medium">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="underline hover:text-primary font-medium">
                          Privacy Policy
                        </Link>
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
