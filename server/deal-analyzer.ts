import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface DealAnalysisResult {
  summary: string;
  redFlags: string[];
  missingTerms: string[];
  suggestedCounter: string;
  estimatedValue: string;
}

export interface PitchPackage {
  brandName: string;
  extractedText: string;
  whatTheyWant: string;
  brandTone: string;
  redFlags: string[];
  missingInfo: string[];
  recommendedRates: string[];
  pitchHighlights: string[];
  generatedReply: string;
  subjectLine: string;
  tips: string[];
}

export interface CreatorContext {
  displayName?: string;
  bio?: string;
  niche?: string;
  website?: string;
  platforms?: Array<{
    platform: string;
    handle: string;
    followerCount?: number | null;
    engagementRate?: string | null;
  }>;
  rates?: Array<{
    platform: string;
    deliverable: string;
    price: string;
  }>;
}

export async function analyzeDeal(
  originalText: string,
  analysisType: string
): Promise<DealAnalysisResult> {
  const typeLabel =
    analysisType === "email"
      ? "brand email"
      : analysisType === "contract"
        ? "contract snippet"
        : "DM";

  const systemPrompt = `You are a blunt, no-BS advisor for content creators analyzing brand deals. You protect creators from getting ripped off.

Your job is to analyze ${typeLabel}s from brands and give creators the unfiltered truth about what they're being offered.

Be direct and conversational - like a friend who happens to be a lawyer and knows the creator economy inside out.

Respond in JSON format with these exact fields:
{
  "summary": "A 2-3 sentence summary of what they're actually asking for. Cut through the marketing speak.",
  "redFlags": ["Array of concerning things", "Low pay relative to deliverables", "Unlimited usage rights", "Exclusivity traps", "Vague payment terms", etc.],
  "missingTerms": ["Array of what's not mentioned but should be", "Usage rights duration", "Exclusivity period", "Payment timeline", "Revision limits", "Content approval process", etc.],
  "suggestedCounter": "A professional but firm counter-offer email template the creator can use or adapt. Include specific asks based on what's missing.",
  "estimatedValue": "Your rough estimate of what this deal is actually worth (or should be worth) based on the deliverables described. Be specific like '$500-$800 for this scope' or 'At least $2,000 given the usage rights they want'."
}`;

  const userPrompt = `Analyze this ${typeLabel} from a brand:

---
${originalText}
---

Give me the breakdown. What are they really asking for, where am I getting screwed, what's missing, and how should I counter?`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  const result = JSON.parse(content) as DealAnalysisResult;
  
  return {
    summary: result.summary || "Unable to analyze",
    redFlags: Array.isArray(result.redFlags) ? result.redFlags : [],
    missingTerms: Array.isArray(result.missingTerms) ? result.missingTerms : [],
    suggestedCounter: result.suggestedCounter || "",
    estimatedValue: result.estimatedValue || "Unable to estimate",
  };
}

export async function extractTextFromImage(base64Image: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "This is a screenshot of a brand email or DM message. Please extract ALL the text from this image exactly as written. Include every word, email address, and detail. Return only the extracted text, nothing else.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: "high",
            },
          },
        ],
      },
    ],
    max_completion_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generatePitchPackage(
  brandMessageText: string,
  creator: CreatorContext
): Promise<PitchPackage> {
  // Build creator context string
  const platformSummary = creator.platforms && creator.platforms.length > 0
    ? creator.platforms.map(p => 
        `${p.platform} (@${p.handle}): ${p.followerCount ? p.followerCount.toLocaleString() + " followers" : "followers N/A"}${p.engagementRate ? ", " + p.engagementRate + "% engagement" : ""}`
      ).join("\n")
    : "No platforms connected yet";

  const ratesSummary = creator.rates && creator.rates.length > 0
    ? creator.rates.map(r => `${r.platform} ${r.deliverable}: ${r.price}`).join("\n")
    : "No rates set yet";

  const systemPrompt = `You are an expert creator coach and brand partnership specialist for the UGCC (User Generated Cat Content) network. You help cat content creators craft winning pitch packages when brands reach out.

Your job is to:
1. Analyze what the brand is asking for
2. Generate a personalized, professional pitch response using the creator's real stats
3. Tell the creator exactly what to highlight and what rates to quote

Always be warm but professional. Cat creators are friendly — but they know their worth.

Respond in JSON format with these exact fields:
{
  "brandName": "The brand name extracted from the message (e.g. 'Halo Pets', 'Chewy', 'Unknown Brand')",
  "extractedText": "The full text from the brand message",
  "whatTheyWant": "1-2 sentences: exactly what this brand is asking for in plain language",
  "brandTone": "Brief description of the brand's tone/vibe (e.g. 'Warm and casual', 'Professional and formal', 'Friendly but vague')",
  "redFlags": ["Any concerns or things to watch for (empty array if none)"],
  "missingInfo": ["What information is missing that you'd need before responding — payment details, deliverable specs, timeline, etc."],
  "recommendedRates": ["Based on creator stats, suggest specific rates. E.g. 'UGC Video (60s): $200-$400', 'Instagram Reel: $X-$Y'"],
  "pitchHighlights": ["3-5 specific stats or facts from the creator's profile to highlight in the pitch, e.g. 'Your 8.2% engagement rate on TikTok', 'Your 15K Instagram followers in the cat niche'"],
  "subjectLine": "A professional email subject line for the reply",
  "generatedReply": "A complete, personalized reply email/DM from the creator to this brand. Use the creator's actual stats. Be warm, professional, and confident. Include a call to action. Sign off with [Your Name]. Leave [RATE CARD ATTACHED] placeholder where appropriate.",
  "tips": ["2-3 specific tips for this particular outreach, e.g. 'Ask for their campaign timeline before agreeing', 'Mention your rescue advocacy angle — it aligns with Halo's values'"]
}`;

  const userPrompt = `A brand just reached out to one of our cat content creators. Generate a complete pitch package for them.

BRAND MESSAGE:
---
${brandMessageText}
---

CREATOR PROFILE:
Name: ${creator.displayName || "Cat Creator"}
Bio: ${creator.bio || "Cat content creator"}
Niche: ${creator.niche || "Cat Content"}
Website: ${creator.website || "Not set"}

SOCIAL PLATFORMS:
${platformSummary}

CURRENT RATES:
${ratesSummary}

Generate a complete pitch package. Make the reply email feel personal, professional, and confident — not templated. Include their actual stats where possible. If stats are missing, use placeholders like [YOUR FOLLOWER COUNT].`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  const result = JSON.parse(content) as PitchPackage;

  return {
    brandName: result.brandName || "Unknown Brand",
    extractedText: brandMessageText,
    whatTheyWant: result.whatTheyWant || "",
    brandTone: result.brandTone || "",
    redFlags: Array.isArray(result.redFlags) ? result.redFlags : [],
    missingInfo: Array.isArray(result.missingInfo) ? result.missingInfo : [],
    recommendedRates: Array.isArray(result.recommendedRates) ? result.recommendedRates : [],
    pitchHighlights: Array.isArray(result.pitchHighlights) ? result.pitchHighlights : [],
    generatedReply: result.generatedReply || "",
    subjectLine: result.subjectLine || "Re: Collaboration Inquiry",
    tips: Array.isArray(result.tips) ? result.tips : [],
  };
}
