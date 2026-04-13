import { MediaKit } from "@/lib/types";
import { Instagram, Twitter, Linkedin, Globe, Mail, MapPin, Youtube } from "lucide-react";
import { forwardRef } from "react";

// Icons map
const icons: Record<string, any> = {
  Instagram: Instagram,
  Twitter: Twitter,
  LinkedIn: Linkedin,
  YouTube: Youtube,
  TikTok: Globe, // Fallback
  Newsletter: Mail,
  Blog: Globe,
};

export const MediaKitPreview = forwardRef<HTMLDivElement, { data: MediaKit }>(({ data }, ref) => {
  return (
    <div className="w-full flex justify-center py-8 bg-gray-100/50 min-h-screen">
      <div 
        ref={ref}
        id="media-kit-preview"
        className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-12 flex flex-col relative overflow-hidden"
        style={{ aspectRatio: "210/297" }} // A4 Ratio
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-bl-[100px] -z-0"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-50 rounded-tr-[100px] -z-0"></div>

        {/* Header */}
        <header className="relative z-10 mb-12 border-b pb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-heading font-extrabold text-primary mb-2 uppercase tracking-tight">
                {data.fullName || "Your Name"}
              </h1>
              <p className="text-xl text-accent font-medium tracking-wide">
                {data.tagline || "Digital Creator & Influencer"}
              </p>
            </div>
            <div className="text-right space-y-2 text-sm text-muted-foreground">
              {data.email && (
                <div className="flex items-center justify-end gap-2">
                  <span>{data.email}</span>
                  <Mail size={14} />
                </div>
              )}
              {data.website && (
                <div className="flex items-center justify-end gap-2">
                  <span>{data.website}</span>
                  <Globe size={14} />
                </div>
              )}
              {data.location && (
                <div className="flex items-center justify-end gap-2">
                  <span>{data.location}</span>
                  <MapPin size={14} />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-12 relative z-10 flex-1">
          {/* Left Column (Bio & Audience) */}
          <div className="col-span-7 flex flex-col gap-10">
            {/* Bio Section */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b border-accent/20 pb-1 inline-block">
                About Me
              </h3>
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                {data.bio || "Write a compelling bio that describes who you are, what you create, and why your audience loves you. Keep it professional yet authentic."}
              </p>
            </section>

            {/* Audience Section */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 border-b border-accent/20 pb-1 inline-block">
                Audience Demographics
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-bold text-sm mb-2 text-primary">Age & Gender</h4>
                  <p className="text-2xl font-heading font-bold text-accent mb-1">{data.audienceGender || "60% Female"}</p>
                  <p className="text-xs text-muted-foreground">Primary Age: <span className="font-medium text-foreground">{data.audienceAgeRange || "18-34"}</span></p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-bold text-sm mb-2 text-primary">Top Locations</h4>
                  <p className="text-sm font-medium leading-relaxed">
                    {data.topLocations || "USA, United Kingdom, Canada, Australia"}
                  </p>
                </div>
              </div>
            </section>

             {/* Previous Brands */}
             {data.previousBrands && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b border-accent/20 pb-1 inline-block">
                  Previous Collaborations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.previousBrands.split(",").map((brand, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      {brand.trim()}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (Stats & Rates) */}
          <div className="col-span-5 flex flex-col gap-10">
             {/* Profile Image Placeholder */}
             <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                {/* In a real app, this would be a user uploaded image */}
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-gray-200">
                  <span className="text-xs uppercase tracking-widest">Profile Photo</span>
                </div>
             </div>

            {/* Social Stats */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b border-accent/20 pb-1 inline-block">
                Social Reach
              </h3>
              <div className="space-y-3">
                {data.socials.length > 0 ? (
                  data.socials.map((social, idx) => {
                    const Icon = icons[social.platform] || Globe;
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{social.platform}</p>
                            <p className="text-[10px] text-muted-foreground">@{social.handle}</p>
                          </div>
                        </div>
                        <span className="font-heading font-bold text-lg">{social.followers}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground italic">Add your social channels to see them here.</div>
                )}
              </div>
            </section>

            {/* Rates */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b border-accent/20 pb-1 inline-block">
                Partnership Rates
              </h3>
              <div className="space-y-3">
                {data.rates.length > 0 ? (
                  data.rates.map((rate, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-dashed border-gray-200 pb-2 last:border-0">
                      <span className="font-medium text-sm text-gray-700">{rate.service}</span>
                      <span className="font-bold text-sm">{rate.price}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic">Add rates to display pricing.</div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 leading-tight">
                *Rates are subject to change based on scope and usage rights. Bundles available upon request.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t flex justify-between items-center text-xs text-muted-foreground">
          <span>{new Date().getFullYear()} Media Kit</span>
          <span className="font-medium text-accent uppercase tracking-wider">Let's Create Together</span>
        </div>
      </div>
    </div>
  );
});

MediaKitPreview.displayName = "MediaKitPreview";
