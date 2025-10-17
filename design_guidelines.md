# Design Guidelines: Tennis Sponsorship Platform

## Design Approach: Reference-Based
**Primary Inspiration:** Patreon (sponsorship model) + Strava (athlete profiles) + Stripe (clean payment UX)

This platform bridges emotional connection with functional utility - sponsors need to feel inspired to support athletes, while both users need efficient dashboards. We'll create a premium, aspirational aesthetic that elevates the sport's prestige.

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 142 76% 36% (Tennis court green - sophisticated, sporty)
- Secondary: 220 13% 18% (Deep charcoal for text)
- Accent: 25 95% 53% (Energetic orange for CTAs)
- Background: 0 0% 98%
- Surface: 0 0% 100%

**Dark Mode:**
- Primary: 142 60% 45%
- Secondary: 220 13% 91%
- Accent: 25 95% 58%
- Background: 220 13% 10%
- Surface: 220 13% 14%

**Supporting Colors:**
- Success: 142 76% 36%
- Warning: 38 92% 50%
- Error: 0 84% 60%
- Info: 217 91% 60%

### B. Typography
- **Headings:** Inter (700, 600) - clean, modern, athletic
- **Body:** Inter (400, 500) - excellent readability
- **Data/Stats:** JetBrains Mono (500) - for scores, rankings

**Scale:**
- Hero: text-6xl to text-7xl
- Section Headers: text-4xl to text-5xl
- Card Titles: text-xl to text-2xl
- Body: text-base to text-lg
- Captions: text-sm

### C. Layout System
**Spacing:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Container: max-w-7xl for main content
- Cards: p-6 to p-8
- Section padding: py-16 to py-24
- Grid gaps: gap-6 to gap-8

### D. Component Library

**Navigation:**
- Sticky header with blur backdrop (backdrop-blur-md bg-white/80)
- Clean iconography from Heroicons
- User profile dropdown with avatar
- Mobile: Slide-in drawer navigation

**Player Profile Cards:**
- Large athlete photo with gradient overlay
- Stats overlay (ranking, recent wins)
- Sponsorship progress bar
- Prominent "Sponsor" CTA
- Glass-morphism effect for overlays

**Sponsorship Components:**
- Tiered sponsorship cards (Travel, Gear, Stipend, Full Support)
- Each tier shows impact and amount
- Visual icons for each sponsorship type
- Progress indicators for goals

**Dashboards:**
- Analytics cards with subtle shadows (shadow-sm)
- Data visualization with chart.js
- Activity feed with timeline design
- Quick action buttons

**Forms:**
- Floating labels
- Clear validation states
- Multi-step progress indicator for player onboarding
- Payment form with Stripe Elements styling

**Data Display:**
- Tournament results table with expandable rows
- Upcoming events calendar view
- Sponsorship history timeline
- Achievement badges

### E. Animations
**Strategic Use Only:**
- Smooth page transitions (200ms ease-in-out)
- Card hover lift effect (translateY(-4px))
- Loading skeletons for async content
- Progress bar fills for sponsorship goals
- NO scroll animations or excessive motion

## Page-Specific Designs

### Landing Page
**Hero Section (90vh):**
- Full-bleed athlete action photo (tennis player mid-serve)
- Bold headline: "Empower Tomorrow's Tennis Champions"
- Dual CTAs: "I'm a Player" (primary) + "Become a Sponsor" (outline with blur)
- Trust indicator: "Supporting 500+ Athletes"

**Sections (multi-column where appropriate):**
1. How It Works (3-column grid: Player signs up → Profile → Get sponsored)
2. Featured Athletes (masonry grid, 3 columns desktop, stacked mobile)
3. Sponsorship Impact (2-column: Stats + Testimonial)
4. Pricing Tiers (3-column cards with highlight on middle tier)
5. Community Showcase (full-width scrolling banner of athlete photos)
6. Final CTA (centered, single column with strong visual)

### Player Dashboard
- Welcome banner with current sponsorship status
- 2-column layout: Profile completion widget + Recent activity
- Sponsorship requests table
- Upcoming tournaments calendar
- Analytics: Views, sponsor interest, funds received

### Sponsor Dashboard  
- 3-column metrics: Total contributed, Athletes supported, Impact score
- Sponsored athletes grid (4 columns desktop)
- Contribution history timeline
- Discover new athletes section

### Player Profile (Public)
- Hero: Large athlete photo with stats overlay
- About section with bio
- Tournament results table
- Upcoming events
- Sponsorship needs cards (grid layout)
- Sponsor CTA sticky footer on scroll

## Images Strategy
**Must Include Images:**
- Landing hero: Dynamic tennis action shot
- Featured athlete cards: Professional headshots
- Player profiles: 2-3 photos (portrait, action shot, podium/achievement)
- Sponsorship impact: Real sponsor/player interaction photos
- Trust indicators: Logo wall of supported tournaments/organizations

**Image Treatment:**
- Use subtle gradients on overlays (from transparent to primary/20)
- Maintain 16:9 or 4:3 ratios for consistency
- Apply subtle blur to backgrounds when text overlays needed
- Hero images should be high-impact, professional sports photography

## Accessibility & Consistency
- Maintain WCAG AA contrast ratios minimum
- Dark mode across entire application including forms
- Focus states with 2px ring in accent color
- Touch targets minimum 44x44px
- Semantic HTML throughout

**This design creates a premium, trustworthy platform that inspires sponsors while empowering athletes with professional presentation tools.**