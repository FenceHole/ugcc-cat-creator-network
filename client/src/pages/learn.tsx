import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Play, 
  Clock, 
  DollarSign, 
  FileText, 
  Shield, 
  Smartphone,
  CheckCircle2,
} from "lucide-react";

const categories = [
  { id: "basics", label: "🐾 Getting Started", icon: BookOpen },
  { id: "video", label: "🎬 Video & Content", icon: Play },
  { id: "money", label: "💰 Monetization", icon: DollarSign },
  { id: "platforms", label: "📱 Platforms", icon: Smartphone },
  { id: "business", label: "📄 Business Tools", icon: FileText },
  { id: "brands", label: "🤝 Brand Deals", icon: Shield },
];

const lessons: Record<string, {
  emoji: string;
  title: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  keyPoints: string[];
  id: string;
}[]> = {
  basics: [
    {
      id: "what-is-ugcc",
      emoji: "🐱",
      title: "What Is a Cat Content Creator?",
      duration: "5 min read",
      level: "Beginner",
      summary: "Understand what separates a casual poster from a professional cat content creator, and what the industry actually looks like.",
      keyPoints: [
        "The difference between a pet account and a creator business",
        "What UGC (User Generated Content) actually means in the industry",
        "Why brands need cat content and what they're really buying",
        "The landscape: nano, micro, mid-tier, macro, and mega creators",
      ],
    },
    {
      id: "your-first-media-kit",
      emoji: "📋",
      title: "Your First Media Kit: What It Is and Why You Need One",
      duration: "8 min read",
      level: "Beginner",
      summary: "Media kits are your professional resume as a creator. Brands will ask for one — here's exactly what goes in it.",
      keyPoints: [
        "What a media kit is and what it communicates to brands",
        "The 5 things every media kit must include",
        "What brands look at first (hint: it's not just follower count)",
        "How to make yours stand out with real metrics",
      ],
    },
    {
      id: "linktree-funnel",
      emoji: "🔗",
      title: "Linktree, Your Bio, and Building a Creator Funnel",
      duration: "10 min read",
      level: "Beginner",
      summary: "Your bio link is the front door to your creator business. Learn how to turn it into a real marketing funnel that works for you 24/7.",
      keyPoints: [
        "Why your link-in-bio is the most important real estate you have",
        "Linktree vs. your own website — what you actually need",
        "How to build a funnel: social → link → email → brand",
        "What to link and what order to put things in",
      ],
    },
    {
      id: "real-metrics",
      emoji: "📊",
      title: "Real Metrics vs. Vanity Metrics",
      duration: "7 min read",
      level: "Beginner",
      summary: "Follower count is the last thing a smart brand looks at. Learn which numbers actually matter and how to present them.",
      keyPoints: [
        "Engagement rate: what it is and how to calculate yours",
        "Why a creator with 10K engaged followers beats one with 100K passive ones",
        "What brands actually look for in a media kit",
        "How to pull and present your real stats (not just the pretty ones)",
      ],
    },
  ],
  video: [
    {
      id: "hooks",
      emoji: "🪝",
      title: "The Hook: Why the First 3 Seconds Are Everything",
      duration: "12 min read",
      level: "Beginner",
      summary: "The algorithm judges your video in the first 3 seconds. Master the hook and everything else gets easier.",
      keyPoints: [
        "What a hook is and why it determines your video's reach",
        "The 5 types of hooks that work for cat content",
        "Pattern interrupts — how to stop the scroll",
        "Examples of strong hooks for TikTok, Reels, and YouTube Shorts",
      ],
    },
    {
      id: "watch-time",
      emoji: "⏱️",
      title: "Watch Time and Completion Rate: The Algorithm's Secret Weapon",
      duration: "10 min read",
      level: "Intermediate",
      summary: "It's not just about getting views — it's about holding attention. Here's how watch time works and how to improve yours.",
      keyPoints: [
        "What watch time and completion rate are",
        "Why these metrics matter more than views or likes",
        "How to structure a video to maximize retention",
        "The 'loop' technique — making videos people rewatch",
      ],
    },
    {
      id: "cat-content-types",
      emoji: "🐾",
      title: "What Kind of Cat Content Performs Best on Each Platform",
      duration: "15 min read",
      level: "Intermediate",
      summary: "What goes viral on TikTok tanks on YouTube. Learn to tailor your cat content to each platform's unique audience and algorithm.",
      keyPoints: [
        "TikTok: trends, sounds, and fast cuts",
        "Instagram Reels vs. Feed posts — when to use what",
        "YouTube Shorts vs. long-form cat content",
        "Facebook and Pinterest — the underrated cat content goldmines",
      ],
    },
    {
      id: "trending-sounds",
      emoji: "🎵",
      title: "Using Trending Sounds Without Chasing Every Trend",
      duration: "8 min read",
      level: "Beginner",
      summary: "Trending audio can boost your reach but it's a trap if used wrong. Here's how to use sounds strategically.",
      keyPoints: [
        "How trending audio boosts distribution on TikTok and Reels",
        "How to find sounds that are trending before they peak",
        "Making your cat content fit trending audio naturally",
        "When NOT to use a trend — protecting your brand",
      ],
    },
  ],
  money: [
    {
      id: "rate-101",
      emoji: "💸",
      title: "Rate 101: What Should You Actually Charge?",
      duration: "15 min read",
      level: "Beginner",
      summary: "There's a formula for pricing — and it's not based on vibes. Learn how to calculate a rate that reflects your real value.",
      keyPoints: [
        "The industry standard formula: CPM + engagement + usage rights",
        "Why follower count alone is NOT how you price yourself",
        "The difference between UGC rates and influencer rates",
        "Using UGCC's Rate Checker to see what others are charging",
      ],
    },
    {
      id: "product-exchange",
      emoji: "🚫",
      title: "Product Exchange: When It's Worth It and When to Walk Away",
      duration: "10 min read",
      level: "Beginner",
      summary: "Free product is not a rate. But sometimes it makes sense. Here's how to evaluate every product collab offer.",
      keyPoints: [
        "What 'exposure' and 'product exchange' actually cost you",
        "When gifted collaborations can be worth it (and when they can't)",
        "How to calculate the monetary value of a product offer",
        "Template: how to counter a product-only offer professionally",
      ],
    },
    {
      id: "rate-card",
      emoji: "📄",
      title: "Creating a Rate Card Brands Will Take Seriously",
      duration: "12 min read",
      level: "Intermediate",
      summary: "A rate card isn't just a price list — it's a statement of your value. Here's how to build one that gets respect.",
      keyPoints: [
        "What belongs on a rate card: deliverables, platforms, usage rights, exclusivity",
        "How to structure tiered packages (single vs. bundle deals)",
        "When to show your rate card and when to wait",
        "Using UGCC's AI to generate a rate card from your actual stats",
      ],
    },
    {
      id: "negotiation",
      emoji: "🤝",
      title: "How to Negotiate with Brands (And Win)",
      duration: "20 min read",
      level: "Intermediate",
      summary: "Most creators accept the first offer. The ones who don't make significantly more money. Here's exactly how to negotiate.",
      keyPoints: [
        "The rule: whoever says a number first, loses",
        "How to respond when a brand lowballs you",
        "Negotiating beyond money: usage rights, exclusivity, and timeline",
        "Scripts and templates for common negotiation scenarios",
      ],
    },
  ],
  platforms: [
    {
      id: "tiktok-algorithm",
      emoji: "📱",
      title: "How TikTok's Algorithm Works in 2025",
      duration: "12 min read",
      level: "Intermediate",
      summary: "TikTok doesn't show your content to your followers first — it shows it to strangers. Understanding this changes everything.",
      keyPoints: [
        "How TikTok decides who sees your content (For You Page logic)",
        "The signals TikTok weighs: completion, shares, comments, rewatches",
        "Why posting time matters less than you think",
        "How to 'reset' a video that isn't performing",
      ],
    },
    {
      id: "instagram-algorithm",
      emoji: "📸",
      title: "Instagram Reels vs. Feed: What Still Works in 2025",
      duration: "10 min read",
      level: "Intermediate",
      summary: "Instagram has changed a lot. Here's what the algorithm rewards for cat creators right now.",
      keyPoints: [
        "Reels vs. carousels vs. photos — what gets pushed in 2025",
        "How Instagram decides to share your Reel beyond your followers",
        "The role of comments and saves (not just likes)",
        "Cross-posting from TikTok: what to know",
      ],
    },
    {
      id: "youtube-cats",
      emoji: "▶️",
      title: "YouTube for Cat Creators: Long-Form vs. Shorts Strategy",
      duration: "15 min read",
      level: "Intermediate",
      summary: "YouTube has two separate algorithms. Learn how to use both to grow your cat channel strategically.",
      keyPoints: [
        "How YouTube Shorts feeds into (or competes with) your main channel",
        "What YouTube rewards: click-through rate and watch time",
        "The best cat content formats for long-form YouTube",
        "Monetization on YouTube: when and how you qualify",
      ],
    },
  ],
  business: [
    {
      id: "media-kit-deep-dive",
      emoji: "📋",
      title: "Building a Media Kit That Gets You Hired",
      duration: "18 min read",
      level: "Intermediate",
      summary: "A deep dive into every element of a professional media kit, with examples of what works and what doesn't.",
      keyPoints: [
        "Page 1: Your intro, bio, and brand alignment statement",
        "Page 2: Your real stats — follower counts, engagement, reach",
        "Page 3: Audience demographics — who actually watches you",
        "Page 4: Past work, testimonials, and brand examples",
        "How to use UGCC's Kit Builder to generate this in minutes",
      ],
    },
    {
      id: "contracts",
      emoji: "✍️",
      title: "Creator Contracts: What to Expect and What to Demand",
      duration: "15 min read",
      level: "Advanced",
      summary: "Brands send you contracts. You can send them back. Here's what to look for and what to add.",
      keyPoints: [
        "The 6 clauses every creator contract must include",
        "Red flags: exclusivity, perpetual licensing, and kill fees",
        "What to do when a brand has no contract",
        "Using UGCC's AI to generate and analyze contracts",
      ],
    },
    {
      id: "invoicing",
      emoji: "🧾",
      title: "How to Invoice a Brand (And Get Paid on Time)",
      duration: "8 min read",
      level: "Beginner",
      summary: "Getting paid sounds simple. It's not always. Here's how to invoice professionally and what to do when payment is late.",
      keyPoints: [
        "What to include on a creator invoice",
        "Net 30, Net 60 — what these terms mean and how to negotiate payment timing",
        "How to follow up on late payments without burning the relationship",
        "Tools for invoicing as a creator business",
      ],
    },
  ],
  brands: [
    {
      id: "reading-brand-emails",
      emoji: "📧",
      title: "How to Read a Brand Email (Before You Reply)",
      duration: "10 min read",
      level: "Beginner",
      summary: "Every brand email is telling you something between the lines. Learn what to look for before you respond.",
      keyPoints: [
        "Signs of a legit inquiry vs. a scam or time-waster",
        "What 'gifted collaboration' really means",
        "What information to gather before quoting a rate",
        "Using UGCC's Deal Analyzer to decode any brand email",
      ],
    },
    {
      id: "finding-brands",
      emoji: "🔍",
      title: "Where to Find Cat-Friendly Brands That Actually Pay",
      duration: "12 min read",
      level: "Beginner",
      summary: "The best deals don't always come to you. Learn where to proactively find brand opportunities that are worth your time.",
      keyPoints: [
        "UGCC's Opportunities board and Brand Hub",
        "Social Cat, AspireIQ, and other reputable creator platforms",
        "How to approach a brand cold (and what to say)",
        "Which cat brands are known for paying creators fairly",
      ],
    },
    {
      id: "red-flags",
      emoji: "🚩",
      title: "Red Flags: How to Spot a Bad Brand Deal Before It Wastes Your Time",
      duration: "10 min read",
      level: "Beginner",
      summary: "Not every collaboration is worth taking. These are the warning signs that should make you pause or walk away.",
      keyPoints: [
        "\"We don't pay but the exposure is amazing\" — and other lies",
        "Unrealistic deliverable demands for the pay offered",
        "Contracts with unlimited usage rights for minimal compensation",
        "How the community trust score helps protect you on UGCC",
      ],
    },
    {
      id: "pitch-yourself",
      emoji: "🎯",
      title: "How to Pitch Yourself to a Brand (Cold Outreach That Works)",
      duration: "15 min read",
      level: "Intermediate",
      summary: "Waiting for brands to find you limits your income. Here's how to proactively pitch yourself and get a yes.",
      keyPoints: [
        "How to research a brand before reaching out",
        "The elements of a pitch email that gets opened and replied to",
        "How to attach your media kit for maximum impact",
        "Following up: the right timing and tone",
      ],
    },
  ],
};

