import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, X, Send, Loader as Loader2, Sparkles, TrendingUp, Link2, Search, Download, Maximize2, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  {
    icon: Search,
    text: "How do I do keyword research?",
    prompt: "Explain how to do effective keyword research using AnotherSEOGuru's keyword database and clustering tools."
  },
  {
    icon: TrendingUp,
    text: "Best practices for SERP tracking",
    prompt: "What are the best practices for tracking SERP rankings and monitoring competitors?"
  },
  {
    icon: Link2,
    text: "Backlink building strategies",
    prompt: "Share effective backlink building strategies and how to use the backlink analysis tools."
  },
  {
    icon: Sparkles,
    text: "Content optimization tips",
    prompt: "Give me tips on optimizing content for SEO using AI and NLP analysis."
  }
];

export const SEOAIChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your **Super-Intelligent SEO AI Assistant**, trained on AnotherSEOGuru's complete platform with access to your project data.\n\n**I can help you with:**\n• Keyword Research & Clustering\n• SERP Tracking & Analysis  \n• Backlink Strategies\n• Content Optimization\n• Technical SEO Audits\n• Google Integrations\n• **Personalized recommendations based on YOUR data**\n\nClick a quick prompt below or ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setShowQuickPrompts(false);

    try {
      let projectContext = null;
      if (user) {
        const { data: projects } = await supabase
          .from("seo_projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (projects && projects.length > 0) {
          const projectIds = projects.map((p) => p.id);
          const { data: keywords } = await supabase
            .from("keyword_analysis")
            .select("keyword, search_volume, difficulty")
            .in("project_id", projectIds)
            .order("created_at", { ascending: false })
            .limit(20);

          // Temporarily disable recommendations fetch until types sync
          const recommendations: any[] = [];

          projectContext = {
            projects: projects.map((p) => ({
              domain: p.domain,
              name: p.name,
              created_at: p.created_at,
            })),
            recent_keywords: keywords || [],
            pending_recommendations: recommendations,
          };
        }
      }

      const { data, error } = await supabase.functions.invoke("seo-ai-chat", {
        body: {
          messages: newMessages,
          projectContext,
          sessionId,
          userId: user?.id,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message || "I apologize, but I couldn't generate a response. Please try again.",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (user) {
        // Store conversation snapshot; matches table columns
        // @ts-ignore - using untyped insert to avoid type drift during schema sync
        await (supabase as any).from("chatbot_conversations").insert({
          user_id: user.id,
          project_id: null,
          messages: [...newMessages, assistantMessage],
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exportConversation = () => {
    const exportData = {
      session_id: sessionId,
      exported_at: new Date().toISOString(),
      messages,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-ai-chat-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Conversation Exported",
      description: "Your chat history has been downloaded",
    });
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-[0_0_40px_hsl(262_83%_58%/0.5)] hover:shadow-[0_0_50px_hsl(262_83%_58%/0.7)] z-[9999] transition-all hover:scale-110 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          size="icon"
        >
          <div className="relative">
            <MessageSquare className="w-7 h-7 text-white" />
            <Sparkles className="w-4 h-4 absolute -top-2 -right-2 text-yellow-300 animate-pulse" />
          </div>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={`fixed ${isFullscreen ? 'inset-2 sm:inset-4' : 'bottom-6 right-6 w-[calc(100vw-3rem)] h-[calc(100vh-3rem)] sm:w-[420px] sm:h-[650px]'} flex flex-col shadow-[0_0_50px_hsl(262_83%_58%/0.4)] z-[9999] border-primary/30 overflow-hidden transition-all duration-300 bg-background`}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-sm truncate">Super SEO AI Assistant</h3>
                <p className="text-xs opacity-90 hidden sm:block">With project data access</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={exportConversation}
                className="text-primary-foreground hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8"
                title="Export conversation"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-primary-foreground hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3 sm:p-4 bg-gradient-to-b from-background to-muted/20" ref={scrollRef}>
            <div className="space-y-3 sm:space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[95%] sm:max-w-[90%] md:max-w-[85%] rounded-2xl p-3 sm:p-4 shadow-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                        : "bg-card border text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="text-xs sm:text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border rounded-2xl p-3 sm:p-4 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-primary" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}

              {/* Quick Prompts */}
              {showQuickPrompts && messages.length === 1 && (
                <div className="space-y-2 mt-3 sm:mt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2 sm:mb-3">Quick Start:</p>
                  {quickPrompts.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        className="w-full justify-start h-auto py-2 sm:py-3 px-3 sm:px-4 hover:bg-primary/5 hover:border-primary/50 transition-all text-xs sm:text-sm"
                        onClick={() => handleQuickPrompt(item.prompt)}
                      >
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-primary shrink-0" />
                        <span className="text-left truncate">{item.text}</span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about keywords, backlinks, SEO..."
                disabled={isLoading}
                className="flex-1 text-sm sm:text-base"
              />
              <Button 
                onClick={() => sendMessage()} 
                disabled={isLoading || !input.trim()} 
                size="icon"
                className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by AI • Trained on AnotherSEOGuru platform
            </p>
          </div>
        </Card>
      )}
    </>
  );
};
