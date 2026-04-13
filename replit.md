# UGCC — User Generated Cat Content

## Overview

UGCC (User Generated Cat Content) is the all-in-one platform for cat content creators — a toolkit, community hub, and self-governing creator network rolled into one. Built by cat creators, for cat creators. The platform is designed to integrate with coolcatstuff.com and be deployable as both a web app and a mobile app (via React Native or PWA).

**Brand Philosophy:** Each one teach one. No contracts — we get you contracts. Cat only. Community first.

### Core Features

**Creator Toolkit:**
- Media Kit & Rate Card Builder — multi-step form with live preview and PDF export
- Rate Reality Checker — compare rates against cat creator benchmarks from the community
- Deal Analyzer — AI-powered analysis of brand emails, contracts, and DMs (red flags, missing terms, counter-offer templates)
- Analytics Dashboard — media kit view tracking, engagement metrics
- AI-powered contract and proposal generation (via Deal Analyzer)

**Community:**
- Cat-specific niche groups (Beginners Circle, Brand Deals, TikTok & Reels, Rescue & Advocacy, Pro Creators, Cat Breeds, UGC & Content, Brand Hub)
- Community feed with posts, likes, and comments
- Anonymous rate sharing — submit and view cat creator rates by platform, follower range, and deliverable
- Deal voting — post a brand offer, community votes "Take It / Pass / Negotiate"
- Upvote/downvote job trust scores

**Opportunities Board:**
- Browse cat brand deals, UGC campaigns, collaborations, and casting calls
- Community trust scores on every opportunity
- Filter by cat niche, platform, pay type, follower requirements
- Apply directly with media kit integration
- Seeded with real cat brand opportunities (Chewy, Meow Mix, Litter-Robot, Royal Canin, etc.)

**Brand Hub:**
- Browse cat brands actively looking for content partners
- Brands can list campaigns and post active opportunities
- Direct creator-to-brand contact (no agency middleman)
- Brand profiles with budgets, requirements, and lookingFor content types

**Education Hub (`/learn`):**
- Cat creator lessons organized by category: Getting Started, Video & Content, Monetization, Platforms, Business Tools, Brand Deals
- Quick reference cards: minimum rates by tier, engagement benchmarks, red flags, hook formulas, media kit must-haves, contract non-negotiables
- Lessons covering: hooks, watch time, algorithms, rate negotiation, media kits, contracts, cold outreach, finding brands

**Causes (`/causes`):**
- Vet Van Fleet — nonprofit initiative for free mobile veterinary care for cats in need
- Creator fundraiser tools and awareness campaign integration
- Support for TNR programs, shelters, and legislative advocacy

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with CSS variables — orange/amber accent (#f97316 equivalent, hsl(25 95% 53%)) for cat-inspired warmth
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins for Replit integration

### Pages & Routes
- `/` — Home page (UGCC landing page)
- `/builder` — Media Kit & Rate Card Builder
- `/dashboard` — Creator Dashboard
- `/analytics` — Media Kit Analytics
- `/community` — Community feed, groups, anonymous rate sharing
- `/jobs` — Opportunities Board (cat brand deals)
- `/brands` — Brand Hub (cat brand directory)
- `/learn` — Education Hub (lessons and quick references)
- `/causes` — Vet Van Fleet + causes
- `/deal-translator` — Deal Analyzer (AI)
- `/rate-checker` — Rate Reality Checker

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Authentication**: Replit Auth integration using OpenID Connect with Passport.js
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema location**: `shared/schema.ts` (shared between frontend and backend)

### AI Integration
- **Provider**: OpenAI (via Replit AI Integration)
- **Use cases**: Deal/contract analysis, red flag detection, counter-offer generation
- **Location**: `server/deal-analyzer.ts`

### Key Data Models
- `creatorProfiles` — Creator profile with bio, niche, location, website, media kit data
- `platformConnections` — Social platform handles, follower counts, engagement rates, cached stats
- `rateCards` — Creator rate card data with template styles
- `nicheGroups` — Cat creator community groups (beginners, brand deals, rescue, etc.)
- `groupMemberships` — Group join/leave tracking
- `communityPosts` — Feed posts with deal question voting support
- `postComments` / `postLikes` — Post engagement
- `jobs` — Brand opportunities with trust scores, payment types, verification status
- `jobApplications` — Creator applications with pitch messages
- `jobVotes` — Community upvote/downvote on opportunities
- `pricingBenchmarks` — Industry rate benchmarks for cat content by platform/tier
- `anonymousRates` — Community-submitted anonymous rate data
- `dealAnalyses` — AI analysis results for brand emails/contracts
- `mediaKitViews` — Analytics tracking for media kit views

### Seed Data
- Cat-specific community groups (8 groups)
- Cat content pricing benchmarks across Instagram, TikTok, YouTube, UGC
- Sample cat brand opportunities (Chewy, Meow Mix, Litter-Robot, Royal Canin, PetSmart, etc.)
- Re-seeds automatically when old generic data is detected (checks for `beginners-circle` slug)

## Design System
- **Brand Name**: UGCC (User Generated Cat Content)
- **Tagline**: "The Cat Creator Network"
- **Primary Accent**: Orange (#f97316, hsl(25 95% 53%)) — warm, cat-inspired energy
- **Background**: Warm off-white (hsl(30 20% 98%))
- **Font Heading**: Outfit (extrabold for headings)
- **Font Body**: Plus Jakarta Sans
- **Logo**: Cat icon from lucide-react

## External Integrations
- **coolcatstuff.com** — Partner site, linked in footer
- **Social Cat** — Referenced as reputable opportunity source in job board
- **Vet Van Fleet** — Nonprofit partner featured in /causes page
