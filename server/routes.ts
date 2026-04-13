import type { Express, Response, Request } from "express";
import { createServer, type Server } from "http";
import { createHash } from "crypto";
import { storage } from "./storage";
import { isAuthenticated } from "./replit_integrations/auth";
import { 
  insertCreatorProfileSchema,
  insertPlatformConnectionSchema,
  insertRateCardSchema,
  insertGroupMembershipSchema,
  insertCommunityPostSchema,
  insertPostCommentSchema,
  insertPostLikeSchema,
  insertJobApplicationSchema,
  insertContentQueueSchema,
  insertJobVoteSchema,
  insertMediaKitViewSchema,
  insertAnonymousRateSchema,
  insertDealVoteSchema,
} from "@shared/schema";
import { z } from "zod";
import { analyzeDeal, extractTextFromImage, generatePitchPackage } from "./deal-analyzer";

// Extend Express Request type with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        claims: {
          sub: string;
        };
      };
    }
  }
}

type AuthRequest = Express.Request & { user: { claims: { sub: string } } };

async function getOrCreateProfile(userId: string) {
  let profile = await storage.getProfileByUserId(userId);
  if (!profile) {
    const username = await storage.generateUniqueUsername("creator");
    profile = await storage.createProfile({
      userId,
      displayName: "New Creator",
      username,
      accountType: "creator",
      isPublic: true,
      setupComplete: false,
    });
  }
  // Generate username if missing
  if (!profile.username) {
    const username = await storage.generateUniqueUsername(profile.displayName || "creator");
    profile = await storage.updateProfile(profile.id, { username }) || profile;
  }
  return profile;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // PUBLIC PROFILE (no auth required)
  app.get("/api/profile/public/:username", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const profile = await storage.getPublicProfileByUsername(username);
      if (!profile) {
        res.status(404).json({ message: "Profile not found" });
        return;
      }
      const connections = await storage.getConnectionsByProfile(profile.id);
      const rateCardList = await storage.getRateCardsByProfile(profile.id);
      const rateCards = rateCardList.map(rc => ({
        name: rc.name,
        rates: (rc.rates as any[]) || [],
      }));
      res.json({ profile, connections, rateCards });
    } catch (error) {
      console.error("Error fetching public profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // PROFILE SEARCH
  app.get("/api/profiles/search", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const q = String(req.query.q || "");
      const userId = req.user.claims.sub;
      const myProfile = await getOrCreateProfile(userId);
      const results = await storage.searchProfiles(q, myProfile.id);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search profiles" });
    }
  });

  // PROFILE ROUTES
  app.get("/api/profile", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      
      const validatedData = insertCreatorProfileSchema.partial().parse(req.body);
      const updated = await storage.updateProfile(profile.id, validatedData);
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Failed to update profile" });
      }
    }
  });

  // PLATFORM CONNECTION ROUTES
  app.get("/api/profile/connections", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const connections = await storage.getConnectionsByProfile(profile.id);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.post("/api/profile/connections", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      
      const validatedData = insertPlatformConnectionSchema.parse({
        ...req.body,
        profileId: profile.id,
      });
      
      const connection = await storage.createConnection(validatedData);
      res.status(201).json(connection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating connection:", error);
        res.status(500).json({ message: "Failed to create connection" });
      }
    }
  });

  app.patch("/api/profile/connections/:id", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = insertPlatformConnectionSchema.partial().parse(req.body);
      
      const updated = await storage.updateConnection(id, validatedData);
      if (!updated) {
        res.status(404).json({ message: "Connection not found" });
        return;
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error updating connection:", error);
        res.status(500).json({ message: "Failed to update connection" });
      }
    }
  });

  app.delete("/api/profile/connections/:id", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteConnection(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting connection:", error);
      res.status(500).json({ message: "Failed to delete connection" });
    }
  });

  // RATE CARD ROUTES
  app.get("/api/rate-cards", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const rateCards = await storage.getRateCardsByProfile(profile.id);
      res.json(rateCards);
    } catch (error) {
      console.error("Error fetching rate cards:", error);
      res.status(500).json({ message: "Failed to fetch rate cards" });
    }
  });

  app.post("/api/rate-cards", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      
      const validatedData = insertRateCardSchema.parse({
        ...req.body,
        profileId: profile.id,
      });
      
      const rateCard = await storage.createRateCard(validatedData);
      res.status(201).json(rateCard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating rate card:", error);
        res.status(500).json({ message: "Failed to create rate card" });
      }
    }
  });

  app.patch("/api/rate-cards/:id", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = insertRateCardSchema.partial().parse(req.body);
      
      const updated = await storage.updateRateCard(id, validatedData);
      if (!updated) {
        res.status(404).json({ message: "Rate card not found" });
        return;
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error updating rate card:", error);
        res.status(500).json({ message: "Failed to update rate card" });
      }
    }
  });

  app.delete("/api/rate-cards/:id", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteRateCard(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting rate card:", error);
      res.status(500).json({ message: "Failed to delete rate card" });
    }
  });

  // GROUP ROUTES
  app.get("/api/groups", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const groups = await storage.getAllGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/my", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const groups = await storage.getGroupsByProfile(profile.id);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      res.status(500).json({ message: "Failed to fetch user groups" });
    }
  });

  app.post("/api/groups/:groupId/join", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const { groupId } = req.params;
      
      const validatedData = insertGroupMembershipSchema.parse({
        groupId,
        profileId: profile.id,
      });
      
      const membership = await storage.joinGroup(validatedData);
      res.status(201).json(membership);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error joining group:", error);
        res.status(500).json({ message: "Failed to join group" });
      }
    }
  });

  app.delete("/api/groups/:groupId/leave", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const { groupId } = req.params;
      
      await storage.leaveGroup(profile.id, groupId);
      res.status(204).send();
    } catch (error) {
      console.error("Error leaving group:", error);
      res.status(500).json({ message: "Failed to leave group" });
    }
  });

  // POST ROUTES
  app.get("/api/posts", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { groupId } = req.query;
      const posts = await storage.getPosts(groupId as string | undefined);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      
      const validatedData = insertCommunityPostSchema.parse({
        ...req.body,
        profileId: profile.id,
      });
      
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Failed to create post" });
      }
    }
  });

  app.post("/api/posts/:id/like", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const { id } = req.params;
      
      const validatedData = insertPostLikeSchema.parse({
        postId: id,
        profileId: profile.id,
      });
      
      await storage.likePost(validatedData);
      res.status(201).json({ message: "Post liked" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error liking post:", error);
        res.status(500).json({ message: "Failed to like post" });
      }
    }
  });

  app.delete("/api/posts/:id/like", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const { id } = req.params;
      
      await storage.unlikePost(profile.id, id);
      res.status(204).send();
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  app.get("/api/posts/:id/comments", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const comments = await storage.getCommentsByPost(id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:id/comments", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const { id } = req.params;
      
      const validatedData = insertPostCommentSchema.parse({
        ...req.body,
        postId: id,
        profileId: profile.id,
      });
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Failed to create comment" });
      }
    }
  });

  // JOB ROUTES
  app.get("/api/jobs", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { niche, type, status } = req.query;
      const filters: any = {};
      if (niche) filters.niche = niche as string;
      if (type) filters.type = type as string;
      if (status) filters.status = status as string;
      
      const jobs = await storage.getJobs(filters);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs/:id/apply", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const { id } = req.params;
      
      const validatedData = insertJobApplicationSchema.parse({
        ...req.body,
        jobId: id,
        profileId: profile.id,
      });
      
      const application = await storage.applyToJob(validatedData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error applying to job:", error);
        res.status(500).json({ message: "Failed to apply to job" });
      }
    }
  });

  app.get("/api/jobs/applications", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const applications = await storage.getApplicationsByProfile(profile.id);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // JOB VOTING ROUTES
  app.post("/api/jobs/:id/vote", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const { id } = req.params;
      
      const validatedData = insertJobVoteSchema.parse({
        ...req.body,
        jobId: id,
        profileId: profile.id,
      });
      
      const vote = await storage.voteOnJob(validatedData);
      res.status(201).json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error voting on job:", error);
        res.status(500).json({ message: "Failed to vote on job" });
      }
    }
  });

  app.get("/api/jobs/:id/votes", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const { id } = req.params;
      
      const votes = await storage.getJobVotes(id);
      const userVote = await storage.getUserJobVote(profile.id, id);
      
      res.json({ ...votes, userVote });
    } catch (error) {
      console.error("Error fetching job votes:", error);
      res.status(500).json({ message: "Failed to fetch job votes" });
    }
  });

  app.delete("/api/jobs/:id/vote", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const { id } = req.params;
      
      await storage.deleteJobVote(profile.id, id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job vote:", error);
      res.status(500).json({ message: "Failed to delete job vote" });
    }
  });

  // PRICING BENCHMARKS ROUTE
  app.get("/api/pricing/benchmarks", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { niche, platform, deliverable } = req.query;
      
      if (!niche || !platform || !deliverable) {
        res.status(400).json({ message: "Missing required query parameters: niche, platform, deliverable" });
        return;
      }
      
      const benchmarks = await storage.getBenchmarks({
        niche: niche as string,
        platform: platform as string,
        deliverable: deliverable as string,
      });
      
      res.json(benchmarks);
    } catch (error) {
      console.error("Error fetching benchmarks:", error);
      res.status(500).json({ message: "Failed to fetch benchmarks" });
    }
  });

  // RATE CHECKER ROUTE
  app.get("/api/pricing/check", async (req, res: Response) => {
    try {
      const { niche, platform, deliverable, followers, currentRate } = req.query;
      
      if (!niche || !platform || !deliverable || !followers || !currentRate) {
        res.status(400).json({ message: "Missing required parameters: niche, platform, deliverable, followers, currentRate" });
        return;
      }
      
      const followerCount = parseInt(followers as string, 10);
      const userRate = parseFloat(currentRate as string);
      
      // Validate numeric inputs
      if (isNaN(followerCount) || isNaN(userRate) || followerCount < 0 || userRate < 0) {
        res.status(400).json({ message: "followers and currentRate must be valid positive numbers" });
        return;
      }
      
      const benchmark = await storage.getBenchmarkForFollowers({
        niche: niche as string,
        platform: platform as string,
        deliverable: deliverable as string,
        followers: followerCount,
      });
      
      let avgPrice = 250;
      let minPrice = 100;
      let maxPrice = 500;
      let followerRange = "1K-10K";
      
      if (benchmark) {
        avgPrice = parseFloat(benchmark.avgPrice || "250");
        minPrice = parseFloat(benchmark.minPrice || "100");
        maxPrice = parseFloat(benchmark.maxPrice || "500");
        followerRange = benchmark.followerRange;
      } else {
        if (followerCount < 10000) {
          avgPrice = 150; minPrice = 50; maxPrice = 300; followerRange = "1K-10K";
        } else if (followerCount < 50000) {
          avgPrice = 350; minPrice = 150; maxPrice = 600; followerRange = "10K-50K";
        } else if (followerCount < 100000) {
          avgPrice = 600; minPrice = 300; maxPrice = 1000; followerRange = "50K-100K";
        } else if (followerCount < 500000) {
          avgPrice = 1500; minPrice = 750; maxPrice = 2500; followerRange = "100K-500K";
        } else {
          avgPrice = 5000; minPrice = 2000; maxPrice = 10000; followerRange = "500K+";
        }
      }
      
      const rateRatio = userRate / avgPrice;
      
      let tier: "beginner" | "intermediate" | "pro";
      let tierMessage: string;
      
      if (rateRatio < 0.75) {
        tier = "beginner";
        tierMessage = "You're underpricing yourself. Time to level up.";
      } else if (rateRatio <= 1.1) {
        tier = "intermediate";
        tierMessage = "You're in the ballpark. Room to grow.";
      } else {
        tier = "pro";
        tierMessage = "You're pricing like a pro. Keep it up.";
      }
      
      const minimumFloor = Math.round(minPrice * 0.9);
      const suggestedMin = Math.round(avgPrice * 0.85);
      const suggestedMax = Math.round(avgPrice * 1.25);
      
      const tips: string[] = [];
      if (userRate < minimumFloor) {
        tips.push(`Your rate is below the industry minimum. Never charge less than $${minimumFloor}.`);
      }
      if (rateRatio < 0.75) {
        tips.push("Add usage rights fees (+20-50%) when brands want to repurpose your content.");
        tips.push("Charge extra for exclusivity - you're losing other deals.");
        tips.push("Whitelisting/paid ads rights should be billed separately ($100-500+ extra).");
      } else if (rateRatio < 1.0) {
        tips.push("Consider adding a rush fee for tight turnarounds (+25-50%).");
        tips.push("Bundle deals (3+ posts) should get a slight discount, but increase your per-post rate first.");
      }
      
      res.json({
        tier,
        tierMessage,
        userRate,
        avgPrice,
        minPrice,
        maxPrice,
        minimumFloor,
        suggestedRange: { min: suggestedMin, max: suggestedMax },
        followerRange,
        rateRatio: Math.round(rateRatio * 100),
        tips,
      });
    } catch (error) {
      console.error("Error checking rate:", error);
      res.status(500).json({ message: "Failed to check rate" });
    }
  });

  // CONTENT QUEUE ROUTES
  app.get("/api/content-queue", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const queue = await storage.getQueueByProfile(profile.id);
      res.json(queue);
    } catch (error) {
      console.error("Error fetching content queue:", error);
      res.status(500).json({ message: "Failed to fetch content queue" });
    }
  });

  app.post("/api/content-queue", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      
      const validatedData = insertContentQueueSchema.parse({
        ...req.body,
        profileId: profile.id,
      });
      
      const queueItem = await storage.createQueueItem(validatedData);
      res.status(201).json(queueItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating queue item:", error);
        res.status(500).json({ message: "Failed to create queue item" });
      }
    }
  });

  // DEAL ANALYSIS ROUTES
  app.post("/api/deals/analyze", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      
      const { text, type } = req.body;
      
      if (!text || !type) {
        res.status(400).json({ message: "Missing required fields: text and type" });
        return;
      }
      
      const analysisResult = await analyzeDeal(text, type);
      
      const savedAnalysis = await storage.createDealAnalysis({
        profileId: profile.id,
        originalText: text,
        analysisType: type,
        summary: analysisResult.summary,
        redFlags: analysisResult.redFlags,
        missingTerms: analysisResult.missingTerms,
        suggestedCounter: analysisResult.suggestedCounter,
        estimatedValue: analysisResult.estimatedValue,
      });
      
      res.status(201).json(savedAnalysis);
    } catch (error) {
      console.error("Error analyzing deal:", error);
      res.status(500).json({ message: "Failed to analyze deal" });
    }
  });

  // PITCH PACKAGE — Image upload + personalized response generator
  app.post("/api/deals/pitch-package", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);

      const { imageBase64, textContent } = req.body;

      if (!imageBase64 && !textContent) {
        res.status(400).json({ message: "Either imageBase64 or textContent is required" });
        return;
      }

      // Extract text from image if provided
      let brandText = textContent || "";
      if (imageBase64) {
        brandText = await extractTextFromImage(imageBase64);
      }

      if (!brandText.trim()) {
        res.status(400).json({ message: "Could not extract text from image" });
        return;
      }

      // Pull creator's platform connections and rates for context
      const connections = await storage.getConnectionsByProfile(profile.id);
      const rateCardList = await storage.getRateCardsByProfile(profile.id);

      // Build rates context from rate cards
      const rates: Array<{ platform: string; deliverable: string; price: string }> = [];
      for (const card of rateCardList) {
        const rateItems = card.rates as Array<{ deliverable: string; price: string; platform?: string }>;
        if (Array.isArray(rateItems)) {
          for (const item of rateItems) {
            rates.push({
              platform: item.platform || "General",
              deliverable: item.deliverable || "",
              price: item.price || "",
            });
          }
        }
      }

      // Also pull from media kit data (manual entries from builder)
      const mediaKitData = profile.mediaKitData as any;
      const mediaKitSocials: Array<{ platform: string; handle: string; followerCount?: number | null; engagementRate?: string | null }> = [];
      const mediaKitRates: Array<{ platform: string; deliverable: string; price: string }> = [];

      if (mediaKitData) {
        // Pull socials from media kit
        if (Array.isArray(mediaKitData.socials)) {
          for (const s of mediaKitData.socials) {
            if (s.platform && s.handle) {
              mediaKitSocials.push({
                platform: s.platform,
                handle: s.handle,
                followerCount: s.followers ? parseInt(String(s.followers).replace(/[^0-9]/g, "")) || null : null,
                engagementRate: null,
              });
            }
          }
        }
        // Pull rates from media kit
        if (Array.isArray(mediaKitData.rates)) {
          for (const r of mediaKitData.rates) {
            if (r.service && r.price) {
              mediaKitRates.push({ platform: "General", deliverable: r.service, price: r.price });
            }
          }
        }
      }

      // Merge: platform connections (OAuth) take priority, fill in with media kit data
      const platformsList = connections.length > 0
        ? connections.map(c => ({
            platform: c.platform,
            handle: c.handle,
            followerCount: c.followerCount,
            engagementRate: c.engagementRate ? String(c.engagementRate) : null,
          }))
        : mediaKitSocials;

      const ratesList = rates.length > 0 ? rates : mediaKitRates;

      const creatorContext = {
        displayName: profile.displayName || (mediaKitData?.fullName) || undefined,
        bio: profile.bio || mediaKitData?.bio || undefined,
        niche: profile.niche || mediaKitData?.niche || undefined,
        website: profile.website || mediaKitData?.website || undefined,
        platforms: platformsList,
        rates: ratesList,
      };

      const pitchPackage = await generatePitchPackage(brandText, creatorContext);

      res.json({ ...pitchPackage, extractedText: brandText });
    } catch (error) {
      console.error("Error generating pitch package:", error);
      res.status(500).json({ message: "Failed to generate pitch package" });
    }
  });

  app.get("/api/deals/history", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const analyses = await storage.getDealAnalysesByProfile(profile.id);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching deal history:", error);
      res.status(500).json({ message: "Failed to fetch deal history" });
    }
  });

  // MEDIA KIT TRACKING ROUTES
  app.post("/api/media-kit/track", async (req: Request, res: Response) => {
    try {
      const { profileId, pagesViewed, timeSpentSeconds, clickedContact, downloadedPdf } = req.body;
      
      if (!profileId) {
        res.status(400).json({ message: "profileId is required" });
        return;
      }
      
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const ipString = Array.isArray(ip) ? ip[0] : ip;
      const hashedIp = createHash('sha256').update(ipString).digest('hex').substring(0, 16);
      
      const referrer = req.headers.referer || req.headers.referrer || null;
      const userAgent = req.headers['user-agent'] || null;
      
      const view = await storage.trackMediaKitView({
        profileId,
        viewerIp: hashedIp,
        referrer: referrer as string | null,
        userAgent: userAgent as string | null,
        pagesViewed: pagesViewed || [],
        timeSpentSeconds: timeSpentSeconds || 0,
        clickedContact: clickedContact || false,
        downloadedPdf: downloadedPdf || false,
      });
      
      res.status(201).json({ success: true, viewId: view.id });
    } catch (error) {
      console.error("Error tracking media kit view:", error);
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  app.get("/api/media-kit/analytics", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const analytics = await storage.getMediaKitAnalytics(profile.id);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching media kit analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // ANONYMOUS RATE SHARING ROUTES
  app.post("/api/rates/anonymous", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAnonymousRateSchema.parse(req.body);
      const rate = await storage.submitAnonymousRate(validatedData);
      res.status(201).json(rate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error submitting anonymous rate:", error);
        res.status(500).json({ message: "Failed to submit rate" });
      }
    }
  });

  app.get("/api/rates/anonymous/stats", async (req: Request, res: Response) => {
    try {
      const { niche, platform } = req.query;
      
      if (!niche || !platform) {
        res.status(400).json({ message: "Missing required query parameters: niche, platform" });
        return;
      }
      
      const stats = await storage.getAnonymousRates(niche as string, platform as string);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching anonymous rate stats:", error);
      res.status(500).json({ message: "Failed to fetch rate stats" });
    }
  });

  // DEAL VOTING ROUTES
  app.post("/api/posts/:id/deal-vote", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const { id } = req.params;
      
      const validatedData = insertDealVoteSchema.parse({
        ...req.body,
        postId: id,
        profileId: profile.id,
      });
      
      const vote = await storage.voteDeal(validatedData);
      res.status(201).json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error voting on deal:", error);
        res.status(500).json({ message: "Failed to vote on deal" });
      }
    }
  });

  app.get("/api/posts/:id/deal-votes", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const votes = await storage.getDealVotes(id);
      res.json(votes);
    } catch (error) {
      console.error("Error fetching deal votes:", error);
      res.status(500).json({ message: "Failed to fetch deal votes" });
    }
  });

  // MESSAGING ROUTES
  app.get("/api/messages/unread", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const count = await storage.getTotalUnreadCount(profile.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.get("/api/messages", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const convs = await storage.getConversationsForProfile(profile.id);
      res.json(convs);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/messages/conversation", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const myProfile = await getOrCreateProfile(userId);
      const { profileId } = req.body;
      if (!profileId) {
        res.status(400).json({ message: "profileId required" });
        return;
      }
      const conv = await storage.getOrCreateConversation(myProfile.id, profileId);
      const other = conv.profileIdA === myProfile.id ? conv.profileIdB : conv.profileIdA;
      const otherProfile = await storage.getProfileById(other);
      const unreadCount = conv.profileIdA === myProfile.id ? (conv.unreadCountA ?? 0) : (conv.unreadCountB ?? 0);
      res.json({ ...conv, otherProfile: otherProfile || { id: other, displayName: "Unknown" }, unreadCount });
    } catch (error) {
      console.error("Error starting conversation:", error);
      res.status(500).json({ message: "Failed to start conversation" });
    }
  });

  app.get("/api/messages/:conversationId", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getMessagesForConversation(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const { conversationId, content, messageType, offerData } = req.body;
      if (!conversationId || !content) {
        res.status(400).json({ message: "conversationId and content are required" });
        return;
      }
      const message = await storage.sendMessage({
        conversationId,
        senderProfileId: profile.id,
        content: String(content),
        messageType: messageType || "text",
        offerData: offerData || null,
      });
      res.status(201).json({ ...message, senderProfile: profile });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.patch("/api/messages/:conversationId/read", isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await getOrCreateProfile(userId);
      const { conversationId } = req.params;
      await storage.markConversationRead(conversationId, profile.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  return httpServer;
}
