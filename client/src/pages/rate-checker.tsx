import { useState } from "react";
import { Layout } from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  Award,
  AlertCircle,
  CheckCircle2,
  Lightbulb
} from "lucide-react";

interface RateCheckResult {
  tier: "beginner" | "intermediate" | "pro";
  tierMessage: string;
  userRate: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  minimumFloor: number;
  suggestedRange: { min: number; max: number };
  followerRange: string;
  rateRatio: number;
  tips: string[];
}

const NICHES = [
  "Cat Content",
  "Cat UGC",
  "Rescue & Advocacy",
  "Cat Breeds",
  "Kittens",
  "Senior Cats",
  "Multi-Cat Household",
  "Cat Food & Nutrition",
  "Cat Tech",
  "Cat Lifestyle",
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter" },
];

const DELIVERABLES = [
  { value: "post", label: "Feed Post" },
  { value: "story", label: "Story" },
  { value: "reel", label: "Reel / Short Video" },
  { value: "video", label: "Long-form Video" },
  { value: "carousel", label: "Carousel" },
  { value: "live", label: "Live Stream" },
];

async function checkRate(params: {
  niche: string;
  platform: string;
  deliverable: string;
  followers: number;
  currentRate: number;
}): Promise<RateCheckResult> {
  const searchParams = new URLSearchParams({
    niche: params.niche,
    platform: params.platform,
    deliverable: params.deliverable,
    followers: params.followers.toString(),
    currentRate: params.currentRate.toString(),
  });
  const response = await fetch(`/api/pricing/check?${searchParams}`);
  if (!response.ok) throw new Error("Failed to check rate");
  return response.json();
}

function getTierColor(tier: string) {
  switch (tier) {
    case "beginner":
      return "bg-red-500";
    case "intermediate":
      return "bg-amber-500";
    case "pro":
      return "bg-emerald-500";
    default:
      return "bg-gray-500";
  }
}

function getTierBadgeVariant(tier: string) {
  switch (tier) {
    case "beginner":
      return "destructive" as const;
    case "intermediate":
      return "secondary" as const;
    case "pro":
      return "default" as const;
    default:
      return "outline" as const;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function RateChecker() {
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("");
  const [deliverable, setDeliverable] = useState("");
  const [followers, setFollowers] = useState("");
  const [currentRate, setCurrentRate] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);
  
  const isFormValid = niche && platform && deliverable && followers && currentRate;
  
  const { data: result, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/pricing/check", niche, platform, deliverable, followers, currentRate],
    queryFn: () => checkRate({
      niche,
      platform,
      deliverable,
      followers: parseInt(followers, 10),
      currentRate: parseFloat(currentRate),
    }),
    enabled: shouldFetch && isFormValid,
  });
  
  const handleCheck = () => {
    if (isFormValid) {
      setShouldFetch(true);
      refetch();
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">💰 Rate Reality Checker</h1>
          <p className="text-lg text-muted-foreground">
            Stop guessing. Find out exactly what cat content creators with your reach are charging — 
            and whether you're leaving money on the table.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Check Your Rate
              </CardTitle>
              <CardDescription>
                Enter your details to see how your rate stacks up against industry benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="niche">Your Niche</Label>
                  <Select value={niche} onValueChange={setNiche}>
                    <SelectTrigger id="niche" data-testid="select-niche">
                      <SelectValue placeholder="Select niche" />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((n) => (
                        <SelectItem key={n} value={n.toLowerCase()}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="platform" data-testid="select-platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deliverable">Deliverable Type</Label>
                  <Select value={deliverable} onValueChange={setDeliverable}>
                    <SelectTrigger id="deliverable" data-testid="select-deliverable">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERABLES.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="followers">Follower Count</Label>
                  <Input
                    id="followers"
                    type="number"
                    placeholder="e.g., 25000"
                    value={followers}
                    onChange={(e) => setFollowers(e.target.value)}
                    data-testid="input-followers"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rate">Your Current Rate ($)</Label>
                  <Input
                    id="rate"
                    type="number"
                    placeholder="e.g., 200"
                    value={currentRate}
                    onChange={(e) => setCurrentRate(e.target.value)}
                    data-testid="input-rate"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={handleCheck} 
                    disabled={!isFormValid || isLoading}
                    className="w-full"
                    size="lg"
                    data-testid="button-check"
                  >
                    {isLoading ? "Analyzing..." : "Check My Rate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}
          
          {error && (
            <Card className="border-red-200 dark:border-red-900">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <p>Failed to analyze your rate. Please try again.</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {result && !isLoading && (
            <div className="space-y-6">
              <Card className={`border-2 ${result.tier === "beginner" ? "border-red-400" : result.tier === "intermediate" ? "border-amber-400" : "border-emerald-400"}`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={getTierBadgeVariant(result.tier)} 
                          className={`text-lg px-4 py-1 ${result.tier === "pro" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                          data-testid="badge-tier"
                        >
                          <Award className="h-4 w-4 mr-1" />
                          {result.tier.charAt(0).toUpperCase() + result.tier.slice(1)} Tier
                        </Badge>
                      </div>
                      <p className="text-xl font-semibold" data-testid="text-tier-message">
                        {result.tierMessage}
                      </p>
                    </div>
                    
                    <div className="text-center md:text-right">
                      <p className="text-sm text-muted-foreground mb-1">Your Rate vs Average</p>
                      <p className="text-4xl font-bold" data-testid="text-rate-ratio">
                        {result.rateRatio}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Below Average</span>
                      <span>Average</span>
                      <span>Above Average</span>
                    </div>
                    <div className="relative">
                      <Progress value={Math.min(result.rateRatio, 150) / 1.5} className="h-4" />
                      <div 
                        className={`absolute top-0 h-4 w-1 ${getTierColor(result.tier)} rounded`}
                        style={{ left: `${Math.min(result.rateRatio, 150) / 1.5}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {result.userRate < result.minimumFloor && (
                <Card className="border-red-400 bg-red-50 dark:bg-red-950/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400" data-testid="text-floor-warning">
                          🚨 You should NOT charge less than {formatCurrency(result.minimumFloor)}
                        </p>
                        <p className="text-red-600/80 dark:text-red-400/80 mt-1">
                          Your rate of {formatCurrency(result.userRate)} is below the industry floor for {result.followerRange} followers. 
                          You're leaving money on the table.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Industry Average
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold" data-testid="text-avg-price">
                      {formatCurrency(result.avgPrice)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      for {result.followerRange} followers
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Industry Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold" data-testid="text-industry-range">
                      {formatCurrency(result.minPrice)} - {formatCurrency(result.maxPrice)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      low to high end
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Suggested Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary" data-testid="text-suggested-range">
                      {formatCurrency(result.suggestedRange.min)} - {formatCurrency(result.suggestedRange.max)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      your target range
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {result.tips.length > 0 && (
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Lightbulb className="h-5 w-5" />
                      Tips to Increase Your Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3" data-testid="list-tips">
                      {result.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {result.tier === "pro" && result.tips.length === 0 && (
                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          You're killing it! 🔥
                        </p>
                        <p className="text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                          Your rates are competitive and you're pricing yourself like a pro. 
                          Keep building your portfolio and reputation to push rates even higher.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
