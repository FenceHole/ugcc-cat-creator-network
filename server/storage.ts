import { db } from "./db";
import { eq, desc, and, or, like, sql, inArray } from "drizzle-orm";
import type {
  CreatorProfile,
  InsertCreatorProfile,
  PlatformConnection,
  InsertPlatformConnection,
  RateCard,
  InsertRateCard,
  NicheGroup,
  InsertNicheGroup,
  GroupMembership,
  InsertGroupMembership,
  CommunityPost,
  InsertCommunityPost,
  PostComment,
  InsertPostComment,
  PostLike,
  InsertPostLike,
  Job,
  InsertJob,
  JobApplication,
  InsertJobApplication,
  PricingBenchmark,
  InsertPricingBenchmark,
  ContentQueue,
  InsertContentQueue,
  DealAnalysis,
  InsertDealAnalysis,
  JobVote,
  InsertJobVote,
  MediaKitView,
  InsertMediaKitView,
  AnonymousRate,
  InsertAnonymousRate,
  DealVote,
  InsertDealVote,
  Conversation,
  InsertConversation,
  Message,
  InsertMessage,
} from "@shared/schema";
import {
  creatorProfiles,
  platformConnections,
  rateCards,
  nicheGroups,
  groupMemberships,
  communityPosts,
  postComments,
  postLikes,
  jobs,
  jobApplications,
  pricingBenchmarks,
  contentQueue,
  dealAnalyses,
  jobVotes,
  mediaKitViews,
  anonymousRates,
  dealVotes,
  conversations,
  messages,
} from "@shared/schema";
import { gte } from "drizzle-orm";

export interface MediaKitAnalytics {
  totalViews: number;
  viewsLast7Days: number;
  avgTimeSpent: number;
  pagesViewedBreakdown: Record<string, number>;
  contactClicks: number;
  pdfDownloads: number;
  recentViews: MediaKitView[];
  viewsByDay: { date: string; count: number }[];
}

// STORAGE INTERFACE
export interface IStorage {
  // Creator Profiles
  getProfileByUserId(userId: string): Promise<CreatorProfile | undefined>;
  createProfile(profile: InsertCreatorProfile): Promise<CreatorProfile>;
  updateProfile(id: string, profile: Partial<InsertCreatorProfile>): Promise<CreatorProfile | undefined>;
  
  // Platform Connections
  getConnectionsByProfile(profileId: string): Promise<PlatformConnection[]>;
  createConnection(connection: InsertPlatformConnection): Promise<PlatformConnection>;
  updateConnection(id: string, connection: Partial<InsertPlatformConnection>): Promise<PlatformConnection | undefined>;
  deleteConnection(id: string): Promise<void>;
  
  // Rate Cards
  getRateCardsByProfile(profileId: string): Promise<RateCard[]>;
  createRateCard(rateCard: InsertRateCard): Promise<RateCard>;
  updateRateCard(id: string, rateCard: Partial<InsertRateCard>): Promise<RateCard | undefined>;
  deleteRateCard(id: string): Promise<void>;
  
  // Niche Groups
  getAllGroups(): Promise<NicheGroup[]>;
  getGroupBySlug(slug: string): Promise<NicheGroup | undefined>;
  createGroup(group: InsertNicheGroup): Promise<NicheGroup>;
  getGroupsByProfile(profileId: string): Promise<NicheGroup[]>;
  joinGroup(membership: InsertGroupMembership): Promise<GroupMembership>;
  leaveGroup(profileId: string, groupId: string): Promise<void>;
  
