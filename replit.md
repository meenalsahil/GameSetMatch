# AceSponsors - Tennis Player Sponsorship Platform

## Project Overview
AceSponsors is a sponsorship platform connecting tennis players at all competitive levels (ATP, Challenger, ITF) with sponsors. Players can showcase their profiles with tournament results and upcoming events while requesting sponsorships for travel, hotel, gear, and monthly stipends.

**Business Model:**
- **Players:** 3-month free trial, then paid subscription
- **Sponsors:** Free to join, can contribute using miles, hotel points, or direct payment
- **Benefit:** Community service recognition for sponsors

## Technology Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Express.js, Node.js
- **Routing:** Wouter
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** TanStack Query (React Query v5)
- **Payments:** Stripe integration (configured)
- **Storage:** In-memory storage (MemStorage) - database implementation planned for Phase 2

## Project Structure

### Routes
- `/` - Landing page with hero, featured players, and how it works preview
- `/players` - Browse all players with search/filter
- `/player/:id` - Individual player profile
- `/how-it-works` - Platform explanation for players and sponsors
- `/signup/player` - Multi-step player registration
- `/signup/sponsor` - Multi-step sponsor registration

### User Flows

#### Player Journey
1. **Discovery:** Land on homepage → Read "How It Works"
2. **Signup:** Click "I'm a Player" → Multi-step form:
   - Step 1: Account (email, password, full name)
   - Step 2: Profile (location, ranking, specialization)
   - Step 3: Bio (tennis story and goals)
3. **Confirmation:** Application submitted → Review pending
4. **Profile:** Once approved, profile visible to sponsors

#### Sponsor Journey
1. **Discovery:** Land on homepage → Browse featured players
2. **Signup:** Click "Become a Sponsor" → Multi-step form:
   - Step 1: Account (email, password, name, organization)
   - Step 2: Preferences (contribution types, player preferences)
3. **Confirmation:** Account created → Can browse and sponsor players
4. **Sponsorship:** View player profiles → Choose sponsorship type → Complete payment

### Navigation Structure
**Header Links:**
- Home (/)
- Browse Players (/players)
- How It Works (/how-it-works)
- Sign In (not yet implemented)
- Get Started (not yet implemented)

**CTA Buttons:**
- Hero: "I'm a Player" → /signup/player
- Hero: "Become a Sponsor" → /signup/sponsor
- How It Works: "Sign Up as a Player" → /signup/player
- How It Works: "Become a Sponsor" → /signup/sponsor

## Key Design Decisions

### Browse Players vs Featured Players
- **Featured Players:** Curated subset (first 4 players) displayed on homepage
  - Purpose: Highlight specific players to sponsors
  - Selection: Manual curation (in future: based on criteria like urgent needs, recent activity, or admin selection)
- **Browse Players:** Full list of all players (currently 12 sample players)
  - Purpose: Allow sponsors to search/filter all available players
  - Features: Search by name/location, filter capabilities

### Sample Data Convention
- **Player names:** Using generic identifiers (Player A, B, C, etc.) instead of real names to avoid copyright/privacy issues
- **No metrics:** Removed funding progress, amounts, and platform statistics until real data exists (Phase 2)
- **No images:** Using avatar icons only to avoid copyright concerns

### Messaging Guidelines
- **Inclusive language:** Emphasize "all levels" (ATP, Challenger, ITF) not just "future champions"
- **Accurate representation:** No misleading metrics or fake success stories
- **Clear value prop:** Focus on actual benefits (travel, gear, stipends) not vague promises

## Phase 2 Features (Not Yet Implemented)
- User authentication system
- Database integration (replacing in-memory storage)
- Real player data and profiles
- Actual Stripe payment processing
- Sponsorship tracking and management
- Player/sponsor dashboards
- Admin panel for featured player curation
- Email notifications
- Tournament results integration
- Analytics and metrics

## Color Scheme (Tennis-Themed)
- **Primary:** Tennis court green (#16A34A, #22C55E)
- **Accent:** Tennis ball orange (#F97316, #FB923C)
- **Background:** Neutral whites/grays
- See `design_guidelines.md` for complete design system

## Important Notes
- All current player data is sample/demonstration only
- Payment processing is configured but not fully integrated
- This is a prototype/MVP - not production-ready
- No real sponsorships should be processed until Phase 2 completion
