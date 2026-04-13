import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, 
  Search, 
  ExternalLink, 
  ArrowRight, 
  Tag,
  Mail,
  Building2,
  Verified,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface BrandProfile {
  id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
  lookingFor: string[];
  platforms: string[];
  typicalBudget: string;
  minFollowers: string;
  verified: boolean;
  activeCampaigns: number;
  website?: string;
  tags: string[];
}

const catBrands: BrandProfile[] = [
  {
    id: "chewy",
    name: "Chewy",
    logo: "🛒",
    category: "Pet Supplies",
    description: "America's largest pet retailer. We regularly work with cat content creators for product launches, seasonal campaigns, and evergreen UGC.",
    lookingFor: ["Product reviews", "Lifestyle content", "Unboxing videos", "Before & after transformations"],
    platforms: ["TikTok", "Instagram", "YouTube"],
    typicalBudget: "$500–$5,000",
    minFollowers: "5K",
    verified: true,
    activeCampaigns: 3,
    website: "chewy.com",
    tags: ["Food", "Treats", "Toys", "Supplies"],
  },
  {
    id: "purina",
    name: "Purina",
    logo: "🐾",
    category: "Cat Food",
    description: "Purina's creator program partners with authentic cat content creators to show the real bond between cats and their food.",
    lookingFor: ["Feeding content", "Health journeys", "Picky eater stories", "Cat nutrition education"],
    platforms: ["Instagram", "TikTok", "Facebook"],
    typicalBudget: "$300–$2,000",
    minFollowers: "3K",
    verified: true,
    activeCampaigns: 2,
    website: "purina.com",
    tags: ["Food", "Health", "Nutrition"],
  },
  {
    id: "meow-mix",
    name: "Meow Mix",
    logo: "😺",
    category: "Cat Food",
    description: "We love creator content that shows cats being authentically themselves. Funny, quirky, relatable — that's our brand.",
    lookingFor: ["Comedic cat content", "Reaction videos", "Day in the life", "Cat personality spotlights"],
    platforms: ["TikTok", "Instagram"],
    typicalBudget: "$200–$800",
    minFollowers: "2K",
    verified: true,
    activeCampaigns: 1,
    website: "meowmix.com",
    tags: ["Food", "Comedy", "Lifestyle"],
  },
  {
    id: "temptations",
    name: "Temptations Treats",
    logo: "🎉",
    category: "Cat Treats",
    description: "The treat cats go crazy for. We want content that captures that undeniable treat-time reaction.",
    lookingFor: ["Treat reaction videos", "Training content", "Before/after bonding stories"],
    platforms: ["TikTok", "Instagram", "YouTube Shorts"],
    typicalBudget: "$150–$1,000",
    minFollowers: "1K",
    verified: true,
    activeCampaigns: 2,
    website: "temptationstreats.com",
    tags: ["Treats", "Reactions", "Training"],
  },
  {
    id: "litter-robot",
    name: "Litter-Robot",
    logo: "🤖",
    category: "Cat Tech",
    description: "Premium self-cleaning litter box brand. We work with creators who focus on cat care, home organization, and pet tech.",
    lookingFor: ["Setup/unboxing", "Before & after clean routines", "Cat reaction to new litter box", "Product comparisons"],
    platforms: ["YouTube", "Instagram", "TikTok"],
    typicalBudget: "$1,000–$5,000",
    minFollowers: "10K",
    verified: true,
    activeCampaigns: 1,
    website: "litter-robot.com",
    tags: ["Tech", "Litter", "Home", "Premium"],
  },
  {
    id: "wild-one",
    name: "Wild One",
    logo: "✨",
    category: "Premium Pet Brand",
    description: "Design-forward pet lifestyle brand. We look for creators with an aesthetic that matches our clean, modern vibe.",
    lookingFor: ["Lifestyle content", "Home aesthetics", "Cat + owner styling", "Product flat lays"],
    platforms: ["Instagram", "Pinterest", "TikTok"],
    typicalBudget: "$500–$3,000",
    minFollowers: "5K",
    verified: false,
    activeCampaigns: 1,
    website: "wildone.com",
    tags: ["Lifestyle", "Design", "Premium", "Aesthetic"],
  },
  {
    id: "fresh-step",
    name: "Fresh Step",
    logo: "🌿",
    category: "Cat Litter",
    description: "We partner with real cat households to show authentic litter performance. Real cats, real results.",
    lookingFor: ["Honest product reviews", "Multi-cat household content", "Odor control testimonials"],
    platforms: ["YouTube", "Instagram", "TikTok"],
    typicalBudget: "$200–$1,500",
    minFollowers: "3K",
    verified: true,
    activeCampaigns: 0,
    website: "freshstep.com",
    tags: ["Litter", "Odor", "Home"],
  },
  {
    id: "royal-canin",
    name: "Royal Canin",
    logo: "👑",
    category: "Veterinary Cat Food",
    description: "Science-based nutrition for cats. We prefer working with creators who value cat health and wellness content.",
    lookingFor: ["Health & wellness content", "Breed-specific content", "Senior/kitten care stories", "Vet-recommended narratives"],
    platforms: ["Instagram", "YouTube", "Facebook"],
    typicalBudget: "$500–$3,000",
    minFollowers: "5K",
    verified: true,
    activeCampaigns: 1,
    website: "royalcanin.com",
    tags: ["Health", "Nutrition", "Breeds", "Premium"],
  },
];

