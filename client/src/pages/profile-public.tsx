import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Cat, ExternalLink, Mail, Instagram, Youtube, Globe, Star, DollarSign, Heart } from "lucide-react";
import { Link } from "wouter";

interface PublicProfileData {
  profile: {
    id: string;
    displayName: string;
    tagline?: string;
    bio?: string;
    niche?: string;
    location?: string;
    website?: string;
    profileImageUrl?: string;
    accountType: string;
    socialLinks?: Array<{ platform: string; url?: string; handle: string; followerCount?: string }>;
    mediaKitData?: any;
  };
  connections: Array<{
    platform: string;
    handle: string;
    followerCount?: number | null;
    engagementRate?: string | null;
  }>;
  rateCards: Array<{
    name: string;
    rates: Array<{ deliverable: string; price: string; platform?: string }>;
  }>;
}

const platformColors: Record<string, string> = {
  instagram: "bg-gradient-to-br from-purple-500 to-pink-500",
  tiktok: "bg-black",
  youtube: "bg-red-600",
  twitter: "bg-sky-500",
  linkedin: "bg-blue-600",
  newsletter: "bg-accent",
  blog: "bg-slate-600",
};

const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "Twitter/X",
  linkedin: "LinkedIn",
  newsletter: "Newsletter",
  blog: "Blog",
};

