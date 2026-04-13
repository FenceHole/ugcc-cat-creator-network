import { db } from "./db";
import { nicheGroups, pricingBenchmarks, jobs } from "@shared/schema";

export async function seedInitialData() {
  try {
    const existingGroups = await db.select().from(nicheGroups);
    if (existingGroups.length > 0) {
      // Check if the data is already UGCC cat-specific by slug
      const slugs = existingGroups.map(g => g.slug);
      if (slugs.includes("beginners-circle")) {
        console.log("UGCC data already seeded, skipping...");
        return;
      }
      // Clear old generic data and re-seed with cat-specific data
      console.log("Clearing old generic seed data, re-seeding with UGCC cat data...");
      await db.delete(jobs);
      await db.delete(pricingBenchmarks);
      await db.delete(nicheGroups);
    }

    console.log("Seeding initial UGCC data...");

    // Cat Creator Community Groups
    const groupsData = [
      {
        name: "Beginners Circle",
        slug: "beginners-circle",
        description: "New to cat content creation? Start here. Ask anything — no question is too small. This is a judgment-free zone for creators just getting started.",
        imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800",
      },
      {
        name: "Brand Deals & Negotiation",
        slug: "brand-deals",
        description: "Share brand offers, get community feedback, and learn to negotiate. Post deals anonymously for the community to vote — Take It, Pass, or Negotiate.",
        imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
      },
      {
        name: "TikTok & Reels Creators",
        slug: "tiktok-reels",
        description: "Short-form cat video strategy — hooks, trending sounds, watch time, and what's working right now on TikTok and Instagram Reels.",
        imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800",
      },
      {
        name: "Rescue & Advocacy",
        slug: "rescue-advocacy",
        description: "For creators using their platforms for shelter support, TNR advocacy, foster journeys, and raising awareness for cats in need.",
        imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
      },
      {
        name: "Pro Cat Creators",
        slug: "pro-creators",
        description: "For established cat content creators who want to mentor, teach, collaborate, and share what's working at the professional level. Each one teach one.",
        imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=800",
      },
      {
        name: "Cat Breed Creators",
        slug: "cat-breeds",
        description: "Breed-specific cat content — Maine Coons, Siamese, Persians, Scottish Folds, and everything in between. Connect with creators who share your breed niche.",
        imageUrl: "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800",
      },
      {
        name: "UGC & Content Creation",
        slug: "ugc-content",
        description: "Everything about creating branded cat content — UGC deliverables, creative briefs, usage rights, and how to produce professional-quality content at home.",
        imageUrl: "https://images.unsplash.com/photo-1561948955-570b270e7c36?w=800",
      },
      {
        name: "Brand Hub & Campaigns",
        slug: "brand-hub",
        description: "Brands post their active campaigns here. Creators connect directly. No agency, no gatekeeping — just real opportunities for cat content creators.",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
      },
    ];

    await db.insert(nicheGroups).values(groupsData);

    // Cat Content Creator Pricing Benchmarks
    const benchmarksData = [
      // Instagram — Cat Content
      { niche: "Cat Content", platform: "Instagram", deliverable: "Feed Post", followerRange: "1K-10K", avgPrice: "100", minPrice: "50", maxPrice: "200" },
      { niche: "Cat Content", platform: "Instagram", deliverable: "Story", followerRange: "1K-10K", avgPrice: "50", minPrice: "25", maxPrice: "100" },
      { niche: "Cat Content", platform: "Instagram", deliverable: "Reel", followerRange: "1K-10K", avgPrice: "150", minPrice: "75", maxPrice: "300" },

      { niche: "Cat Content", platform: "Instagram", deliverable: "Feed Post", followerRange: "10K-50K", avgPrice: "400", minPrice: "200", maxPrice: "700" },
      { niche: "Cat Content", platform: "Instagram", deliverable: "Story", followerRange: "10K-50K", avgPrice: "150", minPrice: "75", maxPrice: "300" },
      { niche: "Cat Content", platform: "Instagram", deliverable: "Reel", followerRange: "10K-50K", avgPrice: "600", minPrice: "300", maxPrice: "1000" },
      { niche: "Cat Content", platform: "Instagram", deliverable: "Full Package (Post+Story+Reel)", followerRange: "10K-50K", avgPrice: "900", minPrice: "500", maxPrice: "1500" },

      { niche: "Cat Content", platform: "Instagram", deliverable: "Feed Post", followerRange: "50K-100K", avgPrice: "900", minPrice: "600", maxPrice: "1500" },
      { niche: "Cat Content", platform: "Instagram", deliverable: "Reel", followerRange: "50K-100K", avgPrice: "1200", minPrice: "800", maxPrice: "2000" },
      { niche: "Cat Content", platform: "Instagram", deliverable: "Full Package (Post+Story+Reel)", followerRange: "50K-100K", avgPrice: "2000", minPrice: "1500", maxPrice: "3000" },

      { niche: "Cat Content", platform: "Instagram", deliverable: "Feed Post", followerRange: "100K-500K", avgPrice: "2500", minPrice: "1500", maxPrice: "4000" },
      { niche: "Cat Content", platform: "Instagram", deliverable: "Reel", followerRange: "100K-500K", avgPrice: "3500", minPrice: "2000", maxPrice: "6000" },

      // TikTok — Cat Content
      { niche: "Cat Content", platform: "TikTok", deliverable: "Video", followerRange: "1K-10K", avgPrice: "75", minPrice: "30", maxPrice: "150" },
      { niche: "Cat Content", platform: "TikTok", deliverable: "Video", followerRange: "10K-50K", avgPrice: "300", minPrice: "150", maxPrice: "600" },
      { niche: "Cat Content", platform: "TikTok", deliverable: "Video", followerRange: "50K-100K", avgPrice: "800", minPrice: "500", maxPrice: "1500" },
      { niche: "Cat Content", platform: "TikTok", deliverable: "Video", followerRange: "100K-500K", avgPrice: "2000", minPrice: "1000", maxPrice: "4000" },
      { niche: "Cat Content", platform: "TikTok", deliverable: "Video", followerRange: "500K-1M", avgPrice: "5000", minPrice: "3000", maxPrice: "10000" },
      { niche: "Cat Content", platform: "TikTok", deliverable: "Live Integration", followerRange: "10K-50K", avgPrice: "200", minPrice: "100", maxPrice: "400" },
      { niche: "Cat Content", platform: "TikTok", deliverable: "Duet/Stitch", followerRange: "10K-50K", avgPrice: "200", minPrice: "100", maxPrice: "400" },

      // YouTube — Cat Content
      { niche: "Cat Content", platform: "YouTube", deliverable: "Dedicated Video", followerRange: "10K-50K", avgPrice: "500", minPrice: "300", maxPrice: "1000" },
      { niche: "Cat Content", platform: "YouTube", deliverable: "Integration (30–60s)", followerRange: "10K-50K", avgPrice: "300", minPrice: "150", maxPrice: "600" },
      { niche: "Cat Content", platform: "YouTube", deliverable: "YouTube Short", followerRange: "10K-50K", avgPrice: "150", minPrice: "75", maxPrice: "300" },
      { niche: "Cat Content", platform: "YouTube", deliverable: "Dedicated Video", followerRange: "50K-100K", avgPrice: "1200", minPrice: "800", maxPrice: "2500" },
      { niche: "Cat Content", platform: "YouTube", deliverable: "Dedicated Video", followerRange: "100K-500K", avgPrice: "3000", minPrice: "2000", maxPrice: "6000" },

      // UGC (No posting required — just content creation)
      { niche: "Cat UGC", platform: "UGC (No Posting)", deliverable: "Photo Set (5 images)", followerRange: "Any", avgPrice: "150", minPrice: "75", maxPrice: "300" },
      { niche: "Cat UGC", platform: "UGC (No Posting)", deliverable: "Video (15–30s)", followerRange: "Any", avgPrice: "200", minPrice: "100", maxPrice: "400" },
      { niche: "Cat UGC", platform: "UGC (No Posting)", deliverable: "Video Bundle (3 videos)", followerRange: "Any", avgPrice: "500", minPrice: "300", maxPrice: "900" },
      { niche: "Cat UGC", platform: "UGC (No Posting)", deliverable: "Full Content Package", followerRange: "Any", avgPrice: "800", minPrice: "500", maxPrice: "1500" },

      // Rescue & Advocacy Niche
      { niche: "Rescue & Advocacy", platform: "Instagram", deliverable: "Feed Post", followerRange: "10K-50K", avgPrice: "300", minPrice: "150", maxPrice: "500" },
      { niche: "Rescue & Advocacy", platform: "TikTok", deliverable: "Video", followerRange: "10K-50K", avgPrice: "250", minPrice: "125", maxPrice: "500" },
    ];

    await db.insert(pricingBenchmarks).values(benchmarksData);

    // Seed sample cat brand opportunities
    const jobsData = [
      {
        title: "Cat UGC Creator Wanted — Chewy Summer Campaign",
        description: "Chewy is looking for cat content creators to produce authentic unboxing and reaction videos for our summer product launch. We want real cats, real reactions, and genuine excitement. Content will be used on Chewy's social channels with full credit to creator.",
        company: "Chewy",
        type: "ugc" as const,
        status: "open" as const,
        budget: "$300–$700",
        niche: "Cat Content",
        requiredFollowers: 3000,
        platforms: ["TikTok", "Instagram"],
        isVerified: true,
        paymentType: "flat_fee" as const,
        trustScore: 92,
        externalUrl: "https://socialcat.com",
      },
      {
        title: "Meow Mix — Authentic Cat Reaction Content",
        description: "We're looking for cat creators to produce fun, authentic videos of their cats reacting to Meow Mix. Must be genuine — we want real moments, not staged. 3 short videos required (15–30s each). Full creative freedom within brand guidelines.",
        company: "Meow Mix",
        type: "ugc" as const,
        status: "open" as const,
        budget: "$200–$500",
        niche: "Cat Content",
        requiredFollowers: 1000,
        platforms: ["TikTok", "Instagram", "YouTube Shorts"],
        isVerified: true,
        paymentType: "flat_fee" as const,
        trustScore: 88,
        externalUrl: "https://socialcat.com",
      },
      {
        title: "Litter-Robot Brand Partnership — Long Term",
        description: "Litter-Robot is seeking cat lifestyle creators for an ongoing partnership. Content includes setup reveal, week-in-review, and cat reaction content. Preferred creators have an engaged audience interested in cat care and home organization.",
        company: "Litter-Robot",
        type: "brand_deal" as const,
        status: "open" as const,
        budget: "$1,000–$3,000",
        niche: "Cat Content",
        requiredFollowers: 10000,
        platforms: ["YouTube", "Instagram", "TikTok"],
        isVerified: true,
        paymentType: "flat_fee" as const,
        trustScore: 96,
        externalUrl: "https://socialcat.com",
      },
      {
        title: "Rescue Org Feature — TNR Awareness Campaign",
        description: "National TNR organization looking for cat creators and rescue advocates to help raise awareness during National Cat Day. Gifted partnership with opportunity for paid amplification if content performs well. Great for creators focused on advocacy.",
        company: "National TNR Alliance",
        type: "collaboration" as const,
        status: "open" as const,
        budget: "Gifted + Performance Bonus",
        niche: "Rescue & Advocacy",
        requiredFollowers: 2000,
        platforms: ["Instagram", "TikTok", "Facebook"],
        isVerified: false,
        paymentType: "hybrid" as const,
        trustScore: 74,
        externalUrl: "https://reddit.com/r/ugcdeals",
      },
      {
        title: "Royal Canin — Breed-Specific Content Series",
        description: "Royal Canin needs breed-specific cat content creators for a health & nutrition awareness campaign. We're looking for creators with Maine Coons, Persians, Siamese, Ragdolls, or Scottish Folds. Multi-post campaign, paid per deliverable.",
        company: "Royal Canin",
        type: "brand_deal" as const,
        status: "open" as const,
        budget: "$500–$2,000 per creator",
        niche: "Cat Content",
        requiredFollowers: 5000,
        platforms: ["Instagram", "YouTube"],
        isVerified: true,
        paymentType: "flat_fee" as const,
        trustScore: 94,
        externalUrl: "https://socialcat.com",
      },
      {
        title: "PetSmart Casting Call — In-Store Content Day",
        description: "PetSmart is hosting a creator content day at select locations. Cat creators welcome! We'll provide product access, in-store photography rights, and a flat creator fee. Content used for PetSmart's social channels with creator attribution.",
        company: "PetSmart",
        type: "casting_call" as const,
        status: "open" as const,
        budget: "$300 flat fee + product",
        niche: "Cat Content",
        requiredFollowers: 5000,
        platforms: ["Instagram", "TikTok"],
        isVerified: true,
        paymentType: "flat_fee" as const,
        trustScore: 90,
        externalUrl: "https://socialcat.com",
      },
    ];

    await db.insert(jobs).values(jobsData);

    console.log("UGCC seed data complete!");
  } catch (error) {
    console.error("Seed error:", error);
  }
}
