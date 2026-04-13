export * from "./models/auth";
export * from "./models/chat";

import { pgTable, varchar, text, timestamp, integer, boolean, jsonb, decimal, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// CREATOR PROFILES
export const creatorProfiles = pgTable("creator_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Account Type
  accountType: varchar("account_type").default("creator"), // 'creator' | 'brand'
  
  // Public Profile
  username: varchar("username").unique(), // slug for /p/:username
  isPublic: boolean("is_public").default(true),
  
  // Basic Info
  displayName: varchar("display_name").notNull(),
  tagline: varchar("tagline"),
  bio: text("bio"),
  niche: varchar("niche"),
  location: varchar("location"),
  website: varchar("website"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Brand-specific fields
  companyName: varchar("company_name"),
  brandCategory: varchar("brand_category"),
  brandBudgetRange: varchar("brand_budget_range"),
  brandLookingFor: jsonb("brand_looking_for"), // Array of content types

  // Social links (separate from OAuth connections — manual entry)
  socialLinks: jsonb("social_links"), // {platform, url, handle, followerCount}[]

  // Media Kit Data
  mediaKitData: jsonb("media_kit_data"), // Stores the full media kit JSON
  
  // Setup complete
  setupComplete: boolean("setup_complete").default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCreatorProfileSchema = createInsertSchema(creatorProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCreatorProfile = z.infer<typeof insertCreatorProfileSchema>;
export type CreatorProfile = typeof creatorProfiles.$inferSelect;

// PLATFORM CONNECTIONS (Instagram, TikTok, YouTube, etc.)
export const platformTypeEnum = pgEnum("platform_type", ["instagram", "tiktok", "youtube", "twitter", "linkedin", "newsletter", "blog"]);

export const platformConnections = pgTable("platform_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  platform: platformTypeEnum("platform").notNull(),
  
  // Connection Data
  handle: varchar("handle").notNull(),
  platformUserId: varchar("platform_user_id"),
  accessToken: text("access_token"), // Encrypted
  refreshToken: text("refresh_token"), // Encrypted
  tokenExpiry: timestamp("token_expiry"),
  
  // Cached Stats (updated periodically)
  followerCount: integer("follower_count"),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }),
  lastStatsUpdate: timestamp("last_stats_update"),
  statsData: jsonb("stats_data"), // Detailed metrics
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlatformConnectionSchema = createInsertSchema(platformConnections).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPlatformConnection = z.infer<typeof insertPlatformConnectionSchema>;
export type PlatformConnection = typeof platformConnections.$inferSelect;

// RATE CARDS
export const rateCards = pgTable("rate_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  
  name: varchar("name").notNull(),
  isDefault: boolean("is_default").default(false),
  templateStyle: varchar("template_style"), // Visual template choice
  rates: jsonb("rates").notNull(), // Array of rate items
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRateCardSchema = createInsertSchema(rateCards).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRateCard = z.infer<typeof insertRateCardSchema>;
export type RateCard = typeof rateCards.$inferSelect;

// NICHE GROUPS
export const nicheGroups = pgTable("niche_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  memberCount: integer("member_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNicheGroupSchema = createInsertSchema(nicheGroups).omit({ id: true, createdAt: true, memberCount: true });
export type InsertNicheGroup = z.infer<typeof insertNicheGroupSchema>;
export type NicheGroup = typeof nicheGroups.$inferSelect;

// GROUP MEMBERSHIPS
export const groupMemberships = pgTable("group_memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => nicheGroups.id, { onDelete: "cascade" }),
  profileId: varchar("profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertGroupMembershipSchema = createInsertSchema(groupMemberships).omit({ id: true, joinedAt: true });
export type InsertGroupMembership = z.infer<typeof insertGroupMembershipSchema>;
export type GroupMembership = typeof groupMemberships.$inferSelect;

// COMMUNITY POSTS
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  groupId: varchar("group_id").references(() => nicheGroups.id, { onDelete: "set null" }),
  
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls"), // Array of image/video URLs
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  isDealQuestion: boolean("is_deal_question").default(false), // For "Deal Check" posts
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, createdAt: true, updatedAt: true, likesCount: true, commentsCount: true });
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

// POST COMMENTS
export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  profileId: varchar("profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({ id: true, createdAt: true });
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type PostComment = typeof postComments.$inferSelect;

// POST LIKES
export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  profileId: varchar("profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({ id: true, createdAt: true });
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type PostLike = typeof postLikes.$inferSelect;

// JOB BOARD
export const jobStatusEnum = pgEnum("job_status", ["open", "closed", "filled"]);
export const jobTypeEnum = pgEnum("job_type", ["brand_deal", "ugc", "collaboration", "casting_call"]);
export const paymentTypeEnum = pgEnum("payment_type", ["flat_fee", "commission", "hybrid"]);

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  company: varchar("company"),
  type: jobTypeEnum("type").notNull(),
  status: jobStatusEnum("status").default("open"),
  
  budget: varchar("budget"), // e.g., "$500-$1000"
  niche: varchar("niche"),
  requiredFollowers: integer("required_followers"),
  platforms: jsonb("platforms"), // Array of platform names
  location: varchar("location"),
  
  externalUrl: varchar("external_url"),
  contactEmail: varchar("contact_email"),
  
  isVerified: boolean("is_verified").default(false),
  paymentType: paymentTypeEnum("payment_type").default("flat_fee"),
  trustScore: integer("trust_score").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// JOB APPLICATIONS
export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  profileId: varchar("profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  
  message: text("message"),
  status: varchar("status").default("pending"), // pending, reviewed, accepted, rejected
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({ id: true, createdAt: true, status: true });
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

// PRICING BENCHMARKS (Industry standards)
export const pricingBenchmarks = pgTable("pricing_benchmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  niche: varchar("niche").notNull(),
  platform: varchar("platform").notNull(),
  deliverable: varchar("deliverable").notNull(), // e.g., "Instagram Post", "TikTok Video"
  
  followerRange: varchar("follower_range").notNull(), // e.g., "10K-50K"
  avgPrice: decimal("avg_price", { precision: 10, scale: 2 }),
  minPrice: decimal("min_price", { precision: 10, scale: 2 }),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPricingBenchmarkSchema = createInsertSchema(pricingBenchmarks).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPricingBenchmark = z.infer<typeof insertPricingBenchmarkSchema>;
export type PricingBenchmark = typeof pricingBenchmarks.$inferSelect;

// CONTENT QUEUE (For multi-platform publishing)
export const contentQueue = pgTable("content_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  
  caption: text("caption").notNull(),
  mediaUrls: jsonb("media_urls").notNull(), // Array of uploaded media
  targetPlatforms: jsonb("target_platforms").notNull(), // Array of platform IDs
  
  scheduledFor: timestamp("scheduled_for"),
  status: varchar("status").default("draft"), // draft, scheduled, publishing, published, failed
  publishResults: jsonb("publish_results"), // Results per platform
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContentQueueSchema = createInsertSchema(contentQueue).omit({ id: true, createdAt: true, updatedAt: true, status: true });
export type InsertContentQueue = z.infer<typeof insertContentQueueSchema>;
export type ContentQueue = typeof contentQueue.$inferSelect;

// DEAL ANALYSES (AI-powered contract/email analysis)
export const dealAnalyses = pgTable("deal_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  
  originalText: text("original_text").notNull(), // The brand email or contract snippet
  analysisType: varchar("analysis_type").notNull(), // "email", "contract", "dm"
  
  // AI Analysis Results
  summary: text("summary"), // What they're actually asking for
  redFlags: jsonb("red_flags"), // Array of concerning clauses
  missingTerms: jsonb("missing_terms"), // What's not covered
  suggestedCounter: text("suggested_counter"), // Counter-offer template
  estimatedValue: varchar("estimated_value"), // What this deal is worth
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDealAnalysisSchema = createInsertSchema(dealAnalyses).omit({ id: true, createdAt: true });
export type InsertDealAnalysis = z.infer<typeof insertDealAnalysisSchema>;
export type DealAnalysis = typeof dealAnalyses.$inferSelect;

// JOB VOTES (upvote/downvote on job opportunities)
export const jobVotes = pgTable("job_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  profileId: varchar("profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  
  voteType: varchar("vote_type").notNull(), // "upvote" or "downvote"
  comment: text("comment"), // Optional feedback about the opportunity
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobVoteSchema = createInsertSchema(jobVotes).omit({ id: true, createdAt: true });
export type InsertJobVote = z.infer<typeof insertJobVoteSchema>;
export type JobVote = typeof jobVotes.$inferSelect;

// ANONYMOUS RATE SUBMISSIONS (community rate sharing)
export const anonymousRates = pgTable("anonymous_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  niche: varchar("niche").notNull(),
  platform: varchar("platform").notNull(),
  deliverable: varchar("deliverable").notNull(),
  followerRange: varchar("follower_range").notNull(),
  rateCharged: integer("rate_charged").notNull(),
  
  // Deal context (all anonymous)
  brandType: varchar("brand_type"), // "startup", "enterprise", "agency"
  wasNegotiated: boolean("was_negotiated"),
  dealOutcome: varchar("deal_outcome"), // "accepted", "rejected", "countered"
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnonymousRateSchema = createInsertSchema(anonymousRates).omit({ id: true, createdAt: true });
export type InsertAnonymousRate = z.infer<typeof insertAnonymousRateSchema>;
export type AnonymousRate = typeof anonymousRates.$inferSelect;

// MEDIA KIT VIEWS (analytics tracking)
export const mediaKitViews = pgTable("media_kit_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  
  viewerIp: varchar("viewer_ip"), // Hashed for privacy
  referrer: varchar("referrer"),
  userAgent: text("user_agent"),
  
  // Engagement metrics
  pagesViewed: jsonb("pages_viewed"), // Array of page names viewed
  timeSpentSeconds: integer("time_spent_seconds"),
  clickedContact: boolean("clicked_contact").default(false),
  downloadedPdf: boolean("downloaded_pdf").default(false),
  
  viewedAt: timestamp("viewed_at").defaultNow(),
});

export const insertMediaKitViewSchema = createInsertSchema(mediaKitViews).omit({ id: true, viewedAt: true });
export type InsertMediaKitView = z.infer<typeof insertMediaKitViewSchema>;
export type MediaKitView = typeof mediaKitViews.$inferSelect;

// DEAL VOTES (community voting on deals - "Would you take this?")
export const dealVotes = pgTable("deal_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  profileId: varchar("profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  
  vote: varchar("vote").notNull(), // "take_it", "pass", "negotiate"
  reason: text("reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDealVoteSchema = createInsertSchema(dealVotes).omit({ id: true, createdAt: true });
export type InsertDealVote = z.infer<typeof insertDealVoteSchema>;
export type DealVote = typeof dealVotes.$inferSelect;

// CONVERSATIONS (DM threads between two profiles)
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileIdA: varchar("profile_id_a").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  profileIdB: varchar("profile_id_b").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  lastMessagePreview: text("last_message_preview"),
  unreadCountA: integer("unread_count_a").default(0), // unread for profileA
  unreadCountB: integer("unread_count_b").default(0), // unread for profileB
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, lastMessageAt: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// MESSAGES
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderProfileId: varchar("sender_profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // 'text' | 'offer'
  offerData: jsonb("offer_data"), // {deliverable, rate, platforms, notes, deadline} if type=offer
  
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isRead: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
