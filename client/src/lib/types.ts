import { z } from "zod";

export const socialSchema = z.object({
  platform: z.enum(["Instagram", "TikTok", "YouTube", "Twitter", "LinkedIn", "Newsletter", "Blog"]),
  handle: z.string().min(1, "Handle is required"),
  followers: z.string().min(1, "Follower count is required"),
  link: z.string().optional(),
});

export const rateSchema = z.object({
  service: z.string().min(1, "Service name is required"),
  price: z.string().min(1, "Price is required"),
  description: z.string().optional(),
});

export const mediaKitSchema = z.object({
  // Profile
  fullName: z.string().min(1, "Name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  bio: z.string().min(10, "Bio should be at least 10 characters"),
  email: z.string().email("Invalid email"),
  website: z.string().optional(),
  location: z.string().optional(),
  
  // Niche
  niche: z.string().min(1, "Niche is required"),
  
  // Socials
  socials: z.array(socialSchema).default([]),
  
  // Audience
  audienceGender: z.string().optional(), // e.g., "60% Female"
  audienceAgeRange: z.string().optional(), // e.g., "18-34"
  topLocations: z.string().optional(), // e.g., "USA, UK, Canada"
  
  // Rates
  rates: z.array(rateSchema).default([]),
  
  // Portfolio/Testimonials (Simplified for text inputs for now)
  previousBrands: z.string().optional(), // Comma separated for now
});

export type MediaKit = z.infer<typeof mediaKitSchema>;

export const defaultMediaKit: MediaKit = {
  fullName: "",
  tagline: "",
  bio: "",
  email: "",
  niche: "",
  socials: [{ platform: "Instagram", handle: "", followers: "" }],
  rates: [{ service: "Instagram Post", price: "$500" }],
  previousBrands: "",
};