function formatFollowers(count?: number | null): string {
  if (!count) return "";
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

async function fetchPublicProfile(username: string): Promise<PublicProfileData> {
  const res = await fetch(`/api/profile/public/${username}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Profile not found");
    throw new Error("Failed to load profile");
  }
  return res.json();
}

export default function ProfilePublic() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/profile/public/${username}`],
    queryFn: () => fetchPublicProfile(username!),
    enabled: !!username,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">😿</div>
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p className="text-muted-foreground">This creator profile doesn't exist or isn't public.</p>
          <Link href="/">
            <Button className="rounded-full bg-accent hover:bg-accent/90 text-white">
              Go to UGCC
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { profile, connections, rateCards } = data;
  const mediaKit = profile.mediaKitData as any;
  
  // Merge connections (OAuth) with mediaKit socials and socialLinks
  const allSocials: Array<{ platform: string; handle: string; followerCount?: number | null; url?: string }> = [];
  
  // OAuth connections first
  for (const c of connections) {
    allSocials.push({ platform: c.platform, handle: c.handle, followerCount: c.followerCount });
  }
  // Media kit socials (if not already included)
  if (mediaKit?.socials) {
    for (const s of mediaKit.socials) {
      if (!allSocials.find(a => a.handle === s.handle)) {
        allSocials.push({ 
          platform: s.platform?.toLowerCase() || "blog", 
          handle: s.handle,
          followerCount: s.followers ? parseInt(String(s.followers).replace(/[^0-9]/g, "")) || null : null,
          url: s.link,
        });
      }
    }
  }
  // Manual social links
  if (profile.socialLinks) {
    const links = profile.socialLinks as Array<{ platform: string; url?: string; handle: string; followerCount?: string }>;
    for (const s of links) {
      if (!allSocials.find(a => a.handle === s.handle)) {
        allSocials.push({
          platform: s.platform?.toLowerCase() || "blog",
          handle: s.handle,
          followerCount: s.followerCount ? parseInt(String(s.followerCount).replace(/[^0-9]/g, "")) || null : null,
          url: s.url,
        });
      }
    }
  }

  // Rate highlights
  const allRates: Array<{ deliverable: string; price: string }> = [];
  for (const rc of rateCards) {
    const items = rc.rates as Array<{ deliverable: string; price: string }>;
    if (Array.isArray(items)) allRates.push(...items.slice(0, 3));
  }
  if (mediaKit?.rates) {
    for (const r of mediaKit.rates) {
      if (r.service && r.price && !allRates.find(a => a.deliverable === r.service)) {
        allRates.push({ deliverable: r.service, price: r.price });
      }
    }
  }

  const previousBrands = mediaKit?.previousBrands
    ? String(mediaKit.previousBrands).split(",").map((b: string) => b.trim()).filter(Boolean)
    : [];

  const contactEmail = mediaKit?.email;
  const websiteUrl = profile.website || mediaKit?.website;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-md mx-auto px-4 py-10 space-y-4">
        
        {/* Profile Header */}
        <div className="text-center space-y-3 pb-2">
          <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 border-4 border-accent/20 flex items-center justify-center overflow-hidden">
            {profile.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              <Cat className="h-10 w-10 text-accent" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">{profile.displayName}</h1>
            {profile.tagline && <p className="text-sm text-muted-foreground mt-0.5">{profile.tagline}</p>}
          </div>
          {profile.niche && (
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              {profile.niche}
            </Badge>
          )}
          {profile.bio && (
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* Social Platforms */}
        {allSocials.length > 0 && (
          <div className="space-y-2">
            {allSocials.map((social, i) => {
              const colorClass = platformColors[social.platform] || "bg-muted";
              const label = platformLabels[social.platform] || social.platform;
              const followerText = formatFollowers(social.followerCount);
              const href = social.url || 
                (social.platform === "instagram" ? `https://instagram.com/${social.handle}` :
                 social.platform === "tiktok" ? `https://tiktok.com/@${social.handle}` :
                 social.platform === "youtube" ? `https://youtube.com/@${social.handle}` :
                 social.platform === "twitter" ? `https://twitter.com/${social.handle}` :
                 null);

              const card = (
                <div className={`flex items-center justify-between p-4 rounded-2xl text-white ${colorClass} hover:opacity-90 transition-opacity cursor-pointer`} data-testid={`social-link-${social.platform}`}>
                  <div>
                    <div className="font-semibold text-sm">{label}</div>
                    <div className="text-white/80 text-xs">@{social.handle}</div>
                  </div>
                  <div className="text-right">
                    {followerText && <div className="font-bold text-base">{followerText}</div>}
                    <ExternalLink size={14} className="opacity-70 ml-auto" />
                  </div>
                </div>
              );

              return href ? (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer">{card}</a>
              ) : (
                <div key={i}>{card}</div>
              );
            })}
          </div>
        )}

        {/* Website */}
        {websiteUrl && (
          <a
            href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl border-2 border-accent/30 bg-white hover:border-accent hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-accent" />
              <span className="font-medium text-sm">{websiteUrl.replace(/^https?:\/\//, "")}</span>
            </div>
            <ExternalLink size={14} className="text-muted-foreground" />
          </a>
        )}

        {/* Rate Card Highlights */}
        {allRates.length > 0 && (
          <div className="p-5 rounded-2xl bg-white border">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={16} className="text-accent" />
              <span className="font-semibold text-sm">Rate Card</span>
            </div>
            <div className="space-y-2">
              {allRates.slice(0, 4).map((rate, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{rate.deliverable}</span>
                  <span className="font-bold text-accent">{rate.price}</span>
                </div>
              ))}
            </div>
            {contactEmail && (
              <a href={`mailto:${contactEmail}?subject=Collaboration Inquiry`} className="block mt-4">
                <Button size="sm" className="w-full rounded-xl bg-accent hover:bg-accent/90 text-white text-xs">
                  <Mail size={13} className="mr-1.5" /> Request Full Rate Card
                </Button>
              </a>
            )}
          </div>
        )}

        {/* Previous Brands */}
        {previousBrands.length > 0 && (
          <div className="p-5 rounded-2xl bg-white border">
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-accent" />
              <span className="font-semibold text-sm">Previous Brand Partners</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {previousBrands.map((brand: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">{brand}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {contactEmail && (
          <a href={`mailto:${contactEmail}?subject=Collaboration Inquiry — Found you on UGCC`}>
            <div className="p-4 rounded-2xl bg-accent text-white text-center font-semibold hover:bg-accent/90 transition-colors cursor-pointer">
              <Mail size={16} className="inline mr-2" />
              Contact for Collaborations
            </div>
          </a>
        )}

        {/* UGCC Footer */}
        <div className="text-center pt-4 pb-2">
          <Link href="/">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors">
              <Cat size={13} />
              Built with <span className="font-bold text-accent">UGCC</span> — The Cat Creator Network
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
