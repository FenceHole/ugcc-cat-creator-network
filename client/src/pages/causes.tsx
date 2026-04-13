import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  MapPin, 
  Stethoscope, 
  Truck, 
  Users, 
  DollarSign, 
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";
import { Link } from "wouter";

export default function Causes() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-rose-500/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto border-2 border-accent/20">
              <Heart className="h-10 w-10 text-accent" fill="currentColor" fillOpacity={0.3} />
            </div>
            <Badge variant="outline" className="border-accent/30 text-accent">Causes & Giving Back</Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight" data-testid="text-causes-title">
              Good cat content<br />
              <span className="text-gradient-accent">does good things.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              UGCC was built with purpose. When the cat creator community thrives, 
              the cats who need the most help benefit too.
            </p>
          </div>
        </div>
      </section>

      {/* Vet Van Fleet Feature */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <Badge variant="outline" className="border-accent/30 text-accent">Our Flagship Initiative</Badge>
                <h2 className="text-3xl md:text-4xl font-heading font-extrabold">
                  Vet Van Fleet
                </h2>
                <p className="text-xl text-accent font-semibold">Free veterinary healthcare for cats in need — everywhere.</p>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Millions of cats live without access to basic veterinary care — not because their people don't love them, 
                  but because cost and access are impossible barriers. Vet Van Fleet is our answer to that.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  A fleet of fully equipped mobile veterinary units that bring free care — vaccines, spay/neuter, 
                  wellness exams, emergency triage, and more — directly to underserved communities, shelters, and 
                  anywhere cats need help.
                </p>
                <div className="space-y-3">
                  {[
                    "Free services — no income requirements, no judgment",
                    "Mobile units that go where the cats are",
                    "Partnerships with shelters and TNR programs",
                    "Funded in part by the UGCC creator community",
                    "100% nonprofit — every dollar goes to cat care",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 size={16} className="text-accent shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button className="rounded-full bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20">
                    <Heart className="mr-2 h-4 w-4" /> Support Vet Van Fleet
                  </Button>
                  <Button variant="outline" className="rounded-full border-2">
                    <ExternalLink className="mr-2 h-4 w-4" /> Learn More
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={<Truck className="h-6 w-6 text-accent" />}
                  number="Mobile"
                  label="Veterinary units that travel to communities"
                  accent
                />
                <StatCard
                  icon={<Stethoscope className="h-6 w-6 text-accent" />}
                  number="Free"
                  label="All services — vaccines, wellness, spay/neuter"
                />
                <StatCard
                  icon={<MapPin className="h-6 w-6 text-accent" />}
                  number="Everywhere"
                  label="We go where shelters and cats need us most"
                />
                <StatCard
                  icon={<Heart className="h-6 w-6 text-accent" />}
                  number="Creator-Led"
                  label="Funded by the UGCC community's success"
                  accent
                />

                {/* Mission Statement Card */}
                <div className="col-span-2 p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-orange-500/10 border border-accent/20">
                  <p className="text-sm font-medium leading-relaxed italic text-muted-foreground">
                    "Every cat deserves care. Every creator can be part of the solution. 
                    When you build your brand on UGCC, you're not just building a career — 
                    you're helping fund the cats who have no other advocate."
                  </p>
                  <p className="text-xs text-accent font-semibold mt-2">— The UGCC Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Creators Help */}
      <section className="py-24 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-heading font-bold mb-4">How Cat Creators Power Vet Van Fleet</h2>
              <p className="text-muted-foreground text-lg">
                You don't have to donate to make a difference. Simply using UGCC and building your creator business helps.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  number: "01",
                  title: "Awareness Campaigns",
                  desc: "Partner with Vet Van Fleet to create cat content that spreads awareness. We'll list it as verified brand collabs on your media kit.",
                },
                {
                  number: "02",
                  title: "Creator Fundraisers",
                  desc: "Run fundraisers through your social channels using UGCC's tools. We track and report every dollar raised to Vet Van Fleet.",
                },
                {
                  number: "03",
                  title: "Community Giving",
                  desc: "A portion of every UGCC Pro membership goes directly to Vet Van Fleet. Growing the platform grows the fund.",
                },
              ].map(({ number, title, desc }) => (
                <div key={number} className="text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                    <span className="text-accent font-extrabold text-xl font-heading">{number}</span>
                  </div>
                  <h3 className="font-bold text-lg">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Other Causes */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading font-bold mb-4">Other Causes We Support</h2>
              <p className="text-muted-foreground text-lg">
                The UGCC community rallies around causes that protect and support cats everywhere.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <CauseCard
                emoji="🏠"
                name="TNR Programs"
                tagline="Trap, Neuter, Return"
                desc="We support community TNR initiatives by helping creators raise awareness and funds for local programs."
              />
              <CauseCard
                emoji="🐱"
                name="Shelter Support"
                tagline="No kill. Full care."
                desc="Connecting cat creators with local shelters for content collaboration that drives adoptions and donations."
              />
              <CauseCard
                emoji="📢"
                name="Legislative Advocacy"
                tagline="Cats have rights."
                desc="Using the UGCC platform's reach to advocate for stronger animal welfare laws and enforcement."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-accent/10 via-background to-rose-500/10 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="text-5xl">❤️</div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold">
              Every great cat video has the power to help a real cat.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Start building your creator business on UGCC, and know that your success is connected to something bigger.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link href="/builder">
                <Button size="lg" className="rounded-full h-14 px-8 bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20">
                  Start My Creator Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-full h-14 px-8 border-2">
                <Heart className="mr-2 h-4 w-4" /> Donate to Vet Van Fleet
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function StatCard({ icon, number, label, accent }: { icon: React.ReactNode; number: string; label: string; accent?: boolean }) {
  return (
    <div className={`p-5 rounded-2xl border ${accent ? "border-accent/30 bg-accent/5" : "bg-card"}`}>
      <div className="mb-3">{icon}</div>
      <div className="text-2xl font-heading font-extrabold mb-1">{number}</div>
      <div className="text-xs text-muted-foreground leading-relaxed">{label}</div>
    </div>
  );
}

function CauseCard({ emoji, name, tagline, desc }: { emoji: string; name: string; tagline: string; desc: string }) {
  return (
    <Card className="hover:border-accent/40 hover:shadow-sm transition-all">
      <CardHeader>
        <div className="text-3xl mb-2">{emoji}</div>
        <CardTitle className="text-base">{name}</CardTitle>
        <p className="text-xs text-accent font-semibold">{tagline}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}
