import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Builder from "@/pages/builder";
import Dashboard from "@/pages/dashboard";
import Community from "@/pages/community";
import Jobs from "@/pages/jobs";
import DealTranslator from "@/pages/deal-translator";
import RateChecker from "@/pages/rate-checker";
import Analytics from "@/pages/analytics";
import Learn from "@/pages/learn";
import Causes from "@/pages/causes";
import Brands from "@/pages/brands";
import About from "@/pages/about";
import Messages from "@/pages/messages";
import Setup from "@/pages/setup";
import ProfilePublic from "@/pages/profile-public";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/builder" component={Builder} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/community" component={Community} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/deal-translator" component={DealTranslator} />
      <Route path="/rate-checker" component={RateChecker} />
      <Route path="/learn" component={Learn} />
      <Route path="/causes" component={Causes} />
      <Route path="/brands" component={Brands} />
      <Route path="/about" component={About} />
      <Route path="/messages" component={Messages} />
      <Route path="/setup" component={Setup} />
      <Route path="/p/:username" component={ProfilePublic} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
