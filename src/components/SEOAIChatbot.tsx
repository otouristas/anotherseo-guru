import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, X, Send, Loader2, Sparkles, TrendingUp, Link2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your SEO AI Assistant, trained on AnotherSEOGuru's complete platform.\n\nI can help you with:\n• Keyword Research & Clustering\n• SERP Tracking & Analysis\n• Backlink Strategies\n• Content Optimization\n• Technical SEO Audits\n• Google Integrations\n\nClick a quick prompt below or ask me anything!",
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
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowQuickPrompts(false);

    try {
      const { data, error } = await supabase.functions.invoke("seo-ai-chat", {
        body: { messages: [...messages, userMessage] },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message || "I apologize, but I couldn't generate a response. Please try again.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
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

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-[0_0_40px_hsl(262_83%_58%/0.5)] hover:shadow-[0_0_50px_hsl(262_83%_58%/0.7)] z-50 transition-all hover:scale-110"
          size="icon"
        >
          <div className="relative">
            <MessageSquare className="w-7 h-7" />
            <Sparkles className="w-4 h-4 absolute -top-2 -right-2 text-secondary animate-pulse" />
          </div>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[420px] h-[650px] flex flex-col shadow-[0_0_50px_hsl(262_83%_58%/0.4)] z-50 border-primary/30 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="relative">
                <MessageSquare className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm">SEO AI Assistant</h3>
                <p className="text-xs opacity-90">Always online • Instant answers</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-white/20 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-background to-muted/20" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                        : "bg-card border text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border rounded-2xl p-4 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}

              {/* Quick Prompts */}
              {showQuickPrompts && messages.length === 1 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Quick Start:</p>
                  {quickPrompts.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        className="w-full justify-start h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/50 transition-all"
                        onClick={() => handleQuickPrompt(item.prompt)}
                      >
                        <Icon className="w-4 h-4 mr-2 text-primary shrink-0" />
                        <span className="text-sm text-left">{item.text}</span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about keywords, backlinks, SEO..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={() => sendMessage()} 
                disabled={isLoading || !input.trim()} 
                size="icon"
                className="shrink-0"
              >
                <Send className="w-4 h-4" />
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
