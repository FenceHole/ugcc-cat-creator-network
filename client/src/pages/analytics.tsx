import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  Eye, 
  Clock, 
  MousePointerClick, 
  Download,
  BarChart3,
  TrendingUp,
  Calendar,
  Globe
} from "lucide-react";

interface MediaKitAnalytics {
  totalViews: number;
  viewsLast7Days: number;
  avgTimeSpent: number;
  pagesViewedBreakdown: Record<string, number>;
  contactClicks: number;
  pdfDownloads: number;
  recentViews: {
    id: string;
    viewerIp: string | null;
    referrer: string | null;
    userAgent: string | null;
    pagesViewed: string[] | null;
    timeSpentSeconds: number | null;
    clickedContact: boolean | null;
    downloadedPdf: boolean | null;
    viewedAt: string | null;
  }[];
  viewsByDay: { date: string; count: number }[];
}

async function fetchAnalytics(): Promise<MediaKitAnalytics> {
  const response = await fetch("/api/media-kit/analytics", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch analytics");
  return response.json();
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function extractDomain(url: string | null): string {
  if (!url) return "Direct";
  try {
    const domain = new URL(url).hostname;
    return domain.replace("www.", "");
  } catch {
    return url.slice(0, 30);
  }
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  accentColor = "text-accent"
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ElementType;
  accentColor?: string;
}) {
  return (
    <Card data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className={`text-3xl font-bold mt-2 ${accentColor}`}>{value}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg bg-muted ${accentColor}`}>
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ViewsChart({ data }: { data: { date: string; count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <Card data-testid="views-chart">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 size={20} />
          Views Over Time
        </CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-40">
          {data.map((day, index) => {
            const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center group"
                data-testid={`chart-bar-${index}`}
              >
                <div className="relative w-full flex justify-center">
                  <div
                    className="w-full max-w-3 bg-accent/80 rounded-t hover:bg-accent transition-colors"
                    style={{ height: `${Math.max(height, 2)}%`, minHeight: "2px" }}
                    title={`${day.date}: ${day.count} views`}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-md">
                    {day.count} views
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{data[0]?.date?.slice(5) || ""}</span>
          <span>Today</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentViewsTable({ views }: { views: MediaKitAnalytics["recentViews"] }) {
  if (views.length === 0) {
    return (
      <Card data-testid="recent-views-empty">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Recent Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="mx-auto mb-4 opacity-50" size={48} />
            <p>No views yet</p>
            <p className="text-sm mt-1">Share your media kit to start tracking views</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="recent-views-table">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock size={20} />
          Recent Views
        </CardTitle>
        <CardDescription>Latest visitors to your media kit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-muted-foreground">Date</th>
                <th className="pb-3 font-medium text-muted-foreground">Referrer</th>
                <th className="pb-3 font-medium text-muted-foreground">Time Spent</th>
                <th className="pb-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {views.map((view, index) => (
                <tr key={view.id} className="border-b last:border-0" data-testid={`view-row-${index}`}>
                  <td className="py-3">{formatDate(view.viewedAt)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Globe size={14} className="text-muted-foreground" />
                      {extractDomain(view.referrer)}
                    </div>
                  </td>
                  <td className="py-3">{formatTime(view.timeSpentSeconds || 0)}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {view.clickedContact && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                          <MousePointerClick size={10} /> Contact
                        </span>
                      )}
                      {view.downloadedPdf && (
                        <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          <Download size={10} /> PDF
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        <BarChart3 size={40} className="text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">No Analytics Yet</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Once you share your media kit and people start viewing it, you'll see detailed analytics here.
      </p>
      <Link href="/builder">
        <Button data-testid="link-builder">
          Create Your Media Kit
        </Button>
      </Link>
    </div>
  );
}

export default function Analytics() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: analytics, isLoading: analyticsLoading, error } = useQuery({
    queryKey: ["/api/media-kit/analytics"],
    queryFn: fetchAnalytics,
    enabled: !!user,
  });

  const isLoading = authLoading || analyticsLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <div className="text-5xl mb-6">📊</div>
          <h1 className="text-3xl font-bold mb-4">Sign In to View Analytics</h1>
          <p className="text-muted-foreground mb-8">
            Track your media kit views and performance stats
          </p>
          <Button
            size="lg"
            className="rounded-full bg-accent hover:bg-accent/90 text-white px-8"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-sign-in-analytics"
          >
            Sign In / Join
          </Button>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Error Loading Analytics</h1>
          <p className="text-muted-foreground">
            There was a problem loading your analytics. Please try again.
          </p>
        </div>
      </Layout>
    );
  }

  const hasData = analytics && analytics.totalViews > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Media Kit Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track how brands and partners engage with your media kit
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={16} />
            Last 30 days
          </div>
        </div>

        {!hasData ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Views"
                value={analytics.totalViews}
                subtitle="All time"
                icon={Eye}
                accentColor="text-violet-600 dark:text-violet-400"
              />
              <StatCard
                title="Views This Week"
                value={analytics.viewsLast7Days}
                subtitle={`${Math.round((analytics.viewsLast7Days / Math.max(analytics.totalViews, 1)) * 100)}% of total`}
                icon={TrendingUp}
                accentColor="text-emerald-600 dark:text-emerald-400"
              />
              <StatCard
                title="Avg Time Spent"
                value={formatTime(analytics.avgTimeSpent)}
                subtitle="Per session"
                icon={Clock}
                accentColor="text-amber-600 dark:text-amber-400"
              />
              <StatCard
                title="Contact Clicks"
                value={analytics.contactClicks}
                subtitle={analytics.pdfDownloads > 0 ? `${analytics.pdfDownloads} PDF downloads` : "No PDF downloads"}
                icon={MousePointerClick}
                accentColor="text-rose-600 dark:text-rose-400"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <ViewsChart data={analytics.viewsByDay} />
              </div>
              <Card data-testid="pages-breakdown">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={20} />
                    Pages Viewed
                  </CardTitle>
                  <CardDescription>Breakdown by section</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(analytics.pagesViewedBreakdown).length === 0 ? (
                    <p className="text-muted-foreground text-sm">No page data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(analytics.pagesViewedBreakdown)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 6)
                        .map(([page, count]) => {
                          const maxViews = Math.max(...Object.values(analytics.pagesViewedBreakdown));
                          const percentage = (count / maxViews) * 100;
                          return (
                            <div key={page} data-testid={`page-stat-${page}`}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="capitalize">{page}</span>
                                <span className="text-muted-foreground">{count}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-accent transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <RecentViewsTable views={analytics.recentViews} />
          </>
        )}
      </div>
    </Layout>
  );
}
