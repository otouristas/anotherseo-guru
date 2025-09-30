import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ThumbsUp, MessageCircle, Share2, Repeat2, Heart, Bookmark, MoreHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PlatformMockupProps {
  platform: string;
  content: string;
}

export const PlatformMockup = ({ platform, content }: PlatformMockupProps) => {
  const renderMockup = () => {
    switch (platform) {
      case "linkedin":
        return <LinkedInMockup content={content} />;
      case "twitter":
        return <TwitterMockup content={content} />;
      case "instagram":
        return <InstagramMockup content={content} />;
      case "facebook":
        return <FacebookMockup content={content} />;
      case "tiktok":
        return <TikTokMockup content={content} />;
      case "medium":
        return <MediumMockup content={content} />;
      case "reddit":
        return <RedditMockup content={content} />;
      case "quora":
        return <QuoraMockup content={content} />;
      case "seo-blog":
        return <BlogMockup content={content} />;
      default:
        return <DefaultMockup content={content} />;
    }
  };

  return renderMockup();
};

const LinkedInMockup = ({ content }: { content: string }) => (
  <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
    <div className="p-4">
      {/* Profile Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-12 h-12 bg-blue-600 flex items-center justify-center text-white font-semibold">
          YB
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-gray-900 dark:text-white">Your Brand</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Marketing Expert | Content Strategist</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">1h • 🌐</div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none dark:prose-invert mb-4 text-gray-900 dark:text-gray-100">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-2 mt-2" {...props} />,
            p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
            a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline font-medium" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Engagement Stats */}
      <div className="flex items-center justify-between py-2 border-t border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">234 reactions</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">45 comments • 12 shares</div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around py-2">
        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded">
          <ThumbsUp className="w-5 h-5" />
          <span className="font-medium">Like</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Comment</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded">
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Share</span>
        </button>
      </div>
    </div>
  </Card>
);