  // Community Posts
  getPosts(groupId?: string, limit?: number): Promise<(CommunityPost & { profile: CreatorProfile })[]>;
  getPostById(id: string): Promise<(CommunityPost & { profile: CreatorProfile }) | undefined>;
  createPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updatePost(id: string, post: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined>;
  deletePost(id: string): Promise<void>;
  likePost(like: InsertPostLike): Promise<void>;
  unlikePost(profileId: string, postId: string): Promise<void>;
  
  // Post Comments
  getCommentsByPost(postId: string): Promise<(PostComment & { profile: CreatorProfile })[]>;
  createComment(comment: InsertPostComment): Promise<PostComment>;
  
  // Jobs
  getJobs(filters?: { niche?: string; type?: string; status?: string }): Promise<Job[]>;
  getJobById(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  applyToJob(application: InsertJobApplication): Promise<JobApplication>;
  getApplicationsByProfile(profileId: string): Promise<(JobApplication & { job: Job })[]>;
  
  // Pricing Benchmarks
  getBenchmarks(filters: { niche: string; platform: string; deliverable: string }): Promise<PricingBenchmark[]>;
  getBenchmarkForFollowers(filters: { niche: string; platform: string; deliverable: string; followers: number }): Promise<PricingBenchmark | undefined>;
  
  // Content Queue
  getQueueByProfile(profileId: string): Promise<ContentQueue[]>;
  createQueueItem(item: InsertContentQueue): Promise<ContentQueue>;
  updateQueueItem(id: string, item: Partial<InsertContentQueue>): Promise<ContentQueue | undefined>;
  deleteQueueItem(id: string): Promise<void>;
  
  // Deal Analyses
  createDealAnalysis(analysis: InsertDealAnalysis): Promise<DealAnalysis>;
  getDealAnalysesByProfile(profileId: string): Promise<DealAnalysis[]>;
  
  // Job Votes
  voteOnJob(vote: InsertJobVote): Promise<JobVote>;
  getJobVotes(jobId: string): Promise<{ upvotes: number; downvotes: number; comments: (JobVote & { profile: CreatorProfile })[] }>;
  getUserJobVote(profileId: string, jobId: string): Promise<JobVote | undefined>;
  deleteJobVote(profileId: string, jobId: string): Promise<void>;
  
  // Media Kit Views
  trackMediaKitView(view: InsertMediaKitView): Promise<MediaKitView>;
  getMediaKitAnalytics(profileId: string): Promise<MediaKitAnalytics>;
  
  // Anonymous Rate Sharing
  submitAnonymousRate(rate: InsertAnonymousRate): Promise<AnonymousRate>;
  getAnonymousRates(niche: string, platform: string): Promise<{
    count: number;
    avgRate: number;
    minRate: number;
    maxRate: number;
    byDeliverable: Record<string, { count: number; avgRate: number }>;
    byFollowerRange: Record<string, { count: number; avgRate: number }>;
  }>;
  
  // Deal Votes
  voteDeal(vote: InsertDealVote): Promise<DealVote>;
  getDealVotes(postId: string): Promise<{
    takeIt: number;
    pass: number;
    negotiate: number;
    total: number;
    userVote?: DealVote;
  }>;
  getUserDealVote(profileId: string, postId: string): Promise<DealVote | undefined>;
}

// STORAGE IMPLEMENTATION
class Storage implements IStorage {
  // CREATOR PROFILES
  async getProfileByUserId(userId: string): Promise<CreatorProfile | undefined> {
    const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertCreatorProfile): Promise<CreatorProfile> {
    const [newProfile] = await db.insert(creatorProfiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(id: string, profile: Partial<InsertCreatorProfile>): Promise<CreatorProfile | undefined> {
    const [updated] = await db
      .update(creatorProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(creatorProfiles.id, id))
      .returning();
    return updated;
  }

  // PLATFORM CONNECTIONS
  async getConnectionsByProfile(profileId: string): Promise<PlatformConnection[]> {
    return await db.select().from(platformConnections).where(eq(platformConnections.profileId, profileId));
  }

  async createConnection(connection: InsertPlatformConnection): Promise<PlatformConnection> {
    const [newConnection] = await db.insert(platformConnections).values(connection).returning();
    return newConnection;
  }

  async updateConnection(id: string, connection: Partial<InsertPlatformConnection>): Promise<PlatformConnection | undefined> {
    const [updated] = await db
      .update(platformConnections)
      .set({ ...connection, updatedAt: new Date() })
      .where(eq(platformConnections.id, id))
      .returning();
    return updated;
  }

  async deleteConnection(id: string): Promise<void> {
    await db.delete(platformConnections).where(eq(platformConnections.id, id));
  }

  // RATE CARDS
  async getRateCardsByProfile(profileId: string): Promise<RateCard[]> {
    return await db.select().from(rateCards).where(eq(rateCards.profileId, profileId));
  }

  async createRateCard(rateCard: InsertRateCard): Promise<RateCard> {
    const [newCard] = await db.insert(rateCards).values(rateCard).returning();
    return newCard;
  }

  async updateRateCard(id: string, rateCard: Partial<InsertRateCard>): Promise<RateCard | undefined> {
    const [updated] = await db
      .update(rateCards)
      .set({ ...rateCard, updatedAt: new Date() })
      .where(eq(rateCards.id, id))
      .returning();
    return updated;
  }

  async deleteRateCard(id: string): Promise<void> {
    await db.delete(rateCards).where(eq(rateCards.id, id));
  }

  // NICHE GROUPS
  async getAllGroups(): Promise<NicheGroup[]> {
    return await db.select().from(nicheGroups).orderBy(desc(nicheGroups.memberCount));
  }

  async getGroupBySlug(slug: string): Promise<NicheGroup | undefined> {
    const [group] = await db.select().from(nicheGroups).where(eq(nicheGroups.slug, slug));
    return group;
  }

  async createGroup(group: InsertNicheGroup): Promise<NicheGroup> {
    const [newGroup] = await db.insert(nicheGroups).values(group).returning();
    return newGroup;
  }

  async getGroupsByProfile(profileId: string): Promise<NicheGroup[]> {
    const memberships = await db
      .select({ group: nicheGroups })
      .from(groupMemberships)
      .innerJoin(nicheGroups, eq(groupMemberships.groupId, nicheGroups.id))
      .where(eq(groupMemberships.profileId, profileId));
    
    return memberships.map(m => m.group);
  }

  async joinGroup(membership: InsertGroupMembership): Promise<GroupMembership> {
    const [newMembership] = await db.insert(groupMemberships).values(membership).returning();
    
    // Increment member count
    await db
      .update(nicheGroups)
      .set({ memberCount: sql`${nicheGroups.memberCount} + 1` })
      .where(eq(nicheGroups.id, membership.groupId));
    
    return newMembership;
  }

  async leaveGroup(profileId: string, groupId: string): Promise<void> {
    await db
      .delete(groupMemberships)
      .where(and(eq(groupMemberships.profileId, profileId), eq(groupMemberships.groupId, groupId)));
    
    // Decrement member count
    await db
      .update(nicheGroups)
      .set({ memberCount: sql`${nicheGroups.memberCount} - 1` })
      .where(eq(nicheGroups.id, groupId));
  }

  // COMMUNITY POSTS
  async getPosts(groupId?: string, limit: number = 50): Promise<(CommunityPost & { profile: CreatorProfile })[]> {
    let query = db
      .select({
        post: communityPosts,
        profile: creatorProfiles,
      })
      .from(communityPosts)
      .innerJoin(creatorProfiles, eq(communityPosts.profileId, creatorProfiles.id))
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit);

    if (groupId) {
      query = query.where(eq(communityPosts.groupId, groupId)) as any;
    }

    const results = await query;
    return results.map(r => ({ ...r.post, profile: r.profile }));
  }

  async getPostById(id: string): Promise<(CommunityPost & { profile: CreatorProfile }) | undefined> {
    const [result] = await db
      .select({
        post: communityPosts,
        profile: creatorProfiles,
      })
      .from(communityPosts)
      .innerJoin(creatorProfiles, eq(communityPosts.profileId, creatorProfiles.id))
      .where(eq(communityPosts.id, id));

    if (!result) return undefined;
    return { ...result.post, profile: result.profile };
  }

  async createPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db.insert(communityPosts).values(post).returning();
    return newPost;
  }

  async updatePost(id: string, post: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined> {
    const [updated] = await db
      .update(communityPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(communityPosts.id, id))
      .returning();
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(communityPosts).where(eq(communityPosts.id, id));
  }

  async likePost(like: InsertPostLike): Promise<void> {
    await db.insert(postLikes).values(like).onConflictDoNothing();
    
    // Increment like count
    await db
      .update(communityPosts)
      .set({ likesCount: sql`${communityPosts.likesCount} + 1` })
      .where(eq(communityPosts.id, like.postId));
  }

  async unlikePost(profileId: string, postId: string): Promise<void> {
    await db
      .delete(postLikes)
      .where(and(eq(postLikes.profileId, profileId), eq(postLikes.postId, postId)));
    
    // Decrement like count
    await db
      .update(communityPosts)
      .set({ likesCount: sql`${communityPosts.likesCount} - 1` })
      .where(eq(communityPosts.id, postId));
  }

  // POST COMMENTS
  async getCommentsByPost(postId: string): Promise<(PostComment & { profile: CreatorProfile })[]> {
    const results = await db
      .select({
        comment: postComments,
        profile: creatorProfiles,
      })
      .from(postComments)
      .innerJoin(creatorProfiles, eq(postComments.profileId, creatorProfiles.id))
      .where(eq(postComments.postId, postId))
      .orderBy(desc(postComments.createdAt));

    return results.map(r => ({ ...r.comment, profile: r.profile }));
  }

  async createComment(comment: InsertPostComment): Promise<PostComment> {
    const [newComment] = await db.insert(postComments).values(comment).returning();
    
    // Increment comment count
    await db
      .update(communityPosts)
      .set({ commentsCount: sql`${communityPosts.commentsCount} + 1` })
      .where(eq(communityPosts.id, comment.postId));
    
    return newComment;
  }

  // JOBS
  async getJobs(filters?: { niche?: string; type?: string; status?: string }): Promise<Job[]> {
    let query = db.select().from(jobs).orderBy(desc(jobs.createdAt));

    const conditions = [];
    if (filters?.niche) conditions.push(eq(jobs.niche, filters.niche));
    if (filters?.type) conditions.push(eq(jobs.type, filters.type as any));
    if (filters?.status) conditions.push(eq(jobs.status, filters.status as any));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query;
  }

  async getJobById(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async applyToJob(application: InsertJobApplication): Promise<JobApplication> {
    const [newApp] = await db.insert(jobApplications).values(application).returning();
    return newApp;
  }

  async getApplicationsByProfile(profileId: string): Promise<(JobApplication & { job: Job })[]> {
    const results = await db
      .select({
        application: jobApplications,
        job: jobs,
      })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .where(eq(jobApplications.profileId, profileId))
      .orderBy(desc(jobApplications.createdAt));

    return results.map(r => ({ ...r.application, job: r.job }));
  }

  // PRICING BENCHMARKS
  async getBenchmarks(filters: { niche: string; platform: string; deliverable: string }): Promise<PricingBenchmark[]> {
    return await db
      .select()
      .from(pricingBenchmarks)
      .where(
        and(
          eq(pricingBenchmarks.niche, filters.niche),
          eq(pricingBenchmarks.platform, filters.platform),
          eq(pricingBenchmarks.deliverable, filters.deliverable)
        )
      );
  }

  async getBenchmarkForFollowers(filters: { niche: string; platform: string; deliverable: string; followers: number }): Promise<PricingBenchmark | undefined> {
    const allBenchmarks = await this.getBenchmarks({
      niche: filters.niche,
      platform: filters.platform,
      deliverable: filters.deliverable,
    });
    
    const followers = filters.followers;
    
    for (const benchmark of allBenchmarks) {
      const range = benchmark.followerRange;
      const [minStr, maxStr] = range.split("-");
      
      const parseFollowers = (str: string): number => {
        str = str.trim().toUpperCase();
        if (str.endsWith("M")) return parseFloat(str) * 1000000;
        if (str.endsWith("K")) return parseFloat(str) * 1000;
        return parseInt(str.replace(/,/g, ""), 10);
      };
      
      const min = parseFollowers(minStr);
      const max = maxStr ? parseFollowers(maxStr) : Infinity;
      
      if (followers >= min && followers <= max) {
        return benchmark;
      }
    }
    
    return allBenchmarks[0];
  }

  // CONTENT QUEUE
  async getQueueByProfile(profileId: string): Promise<ContentQueue[]> {
    return await db
      .select()
      .from(contentQueue)
      .where(eq(contentQueue.profileId, profileId))
      .orderBy(desc(contentQueue.createdAt));
  }

  async createQueueItem(item: InsertContentQueue): Promise<ContentQueue> {
    const [newItem] = await db.insert(contentQueue).values(item).returning();
    return newItem;
  }

  async updateQueueItem(id: string, item: Partial<InsertContentQueue>): Promise<ContentQueue | undefined> {
    const [updated] = await db
      .update(contentQueue)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(contentQueue.id, id))
      .returning();
    return updated;
  }

  async deleteQueueItem(id: string): Promise<void> {
    await db.delete(contentQueue).where(eq(contentQueue.id, id));
  }

  // DEAL ANALYSES
  async createDealAnalysis(analysis: InsertDealAnalysis): Promise<DealAnalysis> {
    const [newAnalysis] = await db.insert(dealAnalyses).values(analysis).returning();
    return newAnalysis;
  }

  async getDealAnalysesByProfile(profileId: string): Promise<DealAnalysis[]> {
    return await db
      .select()
      .from(dealAnalyses)
      .where(eq(dealAnalyses.profileId, profileId))
      .orderBy(desc(dealAnalyses.createdAt));
  }

  // JOB VOTES
  async voteOnJob(vote: InsertJobVote): Promise<JobVote> {
    const existingVote = await this.getUserJobVote(vote.profileId, vote.jobId);
    
    if (existingVote) {
      const [updated] = await db
        .update(jobVotes)
        .set({ voteType: vote.voteType, comment: vote.comment })
        .where(eq(jobVotes.id, existingVote.id))
        .returning();
      return updated;
    }
    
    const [newVote] = await db.insert(jobVotes).values(vote).returning();
    
    const job = await db.select().from(jobs).where(eq(jobs.id, vote.jobId)).limit(1);
    if (job.length > 0) {
      const adjustment = vote.voteType === "upvote" ? 1 : -1;
      await db
        .update(jobs)
        .set({ trustScore: sql`${jobs.trustScore} + ${adjustment}` })
        .where(eq(jobs.id, vote.jobId));
    }
    
    return newVote;
  }

  async getJobVotes(jobId: string): Promise<{ upvotes: number; downvotes: number; comments: (JobVote & { profile: CreatorProfile })[] }> {
    const allVotes = await db.select().from(jobVotes).where(eq(jobVotes.jobId, jobId));
    
    const upvotes = allVotes.filter(v => v.voteType === "upvote").length;
    const downvotes = allVotes.filter(v => v.voteType === "downvote").length;
    
    const votesWithComments = await db
      .select({
        vote: jobVotes,
        profile: creatorProfiles,
      })
      .from(jobVotes)
      .innerJoin(creatorProfiles, eq(jobVotes.profileId, creatorProfiles.id))
      .where(and(eq(jobVotes.jobId, jobId), sql`${jobVotes.comment} IS NOT NULL AND ${jobVotes.comment} != ''`))
      .orderBy(desc(jobVotes.createdAt));
    
    const comments = votesWithComments.map(r => ({ ...r.vote, profile: r.profile }));
    
    return { upvotes, downvotes, comments };
  }

  async getUserJobVote(profileId: string, jobId: string): Promise<JobVote | undefined> {
    const [vote] = await db
      .select()
      .from(jobVotes)
      .where(and(eq(jobVotes.profileId, profileId), eq(jobVotes.jobId, jobId)));
    return vote;
  }

  async deleteJobVote(profileId: string, jobId: string): Promise<void> {
    const existingVote = await this.getUserJobVote(profileId, jobId);
    if (existingVote) {
      const adjustment = existingVote.voteType === "upvote" ? -1 : 1;
      await db
        .update(jobs)
        .set({ trustScore: sql`${jobs.trustScore} + ${adjustment}` })
        .where(eq(jobs.id, jobId));
    }
    
    await db
      .delete(jobVotes)
      .where(and(eq(jobVotes.profileId, profileId), eq(jobVotes.jobId, jobId)));
  }

  // MEDIA KIT VIEWS
  async trackMediaKitView(view: InsertMediaKitView): Promise<MediaKitView> {
    const [newView] = await db.insert(mediaKitViews).values(view).returning();
    return newView;
  }

  async getMediaKitAnalytics(profileId: string): Promise<MediaKitAnalytics> {
    const allViews = await db
      .select()
      .from(mediaKitViews)
      .where(eq(mediaKitViews.profileId, profileId))
      .orderBy(desc(mediaKitViews.viewedAt));

    const totalViews = allViews.length;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const viewsLast7Days = allViews.filter(v => v.viewedAt && new Date(v.viewedAt) >= sevenDaysAgo).length;
    
    const totalTimeSpent = allViews.reduce((sum, v) => sum + (v.timeSpentSeconds || 0), 0);
    const avgTimeSpent = totalViews > 0 ? Math.round(totalTimeSpent / totalViews) : 0;
    
    const pagesViewedBreakdown: Record<string, number> = {};
    allViews.forEach(v => {
      const pages = (v.pagesViewed as string[]) || [];
      pages.forEach(page => {
        pagesViewedBreakdown[page] = (pagesViewedBreakdown[page] || 0) + 1;
      });
    });
    
    const contactClicks = allViews.filter(v => v.clickedContact).length;
    const pdfDownloads = allViews.filter(v => v.downloadedPdf).length;
    
    const recentViews = allViews.slice(0, 20);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const viewsByDayMap: Record<string, number> = {};
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      viewsByDayMap[dateStr] = 0;
    }
    
    allViews.forEach(v => {
      if (v.viewedAt) {
        const dateStr = new Date(v.viewedAt).toISOString().split('T')[0];
        if (viewsByDayMap[dateStr] !== undefined) {
          viewsByDayMap[dateStr]++;
        }
      }
    });
    
    const viewsByDay = Object.entries(viewsByDayMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalViews,
      viewsLast7Days,
      avgTimeSpent,
      pagesViewedBreakdown,
      contactClicks,
      pdfDownloads,
      recentViews,
      viewsByDay,
    };
  }

  // ANONYMOUS RATE SHARING
  async submitAnonymousRate(rate: InsertAnonymousRate): Promise<AnonymousRate> {
    const [newRate] = await db.insert(anonymousRates).values(rate).returning();
    return newRate;
  }

  async getAnonymousRates(niche: string, platform: string): Promise<{
    count: number;
    avgRate: number;
    minRate: number;
    maxRate: number;
    byDeliverable: Record<string, { count: number; avgRate: number }>;
    byFollowerRange: Record<string, { count: number; avgRate: number }>;
  }> {
    const rates = await db
      .select()
      .from(anonymousRates)
      .where(and(eq(anonymousRates.niche, niche), eq(anonymousRates.platform, platform)));

    if (rates.length === 0) {
      return {
        count: 0,
        avgRate: 0,
        minRate: 0,
        maxRate: 0,
        byDeliverable: {},
        byFollowerRange: {},
      };
    }

    const allRateValues = rates.map(r => r.rateCharged);
    const count = rates.length;
    const avgRate = Math.round(allRateValues.reduce((a, b) => a + b, 0) / count);
    const minRate = Math.min(...allRateValues);
    const maxRate = Math.max(...allRateValues);

    const byDeliverable: Record<string, { count: number; avgRate: number }> = {};
    const byFollowerRange: Record<string, { count: number; avgRate: number }> = {};

    rates.forEach(rate => {
      if (!byDeliverable[rate.deliverable]) {
        byDeliverable[rate.deliverable] = { count: 0, avgRate: 0 };
      }
      byDeliverable[rate.deliverable].count++;
      byDeliverable[rate.deliverable].avgRate += rate.rateCharged;

      if (!byFollowerRange[rate.followerRange]) {
        byFollowerRange[rate.followerRange] = { count: 0, avgRate: 0 };
      }
      byFollowerRange[rate.followerRange].count++;
      byFollowerRange[rate.followerRange].avgRate += rate.rateCharged;
    });

    Object.keys(byDeliverable).forEach(key => {
      byDeliverable[key].avgRate = Math.round(byDeliverable[key].avgRate / byDeliverable[key].count);
    });
    Object.keys(byFollowerRange).forEach(key => {
      byFollowerRange[key].avgRate = Math.round(byFollowerRange[key].avgRate / byFollowerRange[key].count);
    });

    return { count, avgRate, minRate, maxRate, byDeliverable, byFollowerRange };
  }

  // DEAL VOTES
  async voteDeal(vote: InsertDealVote): Promise<DealVote> {
    const existingVote = await this.getUserDealVote(vote.profileId, vote.postId);
    
    if (existingVote) {
      const [updated] = await db
        .update(dealVotes)
        .set({ vote: vote.vote, reason: vote.reason })
        .where(eq(dealVotes.id, existingVote.id))
        .returning();
      return updated;
    }
    
    const [newVote] = await db.insert(dealVotes).values(vote).returning();
    return newVote;
  }

  async getDealVotes(postId: string): Promise<{
    takeIt: number;
    pass: number;
    negotiate: number;
    total: number;
    userVote?: DealVote;
  }> {
    const allVotes = await db.select().from(dealVotes).where(eq(dealVotes.postId, postId));
    
    const takeIt = allVotes.filter(v => v.vote === "take_it").length;
    const pass = allVotes.filter(v => v.vote === "pass").length;
    const negotiate = allVotes.filter(v => v.vote === "negotiate").length;
    const total = allVotes.length;
    
    return { takeIt, pass, negotiate, total };
  }

  async getUserDealVote(profileId: string, postId: string): Promise<DealVote | undefined> {
    const [vote] = await db
      .select()
      .from(dealVotes)
      .where(and(eq(dealVotes.profileId, profileId), eq(dealVotes.postId, postId)));
    return vote;
  }

  async getProfileById(id: string): Promise<CreatorProfile | undefined> {
    const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, id));
    return profile;
  }

