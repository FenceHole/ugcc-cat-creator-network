import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo } from "react";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  FileText,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  ThumbsUp,
  ThumbsDown,
  Shield,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import type { Job, JobApplication, JobVote, CreatorProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";

const platformIcons: Record<string, typeof Instagram> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  tiktok: FileText,
  linkedin: Linkedin,
  newsletter: FileText,
  blog: FileText,
};

const jobTypeLabels: Record<string, string> = {
  brand_deal: "Brand Deal",
  ugc: "UGC Content",
  collaboration: "Collaboration",
  casting_call: "Casting Call",
};

const availableNiches = [
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

interface JobVotesData {
  upvotes: number;
  downvotes: number;
  comments: (JobVote & { profile: CreatorProfile })[];
  userVote?: JobVote | null;
}

async function fetchJobs(filters: { niche?: string; type?: string; status?: string }): Promise<Job[]> {
  const params = new URLSearchParams();
  if (filters.niche) params.append("niche", filters.niche);
  if (filters.type) params.append("type", filters.type);
  if (filters.status) params.append("status", filters.status);

  const response = await fetch(`/api/jobs?${params.toString()}`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch jobs");
  return response.json();
}

async function fetchApplications(): Promise<(JobApplication & { job: Job })[]> {
  const response = await fetch("/api/jobs/applications", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch applications");
  return response.json();
}

async function applyToJob(data: { jobId: string; message: string }): Promise<JobApplication> {
  const response = await fetch(`/api/jobs/${data.jobId}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message: data.message }),
  });
  if (!response.ok) throw new Error("Failed to apply to job");
  return response.json();
}

async function fetchJobVotes(jobId: string): Promise<JobVotesData> {
  const response = await fetch(`/api/jobs/${jobId}/votes`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch votes");
  return response.json();
}

async function voteOnJob(data: { jobId: string; voteType: string; comment?: string }): Promise<JobVote> {
  const response = await fetch(`/api/jobs/${data.jobId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ voteType: data.voteType, comment: data.comment }),
  });
  if (!response.ok) throw new Error("Failed to vote");
  return response.json();
}

export default function Jobs() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [nicheFilter, setNicheFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [hideCommission, setHideCommission] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationPitch, setApplicationPitch] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [expectedDeliverables, setExpectedDeliverables] = useState("");

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs", { niche: nicheFilter, type: typeFilter, status: statusFilter }],
    queryFn: () => fetchJobs({ 
      niche: nicheFilter === "all" ? undefined : nicheFilter, 
      type: typeFilter === "all" ? undefined : typeFilter, 
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    enabled: !!user,
  });

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...jobs];
    
    if (hideCommission) {
      filtered = filtered.filter(job => job.paymentType !== "commission");
    }
    
    if (verifiedOnly) {
      filtered = filtered.filter(job => job.isVerified);
    }
    
    switch (sortBy) {
      case "trusted":
        filtered.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        break;
      case "budget":
        filtered.sort((a, b) => {
          const extractBudget = (budget: string | null) => {
            if (!budget) return 0;
            const match = budget.match(/\$?([\d,]+)/);
            return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
          };
          return extractBudget(b.budget) - extractBudget(a.budget);
        });
        break;
    }
    
    return filtered;
  }, [jobs, hideCommission, verifiedOnly, sortBy]);

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/jobs/applications"],
    queryFn: fetchApplications,
    enabled: !!user,
  });

  const applyMutation = useMutation({
    mutationFn: applyToJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/applications"] });
      setIsApplicationModalOpen(false);
      resetApplicationForm();
      toast({
        title: "Application submitted!",
        description: "Your application has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Application failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetApplicationForm = () => {
    setApplicationPitch("");
    setPortfolioLinks("");
    setExpectedDeliverables("");
    setSelectedJob(null);
  };

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setIsApplicationModalOpen(true);
  };

  const handleSubmitApplication = () => {
    if (!selectedJob) return;
    
    const fullMessage = `PITCH:\n${applicationPitch}\n\nPORTFOLIO LINKS:\n${portfolioLinks}\n\nEXPECTED DELIVERABLES:\n${expectedDeliverables}`;
    
    applyMutation.mutate({
      jobId: selectedJob.id,
      message: fullMessage,
    });
  };

  const hasApplied = (jobId: string) => {
    return applications.some(app => app.jobId === jobId);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <JobsSkeleton />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <div className="text-5xl mb-6">💼</div>
          <h2 className="text-3xl font-heading font-bold mb-4">Sign in to View Opportunities</h2>
          <p className="text-muted-foreground mb-8">Access brand deals, UGC gigs, and creator opportunities</p>
          <Button
            size="lg"
            className="rounded-full bg-accent hover:bg-accent/90 text-white px-8"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-sign-in-jobs"
          >
            Sign In / Join
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2" data-testid="text-jobs-title">
            🐱 Opportunities Board
          </h1>
          <p className="text-muted-foreground text-lg" data-testid="text-jobs-subtitle">
            Real brand deals, UGC campaigns, and collaborations for cat content creators — verified by the community.
          </p>
        </div>

        <Tabs defaultValue="browse" className="space-y-6" data-testid="tabs-jobs">
          <TabsList className="grid w-full max-w-md grid-cols-2" data-testid="tabs-list">
            <TabsTrigger value="browse" data-testid="tab-browse-jobs">
              <Briefcase className="h-4 w-4 mr-2" />
              Browse Jobs
            </TabsTrigger>
            <TabsTrigger value="applications" data-testid="tab-my-applications">
              <FileText className="h-4 w-4 mr-2" />
              My Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <Card className="border-2" data-testid="card-filters">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-heading">
                  <Filter className="h-5 w-5" />
                  Filters & Sorting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="niche-filter">Niche</Label>
                    <Select value={nicheFilter} onValueChange={setNicheFilter}>
                      <SelectTrigger id="niche-filter" data-testid="select-niche-filter">
                        <SelectValue placeholder="All niches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" data-testid="option-all-niches">All niches</SelectItem>
                        {availableNiches.map((niche) => (
                          <SelectItem 
                            key={niche} 
                            value={niche}
                            data-testid={`option-niche-${niche.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {niche}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type-filter">Job Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger id="type-filter" data-testid="select-type-filter">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" data-testid="option-all-types">All types</SelectItem>
                        <SelectItem value="brand_deal" data-testid="option-type-brand-deal">Brand Deal</SelectItem>
                        <SelectItem value="ugc" data-testid="option-type-ugc">UGC Content</SelectItem>
                        <SelectItem value="collaboration" data-testid="option-type-collaboration">Collaboration</SelectItem>
                        <SelectItem value="casting_call" data-testid="option-type-casting-call">Casting Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status-filter" data-testid="select-status-filter">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" data-testid="option-all-statuses">All statuses</SelectItem>
                        <SelectItem value="open" data-testid="option-status-open">Open</SelectItem>
                        <SelectItem value="closed" data-testid="option-status-closed">Closed</SelectItem>
                        <SelectItem value="filled" data-testid="option-status-filled">Filled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort-by">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sort-by" data-testid="select-sort-by">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest" data-testid="option-sort-newest">
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Newest
                          </span>
                        </SelectItem>
                        <SelectItem value="trusted" data-testid="option-sort-trusted">
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            Most Trusted
                          </span>
                        </SelectItem>
                        <SelectItem value="budget" data-testid="option-sort-budget">
                          <span className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Highest Budget
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-4 border-t">
                  <div className="flex items-center space-x-3 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-lg border-2 border-red-200 dark:border-red-900">
                    <Switch
                      id="hide-commission"
                      checked={hideCommission}
                      onCheckedChange={setHideCommission}
                      data-testid="switch-hide-commission"
                    />
                    <Label 
                      htmlFor="hide-commission" 
                      className="flex items-center gap-2 cursor-pointer font-semibold text-red-700 dark:text-red-400"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Hide "Paid in Exposure" (Commission Only)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 bg-green-50 dark:bg-green-950/30 px-4 py-3 rounded-lg border border-green-200 dark:border-green-900">
                    <Checkbox
                      id="verified-only"
                      checked={verifiedOnly}
                      onCheckedChange={(checked) => setVerifiedOnly(checked === true)}
                      data-testid="checkbox-verified-only"
                    />
                    <Label 
                      htmlFor="verified-only" 
                      className="flex items-center gap-2 cursor-pointer font-medium text-green-700 dark:text-green-400"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Verified Only
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {jobsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-96" data-testid={`skeleton-job-${i}`} />
                ))}
              </div>
            ) : filteredAndSortedJobs.length === 0 ? (
              <Card className="border-2" data-testid="empty-jobs">
                <CardContent className="py-16">
                  <EmptyState
                    icon={<Briefcase className="h-16 w-16" />}
                    title="No jobs found"
                    description="Try adjusting your filters to see more opportunities"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-jobs">
                {filteredAndSortedJobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onApply={handleApplyClick}
                    hasApplied={hasApplied(job.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {applicationsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-40" data-testid={`skeleton-application-${i}`} />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <Card className="border-2" data-testid="empty-applications">
                <CardContent className="py-16">
                  <EmptyState
                    icon={<FileText className="h-16 w-16" />}
                    title="No applications yet"
                    description="Start browsing jobs and apply to opportunities that match your profile"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4" data-testid="list-applications">
                {applications.map((application) => (
                  <ApplicationCard 
                    key={application.id} 
                    application={application} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-apply">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading" data-testid="text-apply-title">
                Apply to {selectedJob?.title}
              </DialogTitle>
              <DialogDescription data-testid="text-apply-description">
                Submit your application for this opportunity
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="pitch" className="text-base font-semibold">
                  Pitch / Cover Letter <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="pitch"
                  placeholder="Tell them why you're a great fit for this opportunity..."
                  value={applicationPitch}
                  onChange={(e) => setApplicationPitch(e.target.value)}
                  rows={6}
                  className="resize-none"
                  data-testid="textarea-pitch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio" className="text-base font-semibold">
                  Portfolio Links
                </Label>
                <Input
                  id="portfolio"
                  placeholder="https://example.com/portfolio, https://instagram.com/yourhandle"
                  value={portfolioLinks}
                  onChange={(e) => setPortfolioLinks(e.target.value)}
                  data-testid="input-portfolio"
                />
                <p className="text-xs text-muted-foreground">
                  Add links to your portfolio, social profiles, or previous work (comma-separated)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliverables" className="text-base font-semibold">
                  Expected Deliverables
                </Label>
                <Textarea
                  id="deliverables"
                  placeholder="Describe what you can deliver for this project..."
                  value={expectedDeliverables}
                  onChange={(e) => setExpectedDeliverables(e.target.value)}
                  rows={4}
                  className="resize-none"
                  data-testid="textarea-deliverables"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsApplicationModalOpen(false)}
                data-testid="button-cancel-apply"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitApplication}
                disabled={!applicationPitch.trim() || applyMutation.isPending}
                data-testid="button-submit-apply"
              >
                {applyMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

function JobCard({ 
  job, 
  onApply,
  hasApplied 
}: { 
  job: Job; 
  onApply: (job: Job) => void;
  hasApplied: boolean;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [voteComment, setVoteComment] = useState("");
  
  const platforms = (job.platforms as string[]) || [];
  const isExpired = job.expiresAt ? new Date(job.expiresAt) < new Date() : false;
  const canApply = job.status === "open" && !isExpired && !hasApplied;
  const isCommissionOnly = job.paymentType === "commission";
  const isHybrid = job.paymentType === "hybrid";

  const { data: votesData } = useQuery({
    queryKey: ["/api/jobs", job.id, "votes"],
    queryFn: () => fetchJobVotes(job.id),
  });

  const voteMutation = useMutation({
    mutationFn: voteOnJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", job.id, "votes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setVoteComment("");
      toast({
        title: "Vote recorded!",
        description: "Thanks for helping the community.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to vote",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVote = (voteType: "upvote" | "downvote") => {
    voteMutation.mutate({
      jobId: job.id,
      voteType,
      comment: voteComment || undefined,
    });
  };

  const paymentTypeBadge = () => {
    switch (job.paymentType) {
      case "flat_fee":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300" data-testid={`badge-payment-${job.id}`}>
            <DollarSign className="h-3 w-3 mr-1" />
            Flat Fee
          </Badge>
        );
      case "commission":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300" data-testid={`badge-payment-${job.id}`}>
            <AlertTriangle className="h-3 w-3 mr-1" />
            Commission Only
          </Badge>
        );
      case "hybrid":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300" data-testid={`badge-payment-${job.id}`}>
            <Sparkles className="h-3 w-3 mr-1" />
            Hybrid
          </Badge>
        );
      default:
        return null;
    }
  };

  const cardBorderClass = isCommissionOnly 
    ? "border-2 border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20" 
    : "border-2 hover:border-accent/50";

  return (
    <Card 
      className={`${cardBorderClass} transition-all hover:shadow-lg flex flex-col h-full`}
      data-testid={`card-job-${job.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant={job.status === "open" ? "default" : "secondary"}
              className="capitalize"
              data-testid={`badge-job-status-${job.id}`}
            >
              {job.status}
            </Badge>
            {job.isVerified && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300" data-testid={`badge-verified-${job.id}`}>
                <ShieldCheck className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <Badge 
            variant="outline"
            className="capitalize"
            data-testid={`badge-job-type-${job.id}`}
          >
            {jobTypeLabels[job.type] || job.type}
          </Badge>
        </div>
        
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl font-heading line-clamp-2" data-testid={`text-job-title-${job.id}`}>
              {job.title}
            </CardTitle>
            {job.company && (
              <CardDescription className="font-semibold" data-testid={`text-job-company-${job.id}`}>
                {job.company}
              </CardDescription>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          {paymentTypeBadge()}
          {(job.trustScore !== null && job.trustScore !== undefined) && (
            <Badge variant="outline" className={`${job.trustScore >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid={`badge-trust-${job.id}`}>
              <Shield className="h-3 w-3 mr-1" />
              Trust: {job.trustScore > 0 ? '+' : ''}{job.trustScore}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-job-description-${job.id}`}>
          {job.description}
        </p>

        <div className="space-y-3 text-sm">
          {job.budget && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4 flex-shrink-0" />
              <span data-testid={`text-job-budget-${job.id}`}>{job.budget}</span>
            </div>
          )}

          {job.requiredFollowers && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span data-testid={`text-job-followers-${job.id}`}>
                {job.requiredFollowers.toLocaleString()}+ followers
              </span>
            </div>
          )}

          {platforms.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex gap-2 flex-wrap">
                {platforms.map((platform) => {
                  const Icon = platformIcons[platform.toLowerCase()] || FileText;
                  return (
                    <div 
                      key={platform}
                      className="p-2 bg-accent/10 rounded-lg"
                      title={platform}
                      data-testid={`icon-platform-${platform}-${job.id}`}
                    >
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {job.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span data-testid={`text-job-location-${job.id}`}>{job.location}</span>
            </div>
          )}

          {job.expiresAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span data-testid={`text-job-expires-${job.id}`}>
                Expires {formatDistance(new Date(job.expiresAt), new Date(), { addSuffix: true })}
              </span>
            </div>
          )}

          {job.niche && (
            <Badge variant="secondary" data-testid={`badge-job-niche-${job.id}`}>
              {job.niche}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("upvote")}
              disabled={voteMutation.isPending}
              className={votesData?.userVote?.voteType === "upvote" ? "text-green-600 bg-green-50" : ""}
              data-testid={`button-upvote-${job.id}`}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              {votesData?.upvotes || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("downvote")}
              disabled={voteMutation.isPending}
              className={votesData?.userVote?.voteType === "downvote" ? "text-red-600 bg-red-50" : ""}
              data-testid={`button-downvote-${job.id}`}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              {votesData?.downvotes || 0}
            </Button>
          </div>
          
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" data-testid={`button-expand-${job.id}`}>
                <MessageSquare className="h-4 w-4 mr-1" />
                {votesData?.comments?.length || 0}
                {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="space-y-2">
              <Input
                placeholder="Add your feedback about this opportunity..."
                value={voteComment}
                onChange={(e) => setVoteComment(e.target.value)}
                data-testid={`input-comment-${job.id}`}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleVote("upvote")} disabled={voteMutation.isPending} className="bg-green-600 hover:bg-green-700">
                  <ThumbsUp className="h-3 w-3 mr-1" /> Recommend
                </Button>
                <Button size="sm" onClick={() => handleVote("downvote")} disabled={voteMutation.isPending} variant="destructive">
                  <ThumbsDown className="h-3 w-3 mr-1" /> Warning
                </Button>
              </div>
            </div>

            {votesData?.comments && votesData.comments.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <p className="text-xs font-semibold text-muted-foreground">Community Feedback:</p>
                {votesData.comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`text-xs p-2 rounded ${comment.voteType === 'upvote' ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}
                    data-testid={`comment-${comment.id}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {comment.voteType === 'upvote' ? (
                        <ThumbsUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <ThumbsDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className="font-medium">{comment.profile?.displayName || "Creator"}</span>
                    </div>
                    <p>{comment.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <CardFooter>
        {hasApplied ? (
          <Button 
            className="w-full" 
            variant="secondary" 
            disabled
            data-testid={`button-applied-${job.id}`}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Already Applied
          </Button>
        ) : !canApply ? (
          <Button 
            className="w-full" 
            variant="outline" 
            disabled
            data-testid={`button-unavailable-${job.id}`}
          >
            <XCircle className="h-4 w-4 mr-2" />
            {isExpired ? "Expired" : "Not Available"}
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={() => onApply(job)}
            data-testid={`button-apply-${job.id}`}
          >
            <Send className="h-4 w-4 mr-2" />
            Apply Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function ApplicationCard({ 
  application 
}: { 
  application: JobApplication & { job: Job }
}) {
  const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
    pending: {
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      icon: Clock,
      label: "Pending"
    },
    reviewed: {
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      icon: FileText,
      label: "Reviewed"
    },
    accepted: {
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      icon: CheckCircle2,
      label: "Accepted"
    },
    rejected: {
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      icon: XCircle,
      label: "Rejected"
    },
  };

  const status = application.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <Card 
      className="border-2 hover:border-accent/50 transition-colors"
      data-testid={`card-application-${application.id}`}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div>
              <h3 
                className="text-xl font-heading font-semibold mb-1"
                data-testid={`text-application-job-title-${application.id}`}
              >
                {application.job.title}
              </h3>
              {application.job.company && (
                <p 
                  className="text-sm text-muted-foreground"
                  data-testid={`text-application-company-${application.id}`}
                >
                  {application.job.company}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline"
                data-testid={`badge-application-type-${application.id}`}
              >
                {jobTypeLabels[application.job.type] || application.job.type}
              </Badge>
              {application.job.niche && (
                <Badge 
                  variant="secondary"
                  data-testid={`badge-application-niche-${application.id}`}
                >
                  {application.job.niche}
                </Badge>
              )}
            </div>

            <p 
              className="text-sm text-muted-foreground"
              data-testid={`text-application-date-${application.id}`}
            >
              Applied {formatDistance(new Date(application.createdAt!), new Date(), { addSuffix: true })}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <Badge 
              className={config.color}
              data-testid={`badge-application-status-${application.id}`}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="font-heading font-semibold text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
}

function JobsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>
      
      <Skeleton className="h-40" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    </div>
  );
}
