import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  Users, 
  TrendingUp, 
  FileText, 
  Plus, 
  Instagram, 
  Youtube, 
  Briefcase,
  UserPlus,
  LayoutGrid,
  MessageSquare,
  Link as LinkIcon,
  ExternalLink
} from "lucide-react";
import type { CreatorProfile, PlatformConnection, NicheGroup, JobApplication, Job } from "@shared/schema";

// Platform icon mapping
const platformIcons: Record<string, typeof Instagram> = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: FileText,
  twitter: MessageSquare,
  linkedin: LinkIcon,
};

// Fetch profile data
async function fetchProfile(): Promise<CreatorProfile> {
  const response = await fetch("/api/profile", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

// Fetch platform connections
async function fetchConnections(): Promise<PlatformConnection[]> {
  const response = await fetch("/api/profile/connections", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch connections");
  return response.json();
}

// Fetch job applications with job details
async function fetchApplications(): Promise<(JobApplication & { job?: Job })[]> {
  const response = await fetch("/api/jobs/applications", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch applications");
  return response.json();
}

// Fetch user's groups
async function fetchMyGroups(): Promise<NicheGroup[]> {
  const response = await fetch("/api/groups/my", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch groups");
  return response.json();
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: fetchProfile,
    enabled: !!user,
  });

  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ["/api/profile/connections"],
    queryFn: fetchConnections,
    enabled: !!user,
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/jobs/applications"],
    queryFn: fetchApplications,
    enabled: !!user,
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/groups/my"],
    queryFn: fetchMyGroups,
    enabled: !!user,
  });

  // Calculate aggregate stats
  const totalFollowers = connections.reduce((sum, conn) => sum + (conn.followerCount || 0), 0);
  const avgEngagementRate = connections.length > 0
    ? connections.reduce((sum, conn) => sum + parseFloat(conn.engagementRate || "0"), 0) / connections.length
    : 0;
  const contentPosted = connections.length; // Simplified - could be actual content count

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <DashboardSkeleton />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <div className="text-5xl mb-6">🐱</div>
          <h2 className="text-3xl font-heading font-bold mb-4">Sign in to your Dashboard</h2>
          <p className="text-muted-foreground mb-8">Access your profile, connections, and opportunities</p>
          <Button
            size="lg"
            className="rounded-full bg-accent hover:bg-accent/90 text-white px-8"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-sign-in-dashboard"
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2" data-testid="text-dashboard-title">
            Welcome back, {profile?.displayName || "Creator"}!
          </h1>
          <p className="text-muted-foreground text-lg" data-testid="text-dashboard-subtitle">
            {profile?.tagline || "Manage your creator profile and opportunities"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Followers"
            value={totalFollowers.toLocaleString()}
            icon={<Users className="h-5 w-5" />}
            testId="stat-followers"
            loading={connectionsLoading}
          />
          <StatCard
            title="Avg. Engagement"
            value={`${avgEngagementRate.toFixed(2)}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            testId="stat-engagement"
            loading={connectionsLoading}
          />
          <StatCard
            title="Content Posted"
            value={contentPosted.toString()}
            icon={<FileText className="h-5 w-5" />}
            testId="stat-content"
            loading={connectionsLoading}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Platform Connections */}
            <Card className="border-2 hover:border-accent/50 transition-colors" data-testid="card-connections">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-heading">Platform Connections</CardTitle>
                    <CardDescription>Your connected social media accounts</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-add-connection">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Platform
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {connectionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : connections.length === 0 ? (
                  <EmptyState
                    icon={<LinkIcon className="h-12 w-12" />}
                    title="No platforms connected"
                    description="Connect your social media accounts to start tracking your stats"
                    testId="empty-connections"
                  />
                ) : (
                  <div className="space-y-4">
                    {connections.map((connection) => (
                      <PlatformCard key={connection.id} connection={connection} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Job Applications */}
            <Card className="border-2 hover:border-accent/50 transition-colors" data-testid="card-applications">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-heading">Recent Applications</CardTitle>
                    <CardDescription>Your job applications and their status</CardDescription>
                  </div>
                  <Link href="/jobs">
                    <Button variant="outline" size="sm" data-testid="button-browse-jobs">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <EmptyState
                    icon={<Briefcase className="h-12 w-12" />}
                    title="No applications yet"
                    description="Browse available jobs and apply to opportunities that match your profile"
                    testId="empty-applications"
                  />
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 5).map((application) => (
                      <ApplicationCard key={application.id} application={application} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="border-2 bg-gradient-to-br from-accent/5 to-purple-500/5" data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle className="text-xl font-heading">Quick Actions</CardTitle>
                <CardDescription>Manage your creator profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/builder">
                  <Button className="w-full justify-start" variant="default" data-testid="button-create-rate-card">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Rate Card
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline" data-testid="button-quick-add-platform">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Platform Connection
                </Button>
                <Link href="/jobs">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-quick-browse-jobs">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/community">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-join-community">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Community
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Joined Groups */}
            <Card className="border-2 hover:border-accent/50 transition-colors" data-testid="card-groups">
              <CardHeader>
                <CardTitle className="text-xl font-heading">My Communities</CardTitle>
                <CardDescription>Niche groups you've joined</CardDescription>
              </CardHeader>
              <CardContent>
                {groupsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : groups.length === 0 ? (
                  <EmptyState
                    icon={<LayoutGrid className="h-10 w-10" />}
                    title="No groups joined"
                    description="Join niche communities to connect with other creators"
                    size="sm"
                    testId="empty-groups"
                  />
                ) : (
                  <div className="space-y-3">
                    {groups.map((group) => (
                      <GroupCard key={group.id} group={group} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon, 
  testId,
  loading 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
  testId: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow" data-testid={testId}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-heading font-bold" data-testid={`${testId}-value`}>{value}</p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg text-accent">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Platform Connection Card
function PlatformCard({ connection }: { connection: PlatformConnection }) {
  const Icon = platformIcons[connection.platform] || LinkIcon;
  
  return (
    <div 
      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
      data-testid={`platform-${connection.platform}-${connection.id}`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-accent/10 rounded-lg">
          <Icon className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold capitalize" data-testid={`text-platform-name-${connection.id}`}>
            {connection.platform}
          </h3>
          <p className="text-sm text-muted-foreground" data-testid={`text-platform-handle-${connection.id}`}>
            @{connection.handle}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg" data-testid={`text-followers-${connection.id}`}>
          {(connection.followerCount || 0).toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {connection.engagementRate ? `${connection.engagementRate}% engagement` : "No data"}
        </p>
      </div>
    </div>
  );
}

// Job Application Card
function ApplicationCard({ application }: { application: JobApplication & { job?: Job } }) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    reviewed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div 
      className="flex items-start justify-between p-4 border rounded-lg hover:border-accent/50 transition-colors"
      data-testid={`application-${application.id}`}
    >
      <div className="flex-1">
        <h3 className="font-semibold mb-1" data-testid={`text-job-title-${application.id}`}>
          {application.job?.title || "Job Title"}
        </h3>
        <p className="text-sm text-muted-foreground mb-2" data-testid={`text-company-${application.id}`}>
          {application.job?.company || "Company"}
        </p>
        <Badge 
          className={statusColors[application.status || "pending"]}
          data-testid={`badge-status-${application.id}`}
        >
          {application.status || "pending"}
        </Badge>
      </div>
      <div className="text-right text-sm text-muted-foreground">
        {new Date(application.createdAt!).toLocaleDateString()}
      </div>
    </div>
  );
}

// Group Card
function GroupCard({ group }: { group: NicheGroup }) {
  return (
    <div 
      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
      data-testid={`group-${group.id}`}
    >
      {group.imageUrl ? (
        <img 
          src={group.imageUrl} 
          alt={group.name} 
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
          <LayoutGrid className="h-6 w-6 text-accent" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate" data-testid={`text-group-name-${group.id}`}>
          {group.name}
        </h3>
        <p className="text-xs text-muted-foreground" data-testid={`text-group-members-${group.id}`}>
          {group.memberCount || 0} members
        </p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </div>
  );
}

// Empty State Component
function EmptyState({ 
  icon, 
  title, 
  description, 
  size = "md",
  testId 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  size?: "sm" | "md";
  testId: string;
}) {
  const isSmall = size === "sm";
  
  return (
    <div 
      className={`text-center ${isSmall ? 'py-6' : 'py-12'}`}
      data-testid={testId}
    >
      <div className={`mx-auto ${isSmall ? 'w-16 h-16' : 'w-20 h-20'} bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4`}>
        {icon}
      </div>
      <h3 className={`font-semibold ${isSmall ? 'text-base' : 'text-lg'} mb-2`}>{title}</h3>
      <p className={`text-muted-foreground ${isSmall ? 'text-xs' : 'text-sm'} max-w-sm mx-auto`}>
        {description}
      </p>
    </div>
  );
}

// Dashboard Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  );
}
