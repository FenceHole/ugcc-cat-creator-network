import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { 
  Heart, 
  MessageCircle, 
  Send,
  Users,
  Plus,
  Check,
  LayoutGrid,
  DollarSign,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Scale,
  HelpCircle,
} from "lucide-react";
import type { NicheGroup, CommunityPost, PostComment, CreatorProfile, DealVote } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

// Extended types for API responses
type PostWithProfile = CommunityPost & { profile: CreatorProfile };
type CommentWithProfile = PostComment & { profile: CreatorProfile };

// API Functions
async function fetchGroups(): Promise<NicheGroup[]> {
  const response = await fetch("/api/groups", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch groups");
  return response.json();
}

async function fetchMyGroups(): Promise<NicheGroup[]> {
  const response = await fetch("/api/groups/my", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch my groups");
  return response.json();
}

async function fetchPosts(groupId?: string): Promise<PostWithProfile[]> {
  const url = groupId ? `/api/posts?groupId=${groupId}` : "/api/posts";
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch posts");
  return response.json();
}

async function fetchComments(postId: string): Promise<CommentWithProfile[]> {
  const response = await fetch(`/api/posts/${postId}/comments`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch comments");
  return response.json();
}

async function joinGroup(groupId: string): Promise<void> {
  const response = await fetch(`/api/groups/${groupId}/join`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to join group");
}

async function leaveGroup(groupId: string): Promise<void> {
  const response = await fetch(`/api/groups/${groupId}/leave`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to leave group");
}

async function createPost(content: string, groupId?: string, isDealQuestion?: boolean): Promise<CommunityPost> {
  const response = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content, groupId, isDealQuestion }),
  });
  if (!response.ok) throw new Error("Failed to create post");
  return response.json();
}

async function likePost(postId: string): Promise<void> {
  const response = await fetch(`/api/posts/${postId}/like`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to like post");
}

async function unlikePost(postId: string): Promise<void> {
  const response = await fetch(`/api/posts/${postId}/like`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to unlike post");
}

async function createComment(postId: string, content: string): Promise<PostComment> {
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error("Failed to create comment");
  return response.json();
}

// Anonymous Rate API Functions
interface AnonymousRateStats {
  count: number;
  avgRate: number;
  minRate: number;
  maxRate: number;
  byDeliverable: Record<string, { count: number; avgRate: number }>;
  byFollowerRange: Record<string, { count: number; avgRate: number }>;
}

async function submitAnonymousRate(data: {
  niche: string;
  platform: string;
  deliverable: string;
  followerRange: string;
  rateCharged: number;
  brandType?: string;
  wasNegotiated?: boolean;
  dealOutcome?: string;
}): Promise<void> {
  const response = await fetch("/api/rates/anonymous", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to submit rate");
}

async function fetchAnonymousRateStats(niche: string, platform: string): Promise<AnonymousRateStats> {
  const response = await fetch(`/api/rates/anonymous/stats?niche=${encodeURIComponent(niche)}&platform=${encodeURIComponent(platform)}`);
  if (!response.ok) throw new Error("Failed to fetch rate stats");
  return response.json();
}

// Deal Vote API Functions
interface DealVoteStats {
  takeIt: number;
  pass: number;
  negotiate: number;
  total: number;
}

async function voteDeal(postId: string, vote: string, reason?: string): Promise<DealVote> {
  const response = await fetch(`/api/posts/${postId}/deal-vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ vote, reason }),
  });
  if (!response.ok) throw new Error("Failed to vote on deal");
  return response.json();
}

async function fetchDealVotes(postId: string): Promise<DealVoteStats> {
  const response = await fetch(`/api/posts/${postId}/deal-votes`);
  if (!response.ok) throw new Error("Failed to fetch deal votes");
  return response.json();
}

export default function Community() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [isDealQuestion, setIsDealQuestion] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  
  // Rate Share Form State
  const [rateFormData, setRateFormData] = useState({
    niche: "",
    platform: "",
    deliverable: "",
    followerRange: "",
    rateCharged: "",
    brandType: "",
    wasNegotiated: false,
    dealOutcome: "",
  });
  const [statsNiche, setStatsNiche] = useState("Fashion");
  const [statsPlatform, setStatsPlatform] = useState("Instagram");

  const { data: allGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/groups"],
    queryFn: fetchGroups,
    enabled: !!user,
  });

  const { data: myGroups = [], isLoading: myGroupsLoading } = useQuery({
    queryKey: ["/api/groups/my"],
    queryFn: fetchMyGroups,
    enabled: !!user,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts", selectedGroupId],
    queryFn: () => fetchPosts(selectedGroupId),
    enabled: !!user,
  });

  const { data: rateStats, isLoading: rateStatsLoading } = useQuery({
    queryKey: ["/api/rates/anonymous/stats", statsNiche, statsPlatform],
    queryFn: () => fetchAnonymousRateStats(statsNiche, statsPlatform),
    enabled: activeTab === "rates",
  });

  const submitRateMutation = useMutation({
    mutationFn: submitAnonymousRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rates/anonymous/stats"] });
      setRateFormData({
        niche: "",
        platform: "",
        deliverable: "",
        followerRange: "",
        rateCharged: "",
        brandType: "",
        wasNegotiated: false,
        dealOutcome: "",
      });
      toast({ title: "Rate submitted anonymously! Thank you for contributing." });
    },
    onError: () => {
      toast({ title: "Failed to submit rate", variant: "destructive" });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: joinGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Joined group successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to join group", variant: "destructive" });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: leaveGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Left group successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to leave group", variant: "destructive" });
    },
  });

  const createPostMutation = useMutation({
    mutationFn: ({ content, isDeal }: { content: string; isDeal: boolean }) => 
      createPost(content, selectedGroupId, isDeal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setCreatePostOpen(false);
      setNewPostContent("");
      setIsDealQuestion(false);
      toast({ title: "Post created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create post", variant: "destructive" });
    },
  });
  
  const handleSubmitRate = () => {
    if (!rateFormData.niche || !rateFormData.platform || !rateFormData.deliverable || 
        !rateFormData.followerRange || !rateFormData.rateCharged) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    submitRateMutation.mutate({
      niche: rateFormData.niche,
      platform: rateFormData.platform,
      deliverable: rateFormData.deliverable,
      followerRange: rateFormData.followerRange,
      rateCharged: parseInt(rateFormData.rateCharged),
      brandType: rateFormData.brandType || undefined,
      wasNegotiated: rateFormData.wasNegotiated,
      dealOutcome: rateFormData.dealOutcome || undefined,
    });
  };

  const isLoading = authLoading || groupsLoading || myGroupsLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <CommunitySkeleton />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <div className="text-5xl mb-6">🐾</div>
          <h2 className="text-3xl font-heading font-bold mb-4">Join the Community</h2>
          <p className="text-muted-foreground mb-8">Connect with other cat creators, share your journey, and grow together</p>
          <Button
            size="lg"
            className="rounded-full bg-accent hover:bg-accent/90 text-white px-8"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-sign-in-community"
          >
            Sign In / Join
          </Button>
        </div>
      </Layout>
    );
  }

  const myGroupIds = new Set(myGroups.map(g => g.id));
  
  const niches = ["Cat Content", "Cat UGC", "Rescue & Advocacy", "Cat Breeds", "Senior Cats", "Kittens", "Multi-Cat Household", "Cat Food & Nutrition", "Cat Tech", "Cat Lifestyle"];
  const platforms = ["Instagram", "TikTok", "YouTube", "YouTube Shorts", "Facebook", "Pinterest", "Twitter", "Newsletter", "Blog"];
  const deliverables = ["Feed Post", "Story", "Reel / TikTok Video", "YouTube Video", "YouTube Short", "Full Package (Post+Story+Reel)", "UGC Video (No Posting)", "UGC Photo Set", "Live Stream", "Blog Post"];
  const followerRanges = ["1K-10K", "10K-50K", "50K-100K", "100K-500K", "500K-1M", "1M+", "Any (UGC)"];
  const brandTypes = ["Cat Food Brand", "Pet Supply Brand", "Cat Tech Brand", "Shelter / Rescue Org", "Startup", "Enterprise", "Agency"];
  const outcomes = ["Accepted", "Rejected", "Countered", "Pending"];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2" data-testid="text-community-title">
            🐱 Cat Creator Community
          </h1>
          <p className="text-muted-foreground text-lg" data-testid="text-community-subtitle">
            Connect with fellow cat creators, share rates anonymously, get deal feedback, and lift each other up.
            Each one teach one.
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="feed" className="flex items-center gap-2" data-testid="tab-feed">
              <MessageCircle className="h-4 w-4" />
              Community Feed
            </TabsTrigger>
            <TabsTrigger value="rates" className="flex items-center gap-2" data-testid="tab-rates">
              <DollarSign className="h-4 w-4" />
              Rate Share
            </TabsTrigger>
          </TabsList>

          {/* Rate Share Tab */}
          <TabsContent value="rates" className="space-y-6">
            {/* Rate Stats Header */}
            <Card className="border-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-heading">Anonymous Rate Sharing</CardTitle>
                    <CardDescription>Share your rates anonymously. Help the community understand fair pricing.</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Submit Rate Form */}
              <Card className="border-2" data-testid="card-rate-form">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Share Your Rate
                  </CardTitle>
                  <CardDescription>100% anonymous - no profile linking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Niche *</Label>
                      <Select value={rateFormData.niche} onValueChange={(v) => setRateFormData(p => ({ ...p, niche: v }))}>
                        <SelectTrigger data-testid="select-rate-niche"><SelectValue placeholder="Select niche" /></SelectTrigger>
                        <SelectContent>
                          {niches.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Platform *</Label>
                      <Select value={rateFormData.platform} onValueChange={(v) => setRateFormData(p => ({ ...p, platform: v }))}>
                        <SelectTrigger data-testid="select-rate-platform"><SelectValue placeholder="Select platform" /></SelectTrigger>
                        <SelectContent>
                          {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Deliverable *</Label>
                      <Select value={rateFormData.deliverable} onValueChange={(v) => setRateFormData(p => ({ ...p, deliverable: v }))}>
                        <SelectTrigger data-testid="select-rate-deliverable"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {deliverables.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Follower Range *</Label>
                      <Select value={rateFormData.followerRange} onValueChange={(v) => setRateFormData(p => ({ ...p, followerRange: v }))}>
                        <SelectTrigger data-testid="select-rate-followers"><SelectValue placeholder="Select range" /></SelectTrigger>
                        <SelectContent>
                          {followerRanges.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Rate Charged ($) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 500"
                      value={rateFormData.rateCharged}
                      onChange={(e) => setRateFormData(p => ({ ...p, rateCharged: e.target.value }))}
                      data-testid="input-rate-charged"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Brand Type</Label>
                      <Select value={rateFormData.brandType} onValueChange={(v) => setRateFormData(p => ({ ...p, brandType: v }))}>
                        <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                        <SelectContent>
                          {brandTypes.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Outcome</Label>
                      <Select value={rateFormData.dealOutcome} onValueChange={(v) => setRateFormData(p => ({ ...p, dealOutcome: v }))}>
                        <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                        <SelectContent>
                          {outcomes.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={rateFormData.wasNegotiated}
                      onCheckedChange={(v) => setRateFormData(p => ({ ...p, wasNegotiated: v }))}
                      data-testid="switch-negotiated"
                    />
                    <Label>This rate was negotiated</Label>
                  </div>
                  <Button 
                    onClick={handleSubmitRate} 
                    disabled={submitRateMutation.isPending} 
                    className="w-full"
                    data-testid="button-submit-rate"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Submit Anonymously
                  </Button>
                </CardContent>
              </Card>

              {/* Rate Stats Display */}
              <Card className="border-2" data-testid="card-rate-stats">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Rate Insights
                  </CardTitle>
                  <CardDescription>See what other creators are charging</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Niche</Label>
                      <Select value={statsNiche} onValueChange={setStatsNiche}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {niches.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Platform</Label>
                      <Select value={statsPlatform} onValueChange={setStatsPlatform}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {rateStatsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : rateStats && rateStats.count > 0 ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Average Rate for {statsPlatform} in {statsNiche}</p>
                        <p className="text-3xl font-bold text-green-600" data-testid="text-avg-rate">${rateStats.avgRate}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Range: ${rateStats.minRate} - ${rateStats.maxRate} ({rateStats.count} submissions)
                        </p>
                      </div>
                      
                      {Object.keys(rateStats.byDeliverable).length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">By Deliverable</p>
                          <div className="space-y-2">
                            {Object.entries(rateStats.byDeliverable).map(([deliverable, data]) => (
                              <div key={deliverable} className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded">
                                <span>{deliverable}</span>
                                <span className="font-semibold">${data.avgRate} avg ({data.count})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {Object.keys(rateStats.byFollowerRange).length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">By Follower Range</p>
                          <div className="space-y-2">
                            {Object.entries(rateStats.byFollowerRange).map(([range, data]) => (
                              <div key={range} className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded">
                                <span>{range}</span>
                                <span className="font-semibold">${data.avgRate} avg ({data.count})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No rate data yet for {statsNiche} on {statsPlatform}</p>
                      <p className="text-sm text-muted-foreground">Be the first to contribute!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Community Feed Tab */}
          <TabsContent value="feed">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Groups */}
              <div className="lg:col-span-1">
                <Card className="border-2 sticky top-4" data-testid="card-groups">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading">Niche Groups</CardTitle>
                    <CardDescription>Join communities that match your interests</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* All Posts Filter */}
                    <button
                      onClick={() => setSelectedGroupId(undefined)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedGroupId === undefined
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted/50"
                      }`}
                      data-testid="button-filter-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                          <LayoutGrid className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">All Posts</p>
                          <p className="text-xs text-muted-foreground">View everything</p>
                        </div>
                      </div>
                    </button>

                    {groupsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : allGroups.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground">No groups available</p>
                      </div>
                    ) : (
                      allGroups.map((group) => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          isJoined={myGroupIds.has(group.id)}
                          isSelected={selectedGroupId === group.id}
                          onSelect={() => setSelectedGroupId(group.id)}
                          onJoin={() => joinGroupMutation.mutate(group.id)}
                          onLeave={() => leaveGroupMutation.mutate(group.id)}
                          isLoading={joinGroupMutation.isPending || leaveGroupMutation.isPending}
                        />
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Post Feed */}
              <div className="lg:col-span-3 space-y-6">
                {/* Create Post Dialog */}
                <Card className="border-2 bg-gradient-to-br from-accent/5 to-purple-500/5" data-testid="card-create-post">
                  <CardContent className="pt-6">
                    <Dialog open={createPostOpen} onOpenChange={(open) => {
                      setCreatePostOpen(open);
                      if (!open) {
                        setIsDealQuestion(false);
                        setNewPostContent("");
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="w-full justify-start" size="lg" data-testid="button-create-post">
                          <Plus className="h-5 w-5 mr-2" />
                          Create a Post
                        </Button>
                      </DialogTrigger>
                      <DialogContent data-testid="dialog-create-post">
                        <DialogHeader>
                          <DialogTitle className="font-heading">Create a New Post</DialogTitle>
                          <DialogDescription>
                            Share your thoughts with the community
                            {selectedGroupId && ` in ${allGroups.find(g => g.id === selectedGroupId)?.name}`}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <Switch
                              checked={isDealQuestion}
                              onCheckedChange={setIsDealQuestion}
                              data-testid="switch-deal-question"
                            />
                            <div className="flex-1">
                              <Label className="font-medium flex items-center gap-2">
                                <HelpCircle className="h-4 w-4 text-amber-600" />
                                Deal Check Post
                              </Label>
                              <p className="text-xs text-muted-foreground">Ask the community: "Would you take this deal?"</p>
                            </div>
                          </div>
                          <Textarea
                            placeholder={isDealQuestion 
                              ? "Describe the deal you're considering... e.g. 'Brand X offered $500 for 3 Instagram posts + stories, 30 day exclusivity, unlimited usage rights. 50K followers in fashion niche.'"
                              : "What's on your mind?"
                            }
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="min-h-32 resize-none"
                            data-testid="textarea-post-content"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setCreatePostOpen(false)}
                              data-testid="button-cancel-post"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => createPostMutation.mutate({ content: newPostContent, isDeal: isDealQuestion })}
                              disabled={!newPostContent.trim() || createPostMutation.isPending}
                              data-testid="button-submit-post"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              {isDealQuestion ? "Ask Community" : "Post"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Posts Feed */}
                {postsLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="border-2">
                    <CardContent className="py-12">
                      <EmptyState
                        icon={<MessageCircle className="h-12 w-12" />}
                        title="No posts yet"
                        description={
                          selectedGroupId
                            ? "Be the first to post in this group!"
                            : "Start the conversation by creating your first post"
                        }
                      />
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        </div>
      </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

// Group Card Component
function GroupCard({
  group,
  isJoined,
  isSelected,
  onSelect,
  onJoin,
  onLeave,
  isLoading,
}: {
  group: NicheGroup;
  isJoined: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onJoin: () => void;
  onLeave: () => void;
  isLoading: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg transition-colors cursor-pointer ${
        isSelected ? "bg-accent/10 border-2 border-accent" : "hover:bg-muted/50 border-2 border-transparent"
      }`}
      onClick={onSelect}
      data-testid={`group-card-${group.id}`}
    >
      <div className="flex items-start gap-3">
        {group.imageUrl ? (
          <img
            src={group.imageUrl}
            alt={group.name}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            data-testid={`img-group-${group.id}`}
          />
        ) : (
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="h-6 w-6 text-accent" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate" data-testid={`text-group-name-${group.id}`}>
            {group.name}
          </h3>
          <p className="text-xs text-muted-foreground" data-testid={`text-group-members-${group.id}`}>
            {group.memberCount || 0} members
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              isJoined ? onLeave() : onJoin();
            }}
            disabled={isLoading}
            className={`mt-2 text-xs font-medium px-3 py-1 rounded-full transition-colors ${
              isJoined
                ? "bg-accent text-accent-foreground hover:bg-accent/80"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
            data-testid={`button-${isJoined ? "leave" : "join"}-group-${group.id}`}
          >
            {isJoined ? (
              <>
                <Check className="h-3 w-3 inline mr-1" />
                Joined
              </>
            ) : (
              <>
                <Plus className="h-3 w-3 inline mr-1" />
                Join
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({ post }: { post: PostWithProfile }) {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: [`/api/posts/${post.id}/comments`],
    queryFn: () => fetchComments(post.id),
    enabled: showComments,
  });

  const { data: dealVotesData } = useQuery({
    queryKey: [`/api/posts/${post.id}/deal-votes`],
    queryFn: () => fetchDealVotes(post.id),
    enabled: !!post.isDealQuestion,
  });

  const dealVoteMutation = useMutation({
    mutationFn: ({ vote }: { vote: string }) => voteDeal(post.id, vote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/deal-votes`] });
      toast({ title: "Vote submitted!" });
    },
    onError: () => {
      toast({ title: "Failed to vote", variant: "destructive" });
    },
  });

  const handleDealVote = (vote: string) => {
    setSelectedVote(vote);
    dealVoteMutation.mutate({ vote });
  };

  const likeMutation = useMutation({
    mutationFn: () => (isLiked ? unlikePost(post.id) : likePost(post.id)),
    onMutate: async () => {
      setIsLiked(!isLiked);
      const previousPosts = queryClient.getQueryData(["/api/posts"]);
      
      queryClient.setQueryData(["/api/posts"], (old: PostWithProfile[] | undefined) => {
        if (!old) return old;
        return old.map(p => 
          p.id === post.id 
            ? { ...p, likesCount: (p.likesCount || 0) + (isLiked ? -1 : 1) }
            : p
        );
      });

      return { previousPosts };
    },
    onError: (err, variables, context: any) => {
      setIsLiked(!isLiked);
      if (context?.previousPosts) {
        queryClient.setQueryData(["/api/posts"], context.previousPosts);
      }
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => createComment(post.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewComment("");
      toast({ title: "Comment added!" });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    },
  });

  const initials = post.profile.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <Card className="border-2 hover:border-accent/30 transition-colors" data-testid={`post-${post.id}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12" data-testid={`avatar-${post.id}`}>
            <AvatarImage src={post.profile.profileImageUrl || undefined} />
            <AvatarFallback className="bg-accent/10 text-accent font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold font-heading" data-testid={`text-creator-name-${post.id}`}>
              {post.profile.displayName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {post.profile.niche && (
                <Badge variant="secondary" className="text-xs" data-testid={`badge-niche-${post.id}`}>
                  {post.profile.niche}
                </Badge>
              )}
              <span className="text-xs" data-testid={`text-post-date-${post.id}`}>
                {new Date(post.createdAt!).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deal Question Badge */}
        {post.isDealQuestion && (
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <HelpCircle className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-700">Deal Check: Would you take this deal?</span>
          </div>
        )}
        
        {/* Post Content */}
        <p className="text-base whitespace-pre-wrap" data-testid={`text-post-content-${post.id}`}>
          {post.content}
        </p>

        {/* Deal Voting Section */}
        {post.isDealQuestion && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg" data-testid={`deal-voting-${post.id}`}>
            <p className="text-sm font-medium text-muted-foreground">Cast your vote:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleDealVote("take_it")}
                variant={selectedVote === "take_it" ? "default" : "outline"}
                className={`flex-1 min-w-[100px] ${selectedVote === "take_it" ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-600 hover:bg-green-500/10"}`}
                disabled={dealVoteMutation.isPending}
                data-testid={`button-vote-take-it-${post.id}`}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Take It
              </Button>
              <Button
                onClick={() => handleDealVote("negotiate")}
                variant={selectedVote === "negotiate" ? "default" : "outline"}
                className={`flex-1 min-w-[100px] ${selectedVote === "negotiate" ? "bg-amber-500 hover:bg-amber-600" : "border-amber-500 text-amber-600 hover:bg-amber-500/10"}`}
                disabled={dealVoteMutation.isPending}
                data-testid={`button-vote-negotiate-${post.id}`}
              >
                <Scale className="h-4 w-4 mr-2" />
                Negotiate
              </Button>
              <Button
                onClick={() => handleDealVote("pass")}
                variant={selectedVote === "pass" ? "default" : "outline"}
                className={`flex-1 min-w-[100px] ${selectedVote === "pass" ? "bg-red-600 hover:bg-red-700" : "border-red-500 text-red-600 hover:bg-red-500/10"}`}
                disabled={dealVoteMutation.isPending}
                data-testid={`button-vote-pass-${post.id}`}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Pass
              </Button>
            </div>
            
            {/* Vote Results */}
            {dealVotesData && dealVotesData.total > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-xs text-muted-foreground font-medium">{dealVotesData.total} votes</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all" 
                        style={{ width: `${dealVotesData.total > 0 ? (dealVotesData.takeIt / dealVotesData.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-green-600 w-20">
                      Take It {dealVotesData.total > 0 ? Math.round((dealVotesData.takeIt / dealVotesData.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all" 
                        style={{ width: `${dealVotesData.total > 0 ? (dealVotesData.negotiate / dealVotesData.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-amber-600 w-20">
                      Negotiate {dealVotesData.total > 0 ? Math.round((dealVotesData.negotiate / dealVotesData.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 transition-all" 
                        style={{ width: `${dealVotesData.total > 0 ? (dealVotesData.pass / dealVotesData.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-red-600 w-20">
                      Pass {dealVotesData.total > 0 ? Math.round((dealVotesData.pass / dealVotesData.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Engagement Metrics */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <button
            onClick={() => likeMutation.mutate()}
            className={`flex items-center gap-2 transition-colors ${
              isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            }`}
            data-testid={`button-like-${post.id}`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium" data-testid={`text-likes-count-${post.id}`}>
              {post.likesCount || 0}
            </span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
            data-testid={`button-comments-${post.id}`}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium" data-testid={`text-comments-count-${post.id}`}>
              {post.commentsCount || 0}
            </span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-4 pt-4 border-t" data-testid={`comments-section-${post.id}`}>
            {/* Add Comment */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-20 resize-none"
                data-testid={`textarea-comment-${post.id}`}
              />
              <Button
                onClick={() => commentMutation.mutate(newComment)}
                disabled={!newComment.trim() || commentMutation.isPending}
                data-testid={`button-submit-comment-${post.id}`}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Comment Card Component
function CommentCard({ comment }: { comment: CommentWithProfile }) {
  const initials = comment.profile.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="flex gap-3 bg-muted/30 p-3 rounded-lg" data-testid={`comment-${comment.id}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.profile.profileImageUrl || undefined} />
        <AvatarFallback className="bg-accent/10 text-accent text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold" data-testid={`text-comment-author-${comment.id}`}>
            {comment.profile.displayName}
          </p>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.createdAt!).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm" data-testid={`text-comment-content-${comment.id}`}>
          {comment.content}
        </p>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12" data-testid="empty-state">
      <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">{description}</p>
    </div>
  );
}

// Community Skeleton
function CommunitySkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Skeleton className="h-96" />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <Skeleton className="h-32" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    </div>
  );
}
