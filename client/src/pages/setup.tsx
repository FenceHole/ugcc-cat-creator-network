import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Cat, Store, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

async function saveSetup(data: any) {
  const res = await fetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save");
  return res.json();
}

export default function Setup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<"type" | "creator" | "brand">("type");
  const [accountType, setAccountType] = useState<"creator" | "brand">("creator");

  // Creator fields
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [niche, setNiche] = useState("");
  const [website, setWebsite] = useState("");

  // Brand fields
  const [companyName, setCompanyName] = useState("");
  const [brandBio, setBrandBio] = useState("");
  const [brandCategory, setBrandCategory] = useState("");
  const [brandBudget, setBrandBudget] = useState("");

  const mutation = useMutation({
    mutationFn: saveSetup,
    onSuccess: () => {
      toast({ title: "Welcome to UGCC!", description: "Your profile is set up and ready." });
      navigate(accountType === "creator" ? "/builder" : "/brands");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save your profile.", variant: "destructive" });
    },
  });

  const handleCreatorSubmit = () => {
    if (!displayName.trim()) return;
    mutation.mutate({
      accountType: "creator",
      displayName,
      bio,
      niche,
      website,
      setupComplete: true,
    });
  };

  const handleBrandSubmit = () => {
    if (!companyName.trim()) return;
    mutation.mutate({
      accountType: "brand",
      displayName: companyName,
      companyName,
      bio: brandBio,
      brandCategory,
      brandBudgetRange: brandBudget,
      setupComplete: true,
    });
  };

  if (step === "type") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto">
              <Cat className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-extrabold">Welcome to UGCC</h1>
            <p className="text-muted-foreground">The Cat Creator Network. Let's get you set up — are you a creator or a brand?</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setAccountType("creator"); setStep("creator"); }}
              className="group p-6 rounded-2xl border-2 border-border hover:border-accent bg-white hover:bg-accent/5 transition-all text-left space-y-3"
              data-testid="button-type-creator"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors">
                <Cat className="h-6 w-6 text-accent group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="font-bold text-base">I'm a Creator</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  I make cat content and want to land brand deals, build my media kit, and connect with brands.
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {["Media Kit", "Rate Card", "Deal Analyzer"].map(t => (
                  <span key={t} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </button>

            <button
              onClick={() => { setAccountType("brand"); setStep("brand"); }}
              className="group p-6 rounded-2xl border-2 border-border hover:border-accent bg-white hover:bg-accent/5 transition-all text-left space-y-3"
              data-testid="button-type-brand"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors">
                <Store className="h-6 w-6 text-accent group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="font-bold text-base">I'm a Brand</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  I represent a brand looking to find cat content creators and run UGC campaigns.
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {["Find Creators", "Post Campaigns", "Direct DMs"].map(t => (
                  <span key={t} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "creator") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto">
              <Cat className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-2xl font-heading font-bold">Set up your creator profile</h1>
            <p className="text-sm text-muted-foreground">You can update all of this anytime in your profile builder.</p>
          </div>

          <div className="bg-white rounded-2xl border p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName">Your name or creator handle <span className="text-red-500">*</span></Label>
              <Input
                id="displayName"
                placeholder="Frances and Family, @cozycat_life, etc."
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                data-testid="input-display-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="niche">Your cat content niche</Label>
              <Input
                id="niche"
                placeholder="Rescue cats, breed content, lifestyle, comedy..."
                value={niche}
                onChange={e => setNiche(e.target.value)}
                data-testid="input-niche"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Short bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell brands and creators who you are in a few sentences..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="min-h-[80px] resize-none"
                data-testid="textarea-bio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website or portfolio link</Label>
              <Input
                id="website"
                placeholder="yoursite.com"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                data-testid="input-website"
              />
            </div>
          </div>

          <Button
            onClick={handleCreatorSubmit}
            disabled={!displayName.trim() || mutation.isPending}
            className="w-full h-12 rounded-full bg-accent hover:bg-accent/90 text-white"
            data-testid="button-creator-continue"
          >
            {mutation.isPending ? "Setting up..." : "Build My Profile"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <button onClick={() => setStep("type")} className="w-full text-sm text-muted-foreground hover:text-foreground text-center">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Brand setup
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto">
            <Store className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-2xl font-heading font-bold">Set up your brand profile</h1>
          <p className="text-sm text-muted-foreground">Tell creators who you are and what you're looking for.</p>
        </div>

        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="companyName">Brand or company name <span className="text-red-500">*</span></Label>
            <Input
              id="companyName"
              placeholder="Chewy, Purina, Temptations..."
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              data-testid="input-company-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brandCategory">Category</Label>
            <Input
              id="brandCategory"
              placeholder="Cat food, treats, tech, accessories..."
              value={brandCategory}
              onChange={e => setBrandCategory(e.target.value)}
              data-testid="input-brand-category"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brandBio">About your brand</Label>
            <Textarea
              id="brandBio"
              placeholder="What your brand does and what kind of creators you work with..."
              value={brandBio}
              onChange={e => setBrandBio(e.target.value)}
              className="min-h-[80px] resize-none"
              data-testid="textarea-brand-bio"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brandBudget">Typical UGC budget range</Label>
            <Input
              id="brandBudget"
              placeholder="e.g. $200–$2,000 per campaign"
              value={brandBudget}
              onChange={e => setBrandBudget(e.target.value)}
              data-testid="input-brand-budget"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 space-y-2">
          <p className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 size={14} className="text-accent" /> What you get as a brand
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Browse creator profiles with real stats</li>
            <li>• Send direct messages and deal offers</li>
            <li>• Post campaigns to the community</li>
            <li>• No middleman, no agency fees</li>
          </ul>
        </div>

        <Button
          onClick={handleBrandSubmit}
          disabled={!companyName.trim() || mutation.isPending}
          className="w-full h-12 rounded-full bg-accent hover:bg-accent/90 text-white"
          data-testid="button-brand-continue"
        >
          {mutation.isPending ? "Setting up..." : "Enter the Network"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <button onClick={() => setStep("type")} className="w-full text-sm text-muted-foreground hover:text-foreground text-center">
          ← Back
        </button>
      </div>
    </div>
  );
}
