import { 
  BlogIcon, 
  MediumIcon, 
  LinkedInIcon, 
  RedditIcon, 
  QuoraIcon, 
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  NewsletterIcon,
  TikTokIcon
} from "@/components/PlatformLogos";

export type Platform = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  credits: number;
};

export const platforms: Platform[] = [
  { id: "seo-blog", name: "SEO Blog", icon: BlogIcon, description: "Long-form, keyword-rich content", credits: 3 },
  { id: "medium", name: "Medium", icon: MediumIcon, description: "Personal storytelling format", credits: 2 },
  { id: "linkedin", name: "LinkedIn", icon: LinkedInIcon, description: "Professional thought-leadership", credits: 2 },
  { id: "reddit", name: "Reddit", icon: RedditIcon, description: "Casual, discussion-oriented", credits: 2 },
  { id: "quora", name: "Quora", icon: QuoraIcon, description: "Concise, authority-driven answers", credits: 2 },
  { id: "twitter", name: "Twitter/X", icon: TwitterIcon, description: "Short, punchy threads", credits: 1 },
  { id: "instagram", name: "Instagram", icon: InstagramIcon, description: "Visual captions with hashtags", credits: 1 },
  { id: "youtube", name: "YouTube", icon: YoutubeIcon, description: "Engaging video descriptions", credits: 2 },
  { id: "newsletter", name: "Newsletter", icon: NewsletterIcon, description: "Email-friendly format", credits: 2 },
  { id: "tiktok", name: "TikTok", icon: TikTokIcon, description: "Short video scripts", credits: 1 },
];