const TwitterMockup = ({ content }: { content: string }) => (
  <Card className="max-w-xl mx-auto bg-white dark:bg-black border-gray-200 dark:border-gray-800">
    <div className="p-4">
      <div className="flex gap-3">
        <Avatar className="w-12 h-12 bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
          YB
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-bold text-gray-900 dark:text-white">Your Brand</span>
            <span className="text-blue-500">✓</span>
            <span className="text-gray-500 dark:text-gray-400">@yourbrand • 2h</span>
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert text-gray-900 dark:text-white mb-3">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-3" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-sm font-semibold mb-1 mt-2" {...props} />,
                p: ({node, ...props}) => <p className="mb-2 leading-normal" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-500 hover:underline font-medium" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
          <div className="flex items-center justify-between max-w-md text-gray-500 dark:text-gray-400">
            <button className="flex items-center gap-2 hover:text-blue-500 group">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">42</span>
            </button>
            <button className="flex items-center gap-2 hover:text-green-500 group">
              <Repeat2 className="w-5 h-5" />
              <span className="text-sm">128</span>
            </button>
            <button className="flex items-center gap-2 hover:text-red-500 group">
              <Heart className="w-5 h-5" />
              <span className="text-sm">1.2K</span>
            </button>
            <button className="flex items-center gap-2 hover:text-blue-500 group">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

const InstagramMockup = ({ content }: { content: string }) => (
  <Card className="max-w-md mx-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
    {/* Header */}
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
          <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold">YB</span>
          </div>
        </Avatar>
        <span className="font-semibold text-sm text-gray-900 dark:text-white">yourbrand</span>
      </div>
      <MoreHorizontal className="w-5 h-5 text-gray-900 dark:text-white" />
    </div>

    {/* Image Placeholder */}
    <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
      <span className="text-gray-500 dark:text-gray-400 text-sm">Your Image Here</span>
    </div>

    {/* Actions */}
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <Heart className="w-6 h-6 text-gray-900 dark:text-white" />
          <MessageCircle className="w-6 h-6 text-gray-900 dark:text-white" />
          <Share2 className="w-6 h-6 text-gray-900 dark:text-white" />
        </div>
        <Bookmark className="w-6 h-6 text-gray-900 dark:text-white" />
      </div>

      <div className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">2,847 likes</div>

      <div className="text-sm text-gray-900 dark:text-white space-y-2">
        <p>
          <span className="font-bold mr-2">yourbrand</span>
          <span className="leading-relaxed">
            {content.slice(0, 150)}...
          </span>
        </p>
      </div>

      <button className="text-sm text-gray-500 dark:text-gray-400 mt-1">more</button>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">2 HOURS AGO</div>
    </div>
  </Card>
);

const FacebookMockup = ({ content }: { content: string }) => (
  <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
    <div className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white font-semibold">
          YB
        </Avatar>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">Your Brand</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">2h • 🌐</div>
        </div>
      </div>

      <div className="prose prose-sm max-w-none dark:prose-invert mb-3 text-gray-900 dark:text-white">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-2 mt-2" {...props} />,
            p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
            a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline font-medium" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      <div className="flex items-center gap-6 pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
        <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded">
          <ThumbsUp className="w-5 h-5" />
          <span>Like</span>
        </button>
        <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded">
          <MessageCircle className="w-5 h-5" />
          <span>Comment</span>
        </button>
        <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  </Card>
);

const TikTokMockup = ({ content }: { content: string }) => (
  <Card className="max-w-sm mx-auto bg-black border-gray-800 aspect-[9/16] relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-pink-900 opacity-50" />
    <div className="relative h-full flex flex-col justify-end p-4 text-white">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="w-10 h-10 border-2 border-white">YB</Avatar>
            <span className="font-bold text-base">@yourbrand</span>
          </div>
          <div className="text-sm mb-2 leading-relaxed font-medium">
            {content.slice(0, 100)}...
          </div>
          <div className="text-xs opacity-90 font-semibold">#fyp #viral #content</div>
        </div>
    </div>
    <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center">
      <div className="text-center">
        <Heart className="w-8 h-8 mb-1" />
        <div className="text-xs">12.4K</div>
      </div>
      <div className="text-center">
        <MessageCircle className="w-8 h-8 mb-1" />
        <div className="text-xs">342</div>
      </div>
      <div className="text-center">
        <Share2 className="w-8 h-8 mb-1" />
        <div className="text-xs">891</div>
      </div>
    </div>
  </Card>
);

const MediumMockup = ({ content }: { content: string }) => (
  <Card className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-8">
    <div className="flex items-center gap-3 mb-6">
      <Avatar className="w-12 h-12 bg-black dark:bg-white">
        <span className="text-white dark:text-black font-serif font-bold">YB</span>
      </Avatar>
      <div>
        <div className="font-medium text-gray-900 dark:text-white">Your Brand</div>
        <div className="text-sm text-gray-500">5 min read • Nov 30</div>
      </div>
    </div>
    <div className="prose prose-lg max-w-none dark:prose-invert font-serif">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4 mt-6 font-serif" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3 mt-5 font-serif" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-semibold mb-3 mt-4 font-serif" {...props} />,
          p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-lg font-serif" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
          a: ({node, ...props}) => <a className="text-green-600 dark:text-green-400 hover:underline font-medium border-b border-green-600/30" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  </Card>
);

const RedditMockup = ({ content }: { content: string }) => (
  <Card className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
    <div className="flex gap-2 p-3">
      <div className="flex flex-col items-center gap-1">
        <button className="text-gray-400 hover:text-orange-500">▲</button>
        <span className="text-sm font-bold text-gray-900 dark:text-white">2.4k</span>
        <button className="text-gray-400 hover:text-blue-500">▼</button>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Avatar className="w-5 h-5 bg-blue-500" />
          <span>r/marketing</span>
          <span>•</span>
          <span>Posted by u/yourbrand</span>
          <span>3 hours ago</span>
        </div>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-3" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-sm font-semibold mb-1 mt-2" {...props} />,
              p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
              a: ({node, ...props}) => <a className="text-orange-600 dark:text-orange-400 hover:underline font-medium" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        <div className="flex items-center gap-4 mt-3 text-gray-500 text-sm">
          <button className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded">
            <MessageCircle className="w-4 h-4" />
            <span>142 Comments</span>
          </button>
          <button className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  </Card>
);

const QuoraMockup = ({ content }: { content: string }) => (
  <Card className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-6">
    <div className="flex items-center gap-3 mb-4">
      <Avatar className="w-10 h-10 bg-red-600">
        <span className="text-white font-semibold">YB</span>
      </Avatar>
      <div>
        <div className="font-medium text-gray-900 dark:text-white">Your Brand</div>
        <div className="text-sm text-gray-500">Marketing Expert • 2h ago</div>
      </div>
    </div>
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-3" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-sm font-semibold mb-1 mt-2" {...props} />,
          p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
          a: ({node, ...props}) => <a className="text-red-600 dark:text-red-400 hover:underline font-medium" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
    <div className="flex items-center gap-6 mt-4 pt-4 border-t text-gray-600 dark:text-gray-400 text-sm">
      <button className="flex items-center gap-2">
        <ThumbsUp className="w-4 h-4" />
        <span>Upvote • 234</span>
      </button>
      <button className="flex items-center gap-2">
        <MessageCircle className="w-4 h-4" />
        <span>Comment</span>
      </button>
      <button className="flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>
    </div>
  </Card>
);

const BlogMockup = ({ content }: { content: string }) => (
  <Card className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-8">
    <div className="prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4 mt-6" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3 mt-5" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-semibold mb-3 mt-4" {...props} />,
          p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-base" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
          a: ({node, ...props}) => <a className="text-primary hover:underline font-medium" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  </Card>
);

const DefaultMockup = ({ content }: { content: string }) => (
  <Card className="p-6">
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-2 mt-2" {...props} />,
          p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
          a: ({node, ...props}) => <a className="text-primary hover:underline font-medium" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  </Card>
);
