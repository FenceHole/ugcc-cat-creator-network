import { useState, useRef, useCallback } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  FileText, 
  Clock,
  DollarSign,
  Mail,
  MessageSquare,
  FileCheck,
  Upload,
  ImageIcon,
  Sparkles,
  X,
  Star,
  Lightbulb,
  TrendingUp,
  Send,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { DealAnalysis } from "@shared/schema";

interface PitchPackage {
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

async function fetchDealHistory(): Promise<DealAnalysis[]> {
  const response = await fetch("/api/deals/history", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch deal history");
  return response.json();
}

async function analyzeDeal(data: { text: string; type: string }): Promise<DealAnalysis> {
  const response = await fetch("/api/deals/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to analyze deal");
  return response.json();
}

async function generatePitchPackage(data: { imageBase64?: string; textContent?: string }): Promise<PitchPackage> {
  const response = await fetch("/api/deals/pitch-package", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).message || "Failed to generate pitch package");
  }
  return response.json();
}

function formatDate(date: string | Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeLabel(type: string) {
  switch (type) {
    case "email": return "Brand Email";
    case "contract": return "Contract";
    case "dm": return "DM";
    default: return type;
  }
}

export default function DealTranslator() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deal Analyzer state
  const [dealText, setDealText] = useState("");
  const [dealType, setDealType] = useState("email");
  const [selectedAnalysis, setSelectedAnalysis] = useState<DealAnalysis | null>(null);

  // Pitch Package state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // base64
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [pitchText, setPitchText] = useState("");
  const [pitchResult, setPitchResult] = useState<PitchPackage | null>(null);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ["/api/deals/history"],
    queryFn: fetchDealHistory,
    enabled: !!user,
  });

  const analysisMutation = useMutation({
    mutationFn: analyzeDeal,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals/history"] });
      setSelectedAnalysis(data);
    },
    onError: () => {
      toast({ title: "Analysis Failed", description: "Failed to analyze the deal. Please try again.", variant: "destructive" });
    },
  });

  const pitchMutation = useMutation({
    mutationFn: generatePitchPackage,
    onSuccess: (data) => {
      setPitchResult(data);
      toast({ title: "Pitch Package Ready!", description: `Generated your personalized pitch for ${data.brandName}.` });
    },
    onError: (err: Error) => {
      toast({ title: "Generation Failed", description: err.message || "Failed to generate pitch package. Please try again.", variant: "destructive" });
    },
  });

  const handleAnalyze = () => {
    if (!dealText.trim()) {
      toast({ title: "No Content", description: "Please paste some content to analyze.", variant: "destructive" });
      return;
    }
    analysisMutation.mutate({ text: dealText, type: dealType });
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 10MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(",")[1];
      setUploadedImage(base64);
      setUploadedImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, []);

  const handleGeneratePitch = () => {
    if (!uploadedImage && !pitchText.trim()) {
      toast({ title: "Nothing to analyze", description: "Upload a screenshot or paste the message text.", variant: "destructive" });
      return;
    }
    setPitchResult(null);
    pitchMutation.mutate({
      imageBase64: uploadedImage || undefined,
      textContent: !uploadedImage ? pitchText : undefined,
    });
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
    toast({ title: "Copied!", description: "Text copied to clipboard." });
  };

  const clearImage = () => {
    setUploadedImage(null);
    setUploadedImagePreview(null);
    setPitchResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center max-w-lg">
          <div className="text-5xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold mb-4">Deal Analyzer</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Upload a screenshot of any brand email or DM and get a complete pitch package — 
            AI reads it, analyzes it, and generates a personalized response using your real stats.
          </p>
          <Button onClick={() => window.location.href = "/api/login"} size="lg" className="rounded-full bg-accent hover:bg-accent/90 text-white" data-testid="button-login">
            Sign In to Start
          </Button>
        </div>
      </Layout>
    );
  }

  const displayedAnalysis = selectedAnalysis;
  const redFlags = (displayedAnalysis?.redFlags as string[]) || [];
  const missingTerms = (displayedAnalysis?.missingTerms as string[]) || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-deal-title">🔍 Deal Analyzer</h1>
          <p className="text-muted-foreground max-w-2xl">
            Screenshot a brand email or DM → AI reads it → generates your complete personalized pitch package 
            with your real stats, recommended rates, and a reply ready to send.
          </p>
        </div>

        <Tabs defaultValue="pitch" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pitch" className="flex items-center gap-2" data-testid="tab-pitch">
              <Sparkles className="h-4 w-4" />
              Pitch Package
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center gap-2" data-testid="tab-analyze">
              <FileText className="h-4 w-4" />
              Deal Analyzer
            </TabsTrigger>
          </TabsList>

          {/* ===== PITCH PACKAGE TAB ===== */}
          <TabsContent value="pitch" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left: Upload */}
              <div className="space-y-4">
                <Card className="border-2 border-accent/20 bg-accent/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Pitch Package Generator</CardTitle>
                        <CardDescription>Screenshot → personalized pitch in seconds</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    {/* Image Upload Zone */}
                    {!uploadedImagePreview ? (
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                          dragOver 
                            ? "border-accent bg-accent/10" 
                            : "border-border hover:border-accent/50 hover:bg-accent/5"
                        }`}
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="dropzone-image"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                        />
                        <div className="space-y-3">
                          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                            <ImageIcon className="h-7 w-7 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Drop your screenshot here</p>
                            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Works with email screenshots, DM screenshots, any brand message
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border-2 border-accent/30">
                        <img 
                          src={uploadedImagePreview} 
                          alt="Uploaded brand message" 
                          className="w-full max-h-64 object-contain bg-muted"
                        />
                        <button
                          onClick={clearImage}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <p className="text-white text-xs font-medium">Screenshot uploaded ✓</p>
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-card px-3 text-muted-foreground">or paste the text instead</span>
                      </div>
                    </div>

                    <Textarea
                      placeholder="Paste the brand email, DM, or message text here if you don't have a screenshot..."
                      className="min-h-[120px] text-sm"
                      value={pitchText}
                      onChange={(e) => setPitchText(e.target.value)}
                      disabled={!!uploadedImage}
                      data-testid="textarea-pitch-text"
                    />

                    <Button
                      onClick={handleGeneratePitch}
                      disabled={pitchMutation.isPending || (!uploadedImage && !pitchText.trim())}
                      className="w-full bg-accent hover:bg-accent/90 text-white"
                      size="lg"
                      data-testid="button-generate-pitch"
                    >
                      {pitchMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating Your Pitch Package...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate My Pitch Package
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      AI reads the message, pulls your stats, and writes your personalized reply
                    </p>
                  </CardContent>
                </Card>

                {/* How it works */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">How It Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { step: "1", title: "Upload screenshot", desc: "Take a screenshot of the brand email, DM, or message" },
                      { step: "2", title: "AI reads it", desc: "We extract the text and understand exactly what they want" },
                      { step: "3", title: "We pull your stats", desc: "Your followers, engagement rates, and rates from your profile" },
                      { step: "4", title: "Get your pitch", desc: "A personalized reply with your real numbers, ready to send" },
                    ].map(({ step, title, desc }) => (
                      <div key={step} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {step}
                        </div>
                        <div>
                          <span className="font-medium">{title}</span>
                          <span className="text-muted-foreground"> — {desc}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right: Results */}
              <div className="space-y-4">
                {pitchMutation.isPending && (
                  <Card className="border-accent/20">
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                )}

                {pitchResult && !pitchMutation.isPending && (
                  <div className="space-y-4" data-testid="pitch-package-results">
                    {/* Brand Summary */}
                    <Card className="border-accent/30 bg-accent/5">
                      <CardContent className="pt-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-heading font-bold text-lg" data-testid="text-brand-name">{pitchResult.brandName}</h3>
                              {pitchResult.redFlags.length === 0 && (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">No Red Flags</Badge>
                              )}
                              {pitchResult.redFlags.length > 0 && (
                                <Badge variant="destructive" className="text-xs">{pitchResult.redFlags.length} Flag{pitchResult.redFlags.length > 1 ? "s" : ""}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">Brand tone: {pitchResult.brandTone}</p>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed" data-testid="text-what-they-want">{pitchResult.whatTheyWant}</p>
                      </CardContent>
                    </Card>

                    {/* Extracted Text (collapsible) */}
                    {pitchResult.extractedText && (
                      <Card>
                        <button
                          onClick={() => setShowExtractedText(!showExtractedText)}
                          className="w-full flex items-center justify-between p-4 text-sm font-medium hover:bg-muted/50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Eye size={14} />
                            View extracted message text
                          </div>
                          {showExtractedText ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {showExtractedText && (
                          <CardContent className="pt-0">
                            <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg font-mono leading-relaxed whitespace-pre-wrap">
                              {pitchResult.extractedText}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    )}

                    {/* Red Flags */}
                    {pitchResult.redFlags.length > 0 && (
                      <Card className="border-red-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <CardTitle className="text-sm text-red-600">Watch Out For</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1.5">
                            {pitchResult.redFlags.map((flag, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-red-600">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                {flag}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* What to Ask */}
                    {pitchResult.missingInfo.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            <CardTitle className="text-sm">Ask Before Agreeing</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1.5">
                            {pitchResult.missingInfo.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recommended Rates */}
                    {pitchResult.recommendedRates.length > 0 && (
                      <Card className="border-green-200 bg-green-50/30">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <CardTitle className="text-sm text-green-700">Your Recommended Rates for This Brand</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {pitchResult.recommendedRates.map((rate, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm font-medium text-green-700">
                                <CheckCircle2 size={14} className="shrink-0" />
                                {rate}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Your Pitch Highlights */}
                    {pitchResult.pitchHighlights.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-accent" />
                            <CardTitle className="text-sm">Lead With These Stats</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1.5">
                            {pitchResult.pitchHighlights.map((highlight, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="text-accent shrink-0">→</span>
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Generated Reply */}
                    <Card className="border-2 border-accent/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Send className="h-4 w-4 text-accent" />
                              <CardTitle className="text-base">Your Personalized Reply</CardTitle>
                            </div>
                            {pitchResult.subjectLine && (
                              <p className="text-xs text-muted-foreground">
                                Subject: <span className="font-medium text-foreground">{pitchResult.subjectLine}</span>
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(pitchResult.generatedReply, "reply")}
                            className="shrink-0 rounded-full"
                            data-testid="button-copy-reply"
                          >
                            {copiedSection === "reply" ? (
                              <><CheckCircle2 size={12} className="mr-1.5 text-green-500" /> Copied!</>
                            ) : (
                              <><Copy size={12} className="mr-1.5" /> Copy Reply</>
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/40 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-sans border" data-testid="text-generated-reply">
                          {pitchResult.generatedReply}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tips */}
                    {pitchResult.tips.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-accent" />
                            <CardTitle className="text-sm">Tips for This Outreach</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {pitchResult.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="text-accent font-bold shrink-0">{i + 1}.</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => { setPitchResult(null); clearImage(); setPitchText(""); }}
                      className="w-full rounded-full"
                    >
                      Analyze Another Brand Message
                    </Button>
                  </div>
                )}

                {!pitchResult && !pitchMutation.isPending && (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border-2 border-dashed rounded-2xl">
                    <div className="text-5xl">📧</div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Your pitch package will appear here</p>
                      <p className="text-sm text-muted-foreground mt-1">Upload a screenshot or paste a message to get started</p>
                    </div>
                    <div className="text-xs text-muted-foreground max-w-xs">
                      Like that Halo Pets message — screenshot it, upload it, and get a complete pitch with your real stats in seconds.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ===== DEAL ANALYZER TAB ===== */}
          <TabsContent value="analyze" className="space-y-6">
            <div className="flex gap-8">
              <div className="flex-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analyze a Deal</CardTitle>
                    <CardDescription>
                      Paste a brand email, contract, or DM for a full breakdown — red flags, missing terms, and a counter-offer template.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label>What type of content is this?</Label>
                      <RadioGroup value={dealType} onValueChange={setDealType} className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="email" data-testid="radio-email" />
                          <Label htmlFor="email" className="cursor-pointer">Brand Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="contract" id="contract" data-testid="radio-contract" />
                          <Label htmlFor="contract" className="cursor-pointer">Contract Snippet</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dm" id="dm" data-testid="radio-dm" />
                          <Label htmlFor="dm" className="cursor-pointer">DM</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Textarea
                      placeholder="Paste the brand email, contract snippet, or DM here..."
                      className="min-h-[200px] font-mono text-sm"
                      value={dealText}
                      onChange={(e) => setDealText(e.target.value)}
                      data-testid="textarea-deal"
                    />
                    
                    <Button
                      onClick={handleAnalyze}
                      disabled={analysisMutation.isPending || !dealText.trim()}
                      className="w-full bg-accent hover:bg-accent/90 text-white"
                      size="lg"
                      data-testid="button-analyze"
                    >
                      {analysisMutation.isPending ? "Analyzing..." : "Analyze This Deal"}
                    </Button>
                  </CardContent>
                </Card>
                
                {analysisMutation.isPending && (
                  <Card>
                    <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-48 w-full" />
                    </CardContent>
                  </Card>
                )}
                
                {displayedAnalysis && !analysisMutation.isPending && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <CardTitle>What They're Actually Asking For</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground leading-relaxed" data-testid="text-summary">{displayedAnalysis.summary}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <CardTitle className="text-red-600 dark:text-red-400">Where You're Getting Screwed</CardTitle>
                        </div>
                        <CardDescription>Red flags to watch out for</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {redFlags.length > 0 ? (
                          <ul className="space-y-2" data-testid="list-redflags">
                            {redFlags.map((flag, index) => (
                              <li key={index} className="flex items-start gap-2 text-red-600 dark:text-red-400">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>{flag}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-green-600 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            No major red flags detected
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="border-amber-200 dark:border-amber-900">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          <CardTitle className="text-amber-600 dark:text-amber-400">What's Missing From This Deal</CardTitle>
                        </div>
                        <CardDescription>Terms that should be there but aren't</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {missingTerms.length > 0 ? (
                          <ul className="space-y-2">
                            {missingTerms.map((term, index) => (
                              <li key={index} className="flex items-start gap-2 text-amber-600 dark:text-amber-400">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>{term}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">Nothing obviously missing</p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-200 dark:border-green-900">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <CardTitle className="text-green-600 dark:text-green-400">What This Is Worth</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-green-700 dark:text-green-300 font-semibold text-lg" data-testid="text-estimated-value">
                          {displayedAnalysis.estimatedValue}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-accent" />
                            <CardTitle>Your Counter-Offer Template</CardTitle>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(displayedAnalysis.suggestedCounter || "", "counter")}
                            className="rounded-full"
                            data-testid="button-copy-counter"
                          >
                            {copiedSection === "counter" ? (
                              <><CheckCircle2 size={12} className="mr-1.5 text-green-500" /> Copied!</>
                            ) : (
                              <><Copy size={12} className="mr-1.5" /> Copy</>
                            )}
                          </Button>
                        </div>
                        <CardDescription>Edit and send as your own</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/40 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-sans border" data-testid="text-counter-offer">
                          {displayedAnalysis.suggestedCounter}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* History Sidebar */}
              <div className="w-72 shrink-0 hidden lg:block">
                <Card className="sticky top-24">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Analysis History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {historyLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                      </div>
                    ) : history.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No analyses yet</p>
                    ) : (
                      <div className="space-y-2">
                        {history.slice(0, 8).map((analysis) => (
                          <button
                            key={analysis.id}
                            onClick={() => setSelectedAnalysis(analysis)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors hover:border-accent/40 ${
                              selectedAnalysis?.id === analysis.id ? "border-accent bg-accent/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs px-1.5">{getTypeLabel(analysis.analysisType)}</Badge>
                              <span className="text-xs text-muted-foreground">{formatDate(analysis.createdAt)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{analysis.originalText}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