const categories = ["All", "Cat Food", "Cat Treats", "Cat Tech", "Pet Supplies", "Premium Pet Brand", "Cat Litter", "Veterinary Cat Food"];

export default function Brands() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("discover");

  const filtered = catBrands.filter((b) => {
    const matchesSearch =
      search === "" ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === "All" || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Brand Hub</Badge>
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-3" data-testid="text-brands-title">
                Where brands find creators.
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                We knocked down the wall between cat brands and cat creators. Browse brands looking for 
                content partners, discover what they pay, and reach out directly — no agency middleman.
              </p>
            </div>
            <div className="shrink-0">
              <a href="mailto:hello@coolcatstuff.com?subject=List My Brand on UGCC" className="inline-block">
                <Button className="rounded-full bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20">
                  <Building2 className="mr-2 h-4 w-4" /> List Your Brand
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* How It Works Banner */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10 p-6 rounded-2xl bg-muted/40 border">
          {[
            { icon: "🔍", title: "Discover", desc: "Browse verified cat brands actively looking for creator partners" },
            { icon: "📋", title: "Match", desc: "Filter by your niche, follower count, and preferred platforms" },
            { icon: "🤝", title: "Connect", desc: "Reach out directly with your UGCC media kit — no middleman" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{icon}</span>
              <div>
                <div className="font-bold text-sm">{title}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:w-[360px]">
            <TabsTrigger value="discover" data-testid="tab-discover-brands">
              <Store className="mr-2 h-4 w-4" /> Brand Directory
            </TabsTrigger>
            <TabsTrigger value="campaigns" data-testid="tab-active-campaigns">
              <Tag className="mr-2 h-4 w-4" /> Active Campaigns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brands, categories, or content types..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-brand-search"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-accent text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  data-testid={`filter-${cat.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="text-sm text-muted-foreground">
              Showing {filtered.length} brand{filtered.length !== 1 ? "s" : ""}
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-3 py-20 text-center text-muted-foreground">
                  <Store className="h-10 w-10 mx-auto mb-4 opacity-30" />
                  <p>No brands match your search. Try different keywords.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="p-6 rounded-2xl border border-accent/20 bg-accent/5 text-center space-y-3">
              <div className="text-4xl">📣</div>
              <h3 className="text-xl font-heading font-bold">Active Campaign Board</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Brands post specific UGC campaigns here when they're actively looking for creators right now. 
                Check back often — new campaigns are added weekly.
              </p>
            </div>

            <div className="space-y-4">
              {catBrands.filter((b) => b.activeCampaigns > 0).map((brand) => (
                <div key={brand.id} className="p-5 rounded-2xl border bg-card hover:border-accent/40 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{brand.logo}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{brand.name}</span>
                          {brand.verified && <Verified size={14} className="text-accent" />}
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            {brand.activeCampaigns} active
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{brand.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {brand.lookingFor.slice(0, 2).map((item) => (
                            <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                          ))}
                          <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                            {brand.typicalBudget}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <a
                      href={brand.website ? `https://${brand.website}` : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="rounded-full bg-accent hover:bg-accent/90 text-white shrink-0">
                        Website <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Also check the <Link href="/jobs" className="text-accent hover:underline font-medium">Opportunities Board</Link> for 
                campaigns pulled from Social Cat, Reddit, and other verified platforms.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* For Brands CTA */}
        <div className="mt-20 p-8 rounded-2xl border-2 border-dashed border-accent/30 bg-accent/5 text-center space-y-4">
          <Building2 className="h-10 w-10 text-accent mx-auto" />
          <h3 className="text-2xl font-heading font-bold">Are you a cat brand?</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            List your brand on UGCC and get direct access to our community of cat content creators. 
            Email us and we'll get you set up — no agency fees, no gatekeeping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:hello@coolcatstuff.com?subject=List My Brand on UGCC">
              <Button className="rounded-full bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20">
                <Mail className="mr-2 h-4 w-4" /> Email Us to Get Listed
              </Button>
            </a>
            <a href="https://coolcatstuff.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-full border-2">
                Visit coolcatstuff.com
              </Button>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function BrandCard({ brand }: { brand: BrandProfile }) {
  return (
    <Card className="hover:border-accent/40 hover:shadow-md transition-all group" data-testid={`card-brand-${brand.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{brand.logo}</div>
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-base">{brand.name}</CardTitle>
                {brand.verified && <Verified size={14} className="text-accent shrink-0" />}
              </div>
              <CardDescription className="text-xs">{brand.category}</CardDescription>
            </div>
          </div>
          {brand.activeCampaigns > 0 && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shrink-0 text-xs">
              {brand.activeCampaigns} open
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">{brand.description}</p>
        
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Looking for</p>
          <div className="flex flex-wrap gap-1.5">
            {brand.lookingFor.slice(0, 3).map((item) => (
              <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-muted-foreground">Budget: </span>
            <span className="font-semibold text-accent">{brand.typicalBudget}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Min: </span>
            <span className="font-semibold">{brand.minFollowers} followers</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {brand.tags.map((tag) => (
            <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          {brand.website && (
            <a
              href={`https://${brand.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button size="sm" className="w-full rounded-lg bg-accent hover:bg-accent/90 text-white text-xs">
                <ExternalLink size={12} className="mr-1.5" /> Visit Website
              </Button>
            </a>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground pt-1">
          Budget ranges are industry estimates based on published UGC program data.
        </p>
      </CardContent>
    </Card>
  );
}
