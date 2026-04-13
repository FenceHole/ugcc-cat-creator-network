import { useState, useRef } from "react";
import { Layout } from "@/components/layout";
import { MediaKitPreview } from "@/components/media-kit-preview";
import { defaultMediaKit, MediaKit, mediaKitSchema } from "@/lib/types";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Download, Eye, ChevronRight, ChevronLeft, Save } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["Profile", "Socials", "Audience", "Rates"];

export default function Builder() {
  const [activeTab, setActiveTab] = useState("Profile");
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<MediaKit>({
    resolver: zodResolver(mediaKitSchema),
    defaultValues: defaultMediaKit,
    mode: "onChange",
  });

  const { register, control, watch, formState: { errors } } = form;
  
  // Watch all fields for live preview
  const data = watch();

  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({
    control,
    name: "socials",
  });

  const { fields: rateFields, append: appendRate, remove: removeRate } = useFieldArray({
    control,
    name: "rates",
  });

  const handleExport = async () => {
    if (!previewRef.current) return;
    
    toast({
      title: "Generating PDF...",
      description: "Please wait while we render your media kit.",
    });

    try {
      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.fullName || "media-kit"}.pdf`);
      
      toast({
        title: "Success!",
        description: "Your media kit has been downloaded.",
      });
    } catch (error) {
      console.error("Export failed", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    const currentIndex = STEPS.indexOf(activeTab);
    if (currentIndex < STEPS.length - 1) {
      setActiveTab(STEPS[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(STEPS[currentIndex - 1]);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* Left Panel: Editor */}
        <div className="w-full lg:w-[500px] xl:w-[600px] bg-background border-r flex flex-col h-full overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
             <h2 className="font-heading font-bold text-lg">Editor</h2>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => form.reset(defaultMediaKit)}>Reset</Button>
                <Button size="sm" onClick={handleExport} className="gap-2">
                  <Download size={14} /> Export PDF
                </Button>
             </div>
          </div>

          {/* Stepper Navigation */}
          <div className="px-4 pt-4">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {STEPS.map((step) => (
                    <TabsTrigger key={step} value={step} className="text-xs sm:text-sm">
                      {step}
                    </TabsTrigger>
                  ))}
                </TabsList>
             </Tabs>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form className="space-y-6">
              
              {/* PROFILE STEP */}
              {activeTab === "Profile" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...register("fullName")} placeholder="Jane Doe" />
                    {errors.fullName && <p className="text-destructive text-xs">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input id="tagline" {...register("tagline")} placeholder="Lifestyle Creator & Photographer" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label htmlFor="email">Contact Email</Label>
                       <Input id="email" {...register("email")} placeholder="hello@janedoe.com" />
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="website">Website</Label>
                       <Input id="website" {...register("website")} placeholder="janedoe.com" />
                    </div>
                  </div>

                   <div className="space-y-2">
                       <Label htmlFor="location">Location</Label>
                       <Input id="location" {...register("location")} placeholder="New York, NY" />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      {...register("bio")} 
                      placeholder="Tell brands about yourself..." 
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
              )}

              {/* SOCIALS STEP */}
              {activeTab === "Socials" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="space-y-4">
                    {socialFields.map((field, index) => (
                      <Card key={field.id} className="relative group">
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => removeSocial(index)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        <CardContent className="p-4 grid gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Platform</Label>
                              <Select 
                                onValueChange={(value) => {
                                  // Update the value in react-hook-form state
                                  const currentSocials = form.getValues("socials");
                                  currentSocials[index].platform = value as any;
                                  form.setValue("socials", currentSocials);
                                }} 
                                defaultValue={field.platform}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select platform" />
                                </SelectTrigger>
                                <SelectContent>
                                  {["Instagram", "TikTok", "YouTube", "Twitter", "LinkedIn", "Newsletter", "Blog"].map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Followers</Label>
                              <Input {...register(`socials.${index}.followers`)} placeholder="e.g. 50K" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Handle</Label>
                            <Input {...register(`socials.${index}.handle`)} placeholder="username" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full border-dashed" 
                      onClick={() => appendSocial({ platform: "Instagram", handle: "", followers: "" })}
                    >
                      <Plus size={14} className="mr-2" /> Add Social Channel
                    </Button>
                  </div>
                </div>
              )}

              {/* AUDIENCE STEP */}
              {activeTab === "Audience" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="niche">Primary Niche</Label>
                    <Input id="niche" {...register("niche")} placeholder="e.g. Travel, Tech, Beauty" />
                  </div>

                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Demographics</h3>
                    <div className="space-y-2">
                       <Label>Gender Split</Label>
                       <Input {...register("audienceGender")} placeholder="e.g. 60% Female / 40% Male" />
                    </div>
                    <div className="space-y-2">
                       <Label>Primary Age Range</Label>
                       <Input {...register("audienceAgeRange")} placeholder="e.g. 18-34" />
                    </div>
                    <div className="space-y-2">
                       <Label>Top Locations</Label>
                       <Input {...register("topLocations")} placeholder="e.g. USA, UK, Canada" />
                    </div>
                  </div>
                </div>
              )}

              {/* RATES STEP */}
              {activeTab === "Rates" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                   <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <Label>Services & Pricing</Label>
                     </div>
                    {rateFields.map((field, index) => (
                      <div key={field.id} className="flex gap-3 items-end group">
                        <div className="space-y-2 flex-1">
                          <Label className="text-xs text-muted-foreground">Service</Label>
                          <Input {...register(`rates.${index}.service`)} placeholder="e.g. Instagram Post" />
                        </div>
                        <div className="space-y-2 w-32">
                          <Label className="text-xs text-muted-foreground">Price</Label>
                          <Input {...register(`rates.${index}.price`)} placeholder="$500" />
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="mb-0.5 text-muted-foreground hover:text-destructive"
                          onClick={() => removeRate(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full border-dashed" 
                      onClick={() => appendRate({ service: "", price: "" })}
                    >
                      <Plus size={14} className="mr-2" /> Add Rate
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="previousBrands">Previous Brands (Comma separated)</Label>
                    <Input id="previousBrands" {...register("previousBrands")} placeholder="Nike, Apple, Sephora" />
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="p-4 border-t bg-background flex justify-between">
            <Button 
              variant="ghost" 
              onClick={prevStep} 
              disabled={STEPS.indexOf(activeTab) === 0}
            >
              <ChevronLeft size={16} className="mr-2" /> Back
            </Button>
            
            {STEPS.indexOf(activeTab) === STEPS.length - 1 ? (
              <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
                <Download size={16} className="mr-2" /> Export PDF
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next <ChevronRight size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div className="flex-1 bg-muted/30 overflow-auto flex justify-center items-start p-8 lg:p-12 relative">
          <div className="fixed top-20 right-8 z-10 lg:hidden">
             {/* Mobile View Toggle could go here */}
          </div>
          
          <div className="scale-[0.5] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.8] xl:scale-[0.9] origin-top transition-transform duration-300">
            <MediaKitPreview ref={previewRef} data={data} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
