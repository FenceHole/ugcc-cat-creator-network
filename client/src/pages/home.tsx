import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Cat, 
  FileText, 
  DollarSign, 
  Users, 
  TrendingUp, 
  BookOpen, 
  Heart, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  Store, 
  Shield, 
  MessageCircle,
} from "lucide-react";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.04] bg-[radial-gradient(hsl(25,95%,53%)_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-bold uppercase tracking-widest">
              <Cat size={12} />
              User Generated Cat Content
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold leading-[1.08] tracking-tight">
              The network built for{" "}
              <span className="text-gradient-accent">cat creators</span>{" "}
              by cat creators.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Stop figuring it out alone. UGCC is the all-in-one toolkit, community, and agency for cat content creators — 
              whether you're just starting out or a seasoned pro ready to teach what you know.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link href="/builder">
                <Button size="lg" className="rounded-full h-14 px-8 text-base bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all">
                  Build My Creator Kit <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/community">
                <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-base border-2 hover:border-accent/50 hover:text-accent transition-all">
                  <Users className="mr-2 h-4 w-4" /> Join the Community
                </Button>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" /> Free to start
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" /> Cat creators only
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" /> No contracts — we get you contracts
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" /> AI-powered tools
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem / Our Story Section */}
      <section className="py-20 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Our Story</Badge>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                We learned the hard way so you don't have to.
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  When we started creating cat content, we got emails from brands asking for our rate card 
                  and media kit — and we had no idea what those were. We didn't understand algorithms, 
                  hooks, watch time, or engagement rates. We didn't know what platforms needed or how 
                  to steer our audience.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Brands kept offering "product exchange" and we didn't know how much we were being underpaid. 
                  We didn't know where to find real gigs or reputable brands. We didn't have a Linktree, 
                  a funnel, or a single professional tool to show for all our hard work.
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  UGCC is what we wish had existed. It's a community where seasoned creators teach 
                  beginners, where brands can find creators directly, and where everyone has access to 
                  the professional tools that used to only exist inside agencies.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This isn't a competitive space — it's a community. Each one teach one. 
                  We don't do contracts — we get you contracts. And we're building this 
                  for the love of cats, and good causes like{" "}
                  <Link href="/causes" className="text-accent font-semibold hover:underline">Vet Van Fleet</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent">The Toolkit</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Everything you need. All in one place.</h2>
            <p className="text-muted-foreground text-lg">
              AI-powered tools built specifically for cat content creators to help you look professional, 
              know your worth, and close better deals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <ToolCard
              icon={<FileText className="h-6 w-6" />}
              href="/builder"
              title="Media Kit & Rate Card Builder"
              description="Enter your handles and we pull your real stats. AI generates a professional media kit and rate card based on industry standards — no design skills needed."
              badge="AI-Powered"
              highlight
            />
            <ToolCard
              icon={<DollarSign className="h-6 w-6" />}
              href="/rate-checker"
              title="Rate Checker"
              description="Know exactly what you should be charging. Compare your rates against real community-submitted data from cat creators at every follower tier."
              badge="Real Data"
            />
            <ToolCard
              icon={<TrendingUp className="h-6 w-6" />}
              href="/deal-translator"
              title="Deal Analyzer"
              description="Paste in a brand email or contract and our AI breaks it down — red flags, missing terms, what it's actually worth, and a counter-offer template."
              badge="AI-Powered"
            />
            <ToolCard
              icon={<Sparkles className="h-6 w-6" />}
              href="/deal-translator"
              title="Pitch Package Generator"
              description="Upload a screenshot of a brand email or DM. AI reads it, pulls your real stats, and writes a personalized reply you can send right now."
              badge="AI-Powered"
            />
            <ToolCard
              icon={<TrendingUp className="h-6 w-6" />}
              href="/analytics"
              title="Media Kit Analytics"
              description="See who's viewing your media kit and how long they're spending on it. Real tracking data — no vanity metrics, no guesswork."
              badge="Real Metrics"
            />
            <ToolCard
              icon={<Store className="h-6 w-6" />}
              href="/brands"
              title="Brand Hub"
              description="Brands post their UGC campaigns, cat content needs, and collaboration opportunities directly — no middleman, no wall between you and the deal."
              badge="New"
            />
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24 bg-gradient-to-br from-accent/5 via-background to-orange-500/5 border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="border-accent/30 text-accent">Community</Badge>
              <h2 className="text-3xl md:text-4xl font-heading font-bold">
                A self-governing community where everyone wins.
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                This isn't a competition — it's a movement. UGCC brings together cat creators at every 
                level to learn from each other, share what's working, and lift each other up.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Users size={18} />, text: "Join niche groups by cat category — rescue, breeds, lifestyle, comedy and more" },
                  { icon: <MessageCircle size={18} />, text: "Post questions, share wins, get deal feedback from the community" },
                  { icon: <DollarSign size={18} />, text: "Submit and view anonymous rate data so no creator is left in the dark" },
                  { icon: <Shield size={18} />, text: "Upvote/downvote opportunities so the community keeps each other safe from bad brands" },
                ].map(({ icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                      {icon}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
              <Link href="/community">
                <Button className="rounded-full bg-accent hover:bg-accent/90 text-white">
                  Enter the Community <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CommunityGroupCard
                emoji="🐱"
                name="Beginners Circle"
                members="Growing fast"
                desc="New to cat content? Start here. No question is too small."
              />
              <CommunityGroupCard
                emoji="💰"
                name="Brand Deals"
                members="Active"
                desc="Share deal offers, get community feedback, negotiate together."
              />
              <CommunityGroupCard
                emoji="🎬"
                name="Reels & TikToks"
                members="Active"
                desc="Short form cat video strategies, hooks, and trending sounds."
              />
              <CommunityGroupCard
                emoji="🏠"
                name="Rescue & Advocacy"
                members="Growing"
                desc="Creators using their platforms for rescue, awareness, and change."
              />
              <CommunityGroupCard
                emoji="⭐"
                name="Pro Creators"
                members="Verified"
                desc="For established creators to mentor, teach, and collaborate."
              />
              <CommunityGroupCard
                emoji="🤝"
                name="Brand HQ"
                members="Open"
                desc="Brands post campaigns. Creators find opportunities directly."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Opportunities / Job Board Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-5 order-last md:order-first">
              <div className="p-5 rounded-2xl border bg-card space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-accent" />
                  <span className="font-semibold text-sm">Live on the Opportunities Board</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The board pulls from Social Cat, Reddit UGC communities, and posts submitted directly by brands in our network. 
                  Every listing goes through community voting — creators upvote or flag based on real experience.
                </p>
                <div className="pt-1 space-y-2 text-sm">
                  {[
                    "Community trust votes on every listing",
                    "Filter by platform, pay type, and follower tier",
                    "Apply directly with your UGCC media kit",
                    "Flag bad actors — the community protects each other",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 size={14} className="text-accent shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-2xl border border-accent/20 bg-accent/5 space-y-2">
                <p className="text-sm font-semibold">Brands like Chewy, Purina, Temptations, and Litter-Robot</p>
                <p className="text-xs text-muted-foreground">
                  regularly hire cat UGC creators across all platforms. Budgets typically range from $150 for nano creators to $5,000+ for established accounts — based on deliverables, usage rights, and exclusivity.
                </p>
              </div>
              <Link href="/jobs">
                <Button className="rounded-full bg-accent hover:bg-accent/90 text-white w-full sm:w-auto">
                  Browse Opportunities <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-6">
              <Badge variant="outline" className="border-accent/30 text-accent">Opportunities</Badge>
              <h2 className="text-3xl md:text-4xl font-heading font-bold">
                Real gigs from real brands. No gatekeeping.
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                We surface opportunities from the most reputable sources and let the community 
                vet them — so you spend your energy applying, not researching whether a brand is legit.
              </p>
              <div className="space-y-3">
                {[
                  "New opportunities posted regularly from verified sources",
                  "Community trust scores keep bad brands out",
                  "No follower minimum — nano creators welcome",
                  "One-click apply with your media kit from your UGCC profile",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 size={16} className="text-accent shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learn Section */}
      <section className="py-24 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Education Hub</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Learn what no one tells you.
            </h2>
            <p className="text-muted-foreground text-lg">
              From hooks to funnels to rate negotiation — everything the industry expects you 
              to already know, explained clearly.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: "🪝", title: "Hooks & Watch Time", desc: "Why the first 3 seconds of your video determines everything and how to nail it." },
              { icon: "📊", title: "Understanding Algorithms", desc: "What TikTok, Instagram, and YouTube actually reward — and how to work with them." },
              { icon: "💰", title: "Rate Negotiation", desc: "How to respond when brands low-ball you, what to say, and what to ask for." },
              { icon: "🔗", title: "Building Your Funnel", desc: "Linktree, your website, your email list — how to connect them into a real business." },
              { icon: "📄", title: "Media Kits & Rate Cards", desc: "What they are, what to put in them, and why brands can't work without them." },
              { icon: "🤝", title: "Brand Deal Anatomy", desc: "What a good brand deal looks like and what red flags to watch for in contracts." },
              { icon: "📱", title: "Platform Strategies", desc: "What kind of cat content works on each platform and how to tailor your approach." },
              { icon: "📈", title: "Growing Your Audience", desc: "Real growth strategies that don't involve buying followers or gaming the system." },
            ].map(({ icon, title, desc }, i) => (
              <Link key={i} href="/learn">
                <div className="bg-card p-6 rounded-2xl border hover:border-accent/40 hover:shadow-md transition-all cursor-pointer h-full">
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="font-bold text-sm mb-2">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/learn">
              <Button variant="outline" className="rounded-full border-2 hover:border-accent hover:text-accent">
                <BookOpen className="mr-2 h-4 w-4" /> Explore All Lessons
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Vet Van Fleet / Causes Section */}
      <section className="py-24 bg-gradient-to-br from-orange-500/10 via-accent/5 to-red-500/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-accent" />
            </div>
            <Badge variant="outline" className="border-accent/30 text-accent">Our Purpose</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold">
              Great cat content should do more than go viral.
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg max-w-2xl mx-auto">
              UGCC is proud to support <strong>Vet Van Fleet</strong> — our nonprofit initiative 
              to bring free veterinary healthcare directly to cats in need through mobile clinics. 
              When you succeed as a creator, a piece of that goes toward the cats who need it most.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 pt-4">
              <div className="bg-card/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30">
                <div className="text-3xl font-heading font-extrabold text-accent mb-1">Free</div>
                <div className="text-sm text-muted-foreground">Vet care for cats who need it most</div>
              </div>
              <div className="bg-card/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30">
                <div className="text-3xl font-heading font-extrabold text-accent mb-1">Mobile</div>
                <div className="text-sm text-muted-foreground">We go where the cats are</div>
              </div>
              <div className="bg-card/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30">
                <div className="text-3xl font-heading font-extrabold text-accent mb-1">Creator-Led</div>
                <div className="text-sm text-muted-foreground">Funded in part by our creator community</div>
              </div>
            </div>
            <Link href="/causes">
              <Button className="rounded-full bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20">
                <Heart className="mr-2 h-4 w-4" /> Learn More About Vet Van Fleet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="text-5xl">🐱</div>
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold">
              Ready to turn your cat content into a career?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Build your creator kit, know your rates, analyze brand deals, and connect with 
              a community that actually wants you to succeed — and the cats to be okay.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link href="/builder">
                <Button size="lg" className="rounded-full h-14 px-10 text-base bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/25">
                  Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/learn">
                <Button variant="outline" size="lg" className="rounded-full h-14 px-10 text-base border-2">
                  Start Learning
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function ToolCard({ 
  icon, href, title, description, badge, highlight 
}: { 
  icon: React.ReactNode; 
  href: string; 
  title: string; 
  description: string; 
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href}>
      <div className={`group p-6 rounded-2xl border hover:shadow-md transition-all cursor-pointer h-full flex flex-col gap-4 ${
        highlight ? "border-accent/30 bg-accent/5 hover:border-accent/60" : "bg-card hover:border-accent/30"
      }`}>
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl ${highlight ? "bg-accent text-white" : "bg-accent/10 text-accent"}`}>
            {icon}
          </div>
          {badge && (
            <Badge variant="secondary" className={`text-xs ${highlight ? "bg-accent/20 text-accent border-0" : ""}`}>
              {badge}
            </Badge>
          )}
        </div>
        <div>
          <h3 className="font-bold text-base mb-2 group-hover:text-accent transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
          Open tool <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
}

function CommunityGroupCard({ emoji, name, members, desc }: { emoji: string; name: string; members: string; desc: string }) {
  return (
    <div className="p-4 rounded-2xl border bg-card hover:border-accent/40 hover:shadow-sm transition-all">
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="font-bold text-sm">{name}</div>
      <div className="text-xs text-accent font-medium mb-1">{members}</div>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