  // PUBLIC PROFILES
  async getPublicProfileByUsername(username: string): Promise<CreatorProfile | undefined> {
    const [profile] = await db
      .select()
      .from(creatorProfiles)
      .where(and(eq(creatorProfiles.username, username), eq(creatorProfiles.isPublic, true)));
    return profile;
  }

  async searchProfiles(query: string, excludeProfileId?: string): Promise<CreatorProfile[]> {
    let results = await db
      .select()
      .from(creatorProfiles)
      .where(
        or(
          like(creatorProfiles.displayName, `%${query}%`),
          like(creatorProfiles.username, `%${query}%`),
          like(creatorProfiles.niche, `%${query}%`),
        )
      )
      .limit(20);
    if (excludeProfileId) {
      results = results.filter(p => p.id !== excludeProfileId);
    }
    return results;
  }

  async getAllCreatorProfiles(limit = 50): Promise<CreatorProfile[]> {
    return db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.accountType, "creator"))
      .limit(limit);
  }

  // CONVERSATIONS / DMs
  async getOrCreateConversation(profileIdA: string, profileIdB: string): Promise<Conversation> {
    // Look for existing conversation between these two profiles (either order)
    const existing = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(eq(conversations.profileIdA, profileIdA), eq(conversations.profileIdB, profileIdB)),
          and(eq(conversations.profileIdA, profileIdB), eq(conversations.profileIdB, profileIdA)),
        )
      )
      .limit(1);
    if (existing.length > 0) return existing[0];

    const [created] = await db
      .insert(conversations)
      .values({ profileIdA, profileIdB })
      .returning();
    return created;
  }

  async getConversationsForProfile(profileId: string): Promise<(Conversation & { otherProfile: CreatorProfile; unreadCount: number })[]> {
    const convs = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.profileIdA, profileId),
          eq(conversations.profileIdB, profileId),
        )
      )
      .orderBy(desc(conversations.lastMessageAt));

    const result = [];
    for (const conv of convs) {
      const otherProfileId = conv.profileIdA === profileId ? conv.profileIdB : conv.profileIdA;
      const [otherProfile] = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.id, otherProfileId));
      if (!otherProfile) continue;
      const unreadCount = conv.profileIdA === profileId ? (conv.unreadCountA ?? 0) : (conv.unreadCountB ?? 0);
      result.push({ ...conv, otherProfile, unreadCount });
    }
    return result;
  }

  async getMessagesForConversation(conversationId: string): Promise<(Message & { senderProfile: CreatorProfile })[]> {
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    const result = [];
    for (const msg of msgs) {
      const [senderProfile] = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.id, msg.senderProfileId));
      if (senderProfile) {
        result.push({ ...msg, senderProfile });
      }
    }
    return result;
  }

  async sendMessage(data: { conversationId: string; senderProfileId: string; content: string; messageType?: string; offerData?: any }): Promise<Message> {
    const [msg] = await db
      .insert(messages)
      .values({
        conversationId: data.conversationId,
        senderProfileId: data.senderProfileId,
        content: data.content,
        messageType: data.messageType || "text",
        offerData: data.offerData || null,
      })
      .returning();

    // Update conversation last message
    const conv = await db.select().from(conversations).where(eq(conversations.id, data.conversationId)).limit(1);
    if (conv.length > 0) {
      const isA = conv[0].profileIdA === data.senderProfileId;
      await db
        .update(conversations)
        .set({
          lastMessageAt: new Date(),
          lastMessagePreview: data.content.slice(0, 80),
          // Increment unread count for the OTHER participant
          unreadCountA: isA ? (conv[0].unreadCountA ?? 0) : (conv[0].unreadCountA ?? 0) + 1,
          unreadCountB: isA ? (conv[0].unreadCountB ?? 0) + 1 : (conv[0].unreadCountB ?? 0),
        })
        .where(eq(conversations.id, data.conversationId));
    }

    return msg;
  }

  async markConversationRead(conversationId: string, profileId: string): Promise<void> {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
    if (!conv) return;
    const isA = conv.profileIdA === profileId;
    await db
      .update(conversations)
      .set(isA ? { unreadCountA: 0 } : { unreadCountB: 0 })
      .where(eq(conversations.id, conversationId));
    // Mark all messages in this conversation as read for this profile
    await db
      .update(messages)
      .set({ isRead: true })
      .where(and(
        eq(messages.conversationId, conversationId),
        eq(messages.isRead, false),
      ));
  }

  async getTotalUnreadCount(profileId: string): Promise<number> {
    const convs = await db
      .select()
      .from(conversations)
      .where(or(
        eq(conversations.profileIdA, profileId),
        eq(conversations.profileIdB, profileId),
      ));
    return convs.reduce((sum, conv) => {
      const unread = conv.profileIdA === profileId ? (conv.unreadCountA ?? 0) : (conv.unreadCountB ?? 0);
      return sum + unread;
    }, 0);
  }

  async generateUniqueUsername(displayName: string): Promise<string> {
    const base = displayName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "creator";
    let candidate = base;
    let attempt = 0;
    while (true) {
      const [existing] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.username, candidate));
      if (!existing) return candidate;
      attempt++;
      candidate = `${base}${attempt}`;
    }
  }
}

export const storage = new Storage();