export default function Learn() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Education Hub</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4" data-testid="text-learn-title">
            Learn what no one tells you.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            UGCC's education hub is built on the real lessons cat content creators learned the hard way. 
            From day one basics to advanced brand negotiation — taught by creators who've been there.
          </p>
        </div>

        {/* Each One Teach One Banner */}
        <div className="bg-gradient-to-r from-accent/10 via-orange-500/5 to-accent/10 border border-accent/20 rounded-2xl p-6 mb-12 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-4xl">🐱</div>
          <div>
            <h3 className="font-heading font-bold text-lg mb-1">Each One Teach One</h3>
            <p className="text-sm text-muted-foreground">
              This community runs on shared knowledge. If you're a seasoned creator and want to contribute a lesson, 
              share your expertise in the <span className="text-accent font-semibold">Pro Creators group</span> in our community.
            </p>
          </div>
          <div className="shrink-0 sm:ml-auto">
            <Link href="/community">
              <Button variant="outline" size="sm" className="rounded-full border-accent/30 text-accent hover:bg-accent hover:text-white">
                Go to Community
              </Button>
            </Link>
          </div>
        </div>

        {/* Lessons by Category */}
        <Tabs defaultValue="basics" className="space-y-8">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
            {categories.map(({ id, label }) => (
              <TabsTrigger 
                key={id} 
                value={id}
                className="rounded-full border px-4 py-2 text-sm data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:border-accent"
                data-testid={`tab-${id}`}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(lessons).map(([categoryId, categoryLessons]) => (
            <TabsContent key={categoryId} value={categoryId} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {categoryLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Reference Section */}
        <div className="mt-20 pt-12 border-t">
          <h2 className="text-2xl font-heading font-bold mb-8">Quick Reference Cards</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickRef
              emoji="💰"
              title="Minimum Rates by Tier"
              points={[
                "Nano (1K–10K): $50–$150 per post",
                "Micro (10K–50K): $150–$500 per post",
                "Mid (50K–200K): $500–$2,000 per post",
                "Macro (200K+): $2,000+ per post",
                "Always add 25% for exclusivity",
              ]}
            />
            <QuickRef
              emoji="📊"
              title="Good Engagement Rate Benchmarks"
              points={[
                "Instagram: 3–6% is solid, 6%+ is excellent",
                "TikTok: 5–10% is average, 10%+ is strong",
                "YouTube: 3–5% is healthy",
                "Below 1%? Time to audit your content strategy",
                "UGCC Rate Checker shows your real standing",
              ]}
            />
            <QuickRef
              emoji="🚩"
              title="Brand Deal Red Flags"
              points={[
                "\"Exposure\" offered instead of payment",
                "Perpetual, worldwide usage rights",
                "No contract or agreement in writing",
                "Deliverables not clearly defined",
                "Asking to own your account access",
              ]}
            />
            <QuickRef
              emoji="🪝"
              title="Hook Formula for Cat Videos"
              points={[
                "Start mid-action (never with intro)",
                "Use text overlay in first 1 second",
                "Lead with the most surprising moment",
                "Ask a question viewers must answer",
                "Show result first, then the build-up",
              ]}
            />
            <QuickRef
              emoji="📋"
              title="Media Kit Must-Haves"
              points={[
                "Profile photo + display name + handles",
                "Engagement rate (not just follower count)",
                "Audience demographics (age, location)",
                "Past brand collaborations + examples",
                "Rate card or 'rates upon request'",
              ]}
            />
            <QuickRef
              emoji="✍️"
              title="Contract Non-Negotiables"
              points={[
                "Payment amount and due date",
                "Deliverables with exact specs",
                "Usage rights scope and duration",
                "Revision policy (max 2 rounds)",
                "Kill fee clause (25–50% if cancelled)",
              ]}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function LessonCard({ lesson }: { lesson: typeof lessons.basics[0] }) {
  const levelColors: Record<string, string> = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-amber-100 text-amber-700",
    Advanced: "bg-red-100 text-red-700",
  };

  return (
    <Card className="hover:border-accent/40 hover:shadow-md transition-all group" data-testid={`card-lesson-${lesson.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="text-3xl">{lesson.emoji}</div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${levelColors[lesson.level]}`}>
              {lesson.level}
            </span>
          </div>
        </div>
        <CardTitle className="text-base font-bold group-hover:text-accent transition-colors leading-snug">
          {lesson.title}
        </CardTitle>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={12} />
          {lesson.duration}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{lesson.summary}</p>
        <div className="space-y-1.5">
          {lesson.keyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 size={12} className="text-accent mt-0.5 shrink-0" />
              {point}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickRef({ emoji, title, points }: { emoji: string; title: string; points: string[] }) {
  return (
    <div className="p-5 rounded-2xl border bg-card hover:border-accent/30 transition-colors">
      <div className="text-2xl mb-2">{emoji}</div>
      <h3 className="font-bold text-sm mb-3">{title}</h3>
      <ul className="space-y-1.5">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="text-accent shrink-0">•</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
