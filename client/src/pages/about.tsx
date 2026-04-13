import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Cat, Star, Play, Heart } from "lucide-react";

const credentials = [
  { label: "Newsweek", detail: "Featured 4 times in a single year" },
  { label: "MSN", detail: "National coverage" },
  { label: "The Dodo", detail: "Viral features" },
  { label: "cats.com", detail: "Editorial feature" },
  { label: "We Love Animals", detail: "Featured story" },
  { label: "Cuddle Buddies", detail: "Featured story" },
  { label: "China Daily", detail: "Front page" },
];

const brandPartners = [
  "Litter-Robot",
  "Dr. Elsey's",
  "PetKit",
  "Petlibro",
  "Basepaws",
];

const stats = [
  { number: "44M", label: "Views on a single Instagram video" },
  { number: "11.7M", label: "Views on a single TikTok video" },
  { number: "100K+", label: "Hours watched on Instagram" },
  { number: "100K+", label: "Hours watched on TikTok" },
  { number: "1M+", label: "Viewers in a single live stream hour" },
  { number: "200K+", label: "Followers on The GOOD Meow TikTok" },
  { number: "4x", label: "Newsweek in one year" },
  { number: "2x", label: "Top 30 Amazon Pet Influencers (back to back)" },
];

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="border-accent/30 text-accent">Our Story</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold" data-testid="text-about-title">
            We built UGCC because we needed it.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're Frances and Family — one of the most-recognized cat content creator families in the country. 
            We've been featured in Newsweek four times in one year, gone viral with hundreds of millions of views, 
            and partnered with the biggest names in the pet industry. But it took a lot of fumbling to get here.
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            UGCC is everything we wish had existed when we started. Built on real experience, 
            real industry knowledge, and one simple belief: 
            <strong className="text-foreground"> each one teach one.</strong>
          </p>
        </div>

        {/* Big Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map(({ number, label }) => (
            <div key={label} className="text-center p-5 rounded-2xl border bg-card hover:border-accent/30 transition-colors">
              <div className="text-2xl md:text-3xl font-heading font-extrabold text-accent mb-1">{number}</div>
              <div className="text-xs text-muted-foreground leading-snug">{label}</div>
            </div>
          ))}
        </div>

        {/* The Story */}
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-start">
          <div className="space-y-5">
            <h2 className="text-2xl font-heading font-bold">How we got here</h2>
            <p className="text-muted-foreground leading-relaxed">
              When brands first started reaching out to us, we didn't know what a rate card or media kit was. 
              We didn't understand engagement rate, watch time, or how the algorithm actually works. 
              We didn't know what deliverables to promise, how to structure a contract, or how to tell 
              a lowball offer from a fair one.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We figured it out the hard way — through missed opportunities, bad deals, and a lot of 
              community support. Along the way, we became YouTube partners, joined the YouTube Creator Panel, 
              the YouTube Livestream Panel, and the YouTube Brand Deal Panel. We earned A-list status on 
              Amazon Live — the only A-list channel dedicated to cat products — and we've been on the front 
              page of Amazon more times than we can count.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We created <a href="https://thegoodmeow.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">The GOOD Meow</a> to 
              give cat content creators a platform and a voice that goes beyond entertainment. 
              And we built UGCC so that the next creator doesn't have to figure it all out alone.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">Brands we've worked with</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {brandPartners.map((brand) => (
                <Badge key={brand} variant="secondary" className="text-sm px-3 py-1.5">
                  {brand}
                </Badge>
              ))}
              <Badge variant="secondary" className="text-sm px-3 py-1.5">+ many more</Badge>
            </div>
            <h3 className="text-base font-semibold mt-4">YouTube milestones</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "YouTube Partner Program",
                "YouTube Creator Panel member",
                "YouTube Livestream Panel member",
                "YouTube Brand Deal Panel member",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <h3 className="text-base font-semibold mt-4">Amazon Live</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "A-list status on Amazon Live",
                "Only A-list channel dedicated exclusively to cat products",
                "Featured on the front page of Amazon regularly",
                "Top 30 Amazon Pet Influencers — 2 years in a row",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Press / Credentials */}
        <div className="mb-20">
          <h2 className="text-2xl font-heading font-bold mb-6 text-center">We've been covered by</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {credentials.map(({ label, detail }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2.5 rounded-full border bg-card text-sm">
                <Star size={13} className="text-accent fill-accent" />
                <span className="font-semibold">{label}</span>
                <span className="text-muted-foreground">— {detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* The GOOD Meow + Vet Van Fleet */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          <div className="p-7 rounded-2xl border-2 border-accent/20 bg-accent/5 space-y-3">
            <div className="text-3xl">😸</div>
            <h3 className="text-xl font-heading font-bold">The GOOD Meow</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our TikTok community dedicated to positivity, cat welfare, and creator education. 
              Over 200K followers and growing — proof that cat content can be a real movement.
            </p>
            <a href="https://thegoodmeow.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="rounded-full border-accent/30 text-accent hover:bg-accent hover:text-white mt-2">
                <ExternalLink size={13} className="mr-1.5" /> thegoodmeow.com
              </Button>
            </a>
          </div>
          <div className="p-7 rounded-2xl border-2 border-red-200 bg-red-50/30 space-y-3">
            <div className="text-3xl">🚐</div>
            <h3 className="text-xl font-heading font-bold">Vet Van Fleet</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our nonprofit initiative bringing free mobile veterinary care directly to cats who need it most. 
              When creators win on UGCC, the cats win too.
            </p>
            <a href="https://vetvanfleet.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="rounded-full border-red-300 text-red-600 hover:bg-red-500 hover:text-white mt-2">
                <Heart size={13} className="mr-1.5" /> vetvanfleet.com
              </Button>
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-heading font-bold">Follow along</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <a href="https://francesandfamily.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-full border-2 hover:border-accent hover:text-accent">
                <Cat size={14} className="mr-2" /> francesandfamily.com
              </Button>
            </a>
            <a href="https://thegoodmeow.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-full border-2 hover:border-accent hover:text-accent">
                <ExternalLink size={14} className="mr-2" /> thegoodmeow.com
              </Button>
            </a>
            <a href="https://amazon.com/live/coolcatstuff" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-full border-2 hover:border-accent hover:text-accent">
                <Play size={14} className="mr-2" /> Amazon Live
              </Button>
            </a>
            <a href="https://coolcatstuff.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-full border-2 hover:border-accent hover:text-accent">
                <ExternalLink size={14} className="mr-2" /> coolcatstuff.com
              </Button>
            </a>
          </div>
          <p className="text-sm text-muted-foreground pt-4 max-w-lg mx-auto">
            Cats always land on their feet. We're building UGCC so that cat content creators do too — 
            with the right tools, the right knowledge, and a community behind them.
          </p>
        </div>

      </div>
    </Layout>
  );
}
