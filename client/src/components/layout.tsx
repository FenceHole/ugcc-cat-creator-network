import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { 
  Menu, 
  X, 
  Cat, 
  Home,
  LayoutDashboard,
  Users,
  Briefcase,
  BookOpen,
  Heart,
  TrendingUp,
  FileText,
  DollarSign,
  Store,
  ChevronDown,
  MessageSquare,
  Info,
  LogOut,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/community", label: "Community", icon: Users },
  { href: "/jobs", label: "Opportunities", icon: Briefcase },
  { href: "/brands", label: "Brand Hub", icon: Store },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/causes", label: "Causes", icon: Heart },
  { href: "/about", label: "About", icon: Info },
];

const toolLinks = [
  { href: "/builder", label: "Kit Builder", icon: FileText, desc: "Build your media kit & rate card" },
  { href: "/rate-checker", label: "Rate Checker", icon: DollarSign, desc: "Know your worth" },
  { href: "/deal-translator", label: "Deal Analyzer", icon: TrendingUp, desc: "Decode brand emails & contracts" },
  { href: "/analytics", label: "Analytics", icon: LayoutDashboard, desc: "Track your media kit performance" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  const { data: unreadData } = useQuery({
    queryKey: ["/api/messages/unread"],
    queryFn: async () => {
      const res = await fetch("/api/messages/unread", { credentials: "include" });
      if (!res.ok) return { count: 0 };
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.count || 0;

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-accent selection:text-white flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-md shadow-accent/30 transition-transform group-hover:scale-105">
              <Cat size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-heading font-extrabold text-lg tracking-tight">UGCC</span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Cat Creator Network</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {navLinks.slice(0, 4).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive(href)
                    ? "bg-accent/10 text-accent font-semibold"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  Tools <ChevronDown size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Creator Toolkit</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {toolLinks.map(({ href, label, icon: Icon, desc }) => (
                  <Link key={href} href={href}>
                    <DropdownMenuItem className="cursor-pointer flex items-start gap-3 p-3">
                      <Icon size={16} className="mt-0.5 text-accent shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{label}</div>
                        <div className="text-xs text-muted-foreground">{desc}</div>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.slice(4).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive(href)
                    ? "bg-accent/10 text-accent font-semibold"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/messages">
                  <button className={`relative p-2 rounded-lg hover:bg-muted transition-colors ${isActive("/messages") ? "bg-accent/10 text-accent" : "text-muted-foreground"}`} aria-label="Messages" data-testid="nav-messages">
                    <MessageSquare size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-accent text-white text-[9px] font-bold flex items-center justify-center rounded-full px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </Link>
                <Link href="/builder" className="hidden sm:flex">
                  <Button size="sm" className="rounded-full bg-accent hover:bg-accent/90 text-white shadow-sm shadow-accent/20">
                    Build My Kit
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors text-accent" aria-label="User menu" data-testid="button-user-menu">
                      {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <User size={16} />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs text-muted-foreground truncate">{user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user.email || "My Account")}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer gap-2" data-testid="menu-dashboard">
                        <LayoutDashboard size={14} /> Dashboard
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer gap-2" data-testid="menu-profile">
                        <User size={14} /> Profile
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive" onClick={() => logout()} data-testid="button-logout">
                      <LogOut size={14} /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                size="sm"
                className="hidden sm:flex rounded-full bg-accent hover:bg-accent/90 text-white shadow-sm shadow-accent/20"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-sign-in"
              >
                Sign In
              </Button>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive(href)
                      ? "bg-accent/10 text-accent font-semibold"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t mt-2">
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Creator Tools</p>
                {toolLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive(href)
                        ? "bg-accent/10 text-accent font-semibold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                ))}
              </div>
              {user ? (
                <>
                  <Link
                    href="/messages"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive("/messages")
                        ? "bg-accent/10 text-accent font-semibold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <MessageSquare size={18} />
                    Messages
                    {unreadCount > 0 && (
                      <Badge className="ml-auto bg-accent text-white text-xs px-1.5 py-0.5">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                  <div className="pt-2 space-y-2">
                    <Link href="/builder" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full rounded-xl bg-accent hover:bg-accent/90 text-white" data-testid="mobile-button-build-kit">
                        Build My Kit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl gap-2"
                      onClick={() => { setMobileOpen(false); logout(); }}
                      data-testid="mobile-button-logout"
                    >
                      <LogOut size={16} /> Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="pt-2">
                  <Button
                    className="w-full rounded-xl bg-accent hover:bg-accent/90 text-white"
                    onClick={() => { setMobileOpen(false); window.location.href = "/api/login"; }}
                    data-testid="mobile-button-sign-in"
                  >
                    Sign In / Join
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white">
                <Cat size={16} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-extrabold text-base">UGCC</span>
                <span className="text-[9px] text-muted-foreground font-medium tracking-wider uppercase">Cat Creator Network</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              The community and toolkit built by cat content creators, for cat content creators. 
              Each one teach one. 🐱
            </p>
            <p className="text-xs text-muted-foreground">
              Proudly supporting{" "}
              <Link href="/causes" className="text-accent hover:underline font-medium">Vet Van Fleet</Link>
              {" "}— free healthcare for cats in need.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-sm">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/community" className="hover:text-foreground transition-colors">Feed & Groups</Link></li>
              <li><Link href="/jobs" className="hover:text-foreground transition-colors">Opportunities</Link></li>
              <li><Link href="/brands" className="hover:text-foreground transition-colors">Brand Hub</Link></li>
              <li><Link href="/causes" className="hover:text-foreground transition-colors">Causes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">Creator Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/builder" className="hover:text-foreground transition-colors">Kit Builder</Link></li>
              <li><Link href="/rate-checker" className="hover:text-foreground transition-colors">Rate Checker</Link></li>
              <li><Link href="/deal-translator" className="hover:text-foreground transition-colors">Deal Analyzer</Link></li>
              <li><Link href="/analytics" className="hover:text-foreground transition-colors">Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">Learn</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/learn" className="hover:text-foreground transition-colors">Education Hub</Link></li>
              <li><Link href="/learn#hooks" className="hover:text-foreground transition-colors">Hooks & Algorithms</Link></li>
              <li><Link href="/learn#monetization" className="hover:text-foreground transition-colors">Monetization</Link></li>
              <li><Link href="/learn#negotiation" className="hover:text-foreground transition-colors">Negotiation 101</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About UGCC</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-10 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© 2025 UGCC — User Generated Cat Content. All rights reserved.</span>
          <span>A proud partner of <a href="https://coolcatstuff.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">coolcatstuff.com</a></span>
        </div>
      </footer>
    </div>
  );
}
