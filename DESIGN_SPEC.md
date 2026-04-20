# Challenge Tracker - Design Specification

> A fitness accountability app where groups of friends create challenges, log daily workouts, track streaks, and accumulate financial penalties for missed days.

---

## 1. Design Philosophy

The visual language is built around an **"effort → reward" arc**:

- **Anticipation**: Pulsing hero card invites today's workout log
- **Effort**: Expanded form with activity selection, metadata, photo upload
- **Reward**: Confetti animation, checkmark draw, "You crushed it!" confirmation

The palette conveys **energy and urgency** (orange primary) balanced with **achievement and calm** (teal/green secondary).

---

## 2. Color System

### 2.1 Semantic Tokens (CSS Custom Properties)

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--primary` | 16 100% 60% | `#FF6B35` | Main CTAs, active states, focus rings |
| `--primary-foreground` | 0 0% 100% | `#FFFFFF` | Text on primary backgrounds |
| `--secondary` | 164 100% 39% | `#00C49A` | Recovery indicators, participant avatars |
| `--secondary-foreground` | 0 0% 100% | `#FFFFFF` | Text on secondary backgrounds |
| `--accent` | 141 73% 42% | `#1DB954` | Success states, checkmarks, streaks, completions |
| `--accent-foreground` | 0 0% 100% | `#FFFFFF` | Text on accent backgrounds |
| `--background` | 0 0% 96% | `#F5F5F5` | Page background |
| `--foreground` | 234 45% 14% | `#1A1A2E` | Primary text, headings |
| `--card` | 0 0% 100% | `#FFFFFF` | Card surfaces |
| `--card-foreground` | 234 45% 14% | `#1A1A2E` | Card text |
| `--muted` | 0 0% 91% | `#E8E8E8` | Disabled elements, inactive states |
| `--muted-foreground` | 234 10% 46% | `#6B6B7D` | Secondary text, labels, helper text |
| `--destructive` | 3 100% 59% | `#FF3B30` | Warnings, missed workouts, debt |
| `--destructive-foreground` | 0 0% 100% | `#FFFFFF` | Text on destructive backgrounds |
| `--warning` | 30 100% 50% | `#FF9500` | Caution states, penalty amounts |
| `--border` | 0 0% 86% | `#DBDBDB` | 1px dividers, card borders |
| `--input` | 0 0% 86% | `#DBDBDB` | Form input borders |
| `--ring` | 16 100% 60% | `#FF6B35` | Focus ring (matches primary) |
| `--radius` | — | `6px` | Global border radius |

### 2.2 Gradients

| Name | Value | Usage |
|------|-------|-------|
| `--gradient-primary` | `linear-gradient(135deg, #FF6B35, #FF3B30)` | Primary buttons, FAB, hero sections |
| `--gradient-secondary` | `linear-gradient(135deg, #00C49A, #1DB954)` | Secondary actions, recovery states |
| `--gradient-gold` | `linear-gradient(135deg, hsl(43 96% 56%), hsl(30 100% 50%))` | Streak indicators (when streak > 0) |
| `--gradient-silver` | `linear-gradient(135deg, hsl(210 10% 70%), hsl(210 5% 50%))` | Unused currently |
| `--gradient-bronze` | `linear-gradient(135deg, hsl(25 60% 50%), hsl(15 70% 40%))` | Unused currently |

### 2.3 Color Logic by Context

- **Card left borders** (3px solid): Primary for active, destructive for missed, accent for completed, secondary for recovery
- **Debt values**: Accent (green checkmark) when $0, destructive (red + warning icon) when > $0
- **Streak badge**: Gold gradient when active, muted when 0
- **Leaderboard 1st place**: Primary gradient background + border highlight

---

## 3. Typography

### 3.1 Font Stack

| Role | Family | Weights | Source |
|------|--------|---------|--------|
| Primary | Space Grotesk | 400, 500, 600, 700 | Google Fonts |
| Monospace (numbers) | JetBrains Mono | 500, 700 | Google Fonts |
| Fallback | system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif | — | System |

### 3.2 Type Scale

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Hero title | `text-5xl` / `md:text-6xl` | 900 (black) | Gradient text effect |
| Page title | `text-3xl` | 900 (black) | Challenge name headings |
| Section headers | `text-lg` / `md:text-2xl` | 700 (bold) | — |
| Subsection headers | `text-base` | 700 (bold) | — |
| Body text | `text-base` (16px) | 400 | — |
| Labels / secondary | `text-sm` (14px) | 500 | — |
| Badges / helper | `text-xs` (12px) | 500-600 | Smallest size used |
| Stat numbers | `text-2xl` | 700 | JetBrains Mono, tabular-nums, letter-spacing: -0.02em |

---

## 4. Component Inventory

### 4.1 Pages

| Component | Purpose | Route |
|-----------|---------|-------|
| **LandingPage** | Unauthenticated marketing page with hero, features, how-it-works, CTA | `/` (unauthenticated) |
| **ChallengeDashboard** | Main hub — lists challenges, create/join forms | `/` (authenticated) |
| **ChallengeDetail** | Single challenge view — delegates to UnifiedDashboard | `/:id` |
| **JoinChallengePage** | Join via invite link | `/join/:inviteCode` |

### 4.2 Core Components

#### HeroActionCard
- **Purpose**: Primary daily action — log today's workout
- **States**:
  - *Already logged*: Compact success card, "You crushed it!" message, "Log Another" option
  - *Not logged*: Pulsing gradient button inviting tap/click to expand
  - *Form expanded*: Full modal overlay with backdrop blur
  - *Success*: Confetti animation, checkmark icon, activity summary, WhatsApp share button
- **Form fields**: Activity type grid (emoji + label, 4-col), custom activity name, metadata (duration, distance, sets/reps), muscle group multi-select (gym only), photo upload with drag-drop and preview, notes textarea
- **Upload**: Progress bar during photo upload

#### QuickStatsBar
- **Purpose**: 4 key metrics at a glance
- **Layout**: `grid-cols-2` on mobile, `grid-cols-4` on desktop
- **Cards**: Glass effect, hover lift (-translate-y-0.5), gradient icon box
- **Metrics**: Week number, Current streak, Your debt, Total workouts

#### CompactWeeklyGrid
- **Purpose**: Weekly workout matrix — all participants x all days
- **Layout**: Horizontally scrollable table (min-width 500px)
- **Header**: Week nav arrows (left/right), "Week N" title, "Live" badge for current week, date range
- **Cells**:
  - Checked: Green circle + checkmark
  - Today/not checked: Dashed border (clickable for admin)
  - Past/not checked: Red X (clickable for admin)
  - Future: Disabled gray circle
- **Footer**: Days remaining, debt/on-track badge
- **Admin features**: Optimistic updates, bulk-check column, individual cell toggle

#### DebtScoreboard (Leaderboard)
- **Purpose**: Participants ranked by total workouts
- **Row structure**: Rank (medal emoji for top 3), gradient avatar with initials, name + streak badge, total workouts, debt status
- **1st place**: Highlighted with primary gradient background
- **Expandable**: Week-by-week breakdown table (color-coded: green if met, red if missed)
- **Footer row**: Grand total + debt pool calculation

#### ChallengeList
- **States**: Loading (3 skeleton cards with stagger), Error (red alert + retry), Empty (icon + heading + two-button CTA), Populated (staggered fade-in)
- **Card**: Title + status badge, description (line-clamp-1), 3 info badges (workouts/week, penalty, participants), hover arrow

#### AdminPanel
- **Layout**: Fixed right-side slide-out panel (z-50), backdrop overlay
- **Tabs**: Dashboard, Settings
- **AdminDashboard**: Participants behind this week (red accent), all participants with stats, recent activity feed
- **ChallengeSettings**: Edit name/description/rules/dates, danger zone (archive/delete)

#### CreateChallengeForm / JoinChallengeForm
- **CreateChallengeForm**: Card container, 2-column grid for number/date fields, field-level validation errors
- **JoinChallengeForm**: ⚠️ Currently uses hardcoded dark theme (slate-900) instead of design system — inconsistency

---

## 5. Layout Architecture

### 5.1 Page Structure

```
<div class="challenge-tracker" style="min-h-screen; background: var(--background)">
  ├── Header (border-bottom divider)
  │   ├── Portfolio breadcrumb link
  │   ├── Time-aware greeting ("Good morning, Nelson")
  │   ├── Gradient icon box (primary gradient + lightning SVG)
  │   └── Clerk UserButton (avatar)
  │
  └── Main Content (max-w-3xl, px-6, py-6)
      └── <Routes> → ChallengeList | ChallengeDetail | JoinChallengePage
```

### 5.2 Challenge Detail Layout

```
UnifiedDashboard
├── Header (sticky look, border-bottom)
│   ├── Back link (hover: -translate-x)
│   ├── Status badge (pulse dot if active)
│   └── Action buttons (Leave, Invite, Admin toggle)
├── Title (centered, text-3xl)
├── HeroActionCard
├── QuickStatsBar
├── CompactWeeklyGrid
├── DebtScoreboard
└── AdminPanel (conditional slide-out)
```

### 5.3 Container Widths

- Max content width: `max-w-3xl` (48rem / 768px)
- Admin panel: `max-w-md` (28rem / 448px)
- Forms: `max-w-md` centered
- Weekly grid table: `min-w-[500px]` with overflow-x-auto

---

## 6. Animations & Transitions

### 6.1 Keyframe Animations

| Name | Duration | Effect | Applied to |
|------|----------|--------|-----------|
| `fade-in-up` | 300ms ease-out | opacity 0→1, translateY 12→0 | Sections, modals, cards |
| `stagger-children` | 60ms delay per child | Cascading fade-in-up | ChallengeList items, QuickStatsBar |
| `shimmer` | 1.2s infinite | Background gradient sweep | Skeleton loading placeholders |
| `streak-danger` | 2s infinite | Red box-shadow pulse | Missed workout indicators |
| `check-draw` | 150ms ease-out | SVG stroke-dasharray reveal | Checkmarks on log |
| `completion-pulse` | 400ms ease-out | Green box-shadow expand | Completion confirmation |
| `progress-fill` | Variable | Width 0→target with overshoot | Upload progress bar |

### 6.2 Interaction Transitions

| Trigger | Effect | Duration |
|---------|--------|----------|
| Button press | `scale(0.96)` | 120ms |
| Card hover | `-translate-y-0.5` (subtle lift) | 200ms |
| Back link hover | `-translate-x-0.5` | 200ms |
| Icon hover | `rotate-45` | 200ms |
| Opacity hover | `opacity-80` | 150ms |
| Focus visible | 2px outline, primary color, 2px offset | Instant |

### 6.3 Special Effects

- **Confetti**: Triggered on workout log success, uses app colors (orange, green, teal)
- **Pulsing dot**: CSS `animate-pulse` on "Active" status badge
- **Loading spinner**: Gradient mask + pulse glow for dashboard loading

---

## 7. Responsive Behavior

### 7.1 Breakpoints (Tailwind defaults)

| Breakpoint | Width | Key changes |
|------------|-------|-------------|
| Default (mobile) | < 768px | Single column layouts, 2-col stats grid |
| `md` | ≥ 768px | 4-col stats grid, 2-col feature grid, larger headings |
| `lg` | ≥ 1024px | 4-col feature grid on landing page |

### 7.2 Mobile Adaptations

- QuickStatsBar: 2x2 grid → 1x4 row
- Weekly grid: Horizontal scroll with min-width 500px
- Forms: 2-column fields maintained (compact enough)
- Modals: `max-w-md w-full mx-4` (margin on screen edges)
- Activity type grid: 4 columns maintained (small emoji tiles)
- Landing page features: Stack vertically

---

## 8. State-Dependent UI

### 8.1 Authentication

| State | Renders |
|-------|---------|
| Loading | Skeleton shimmer placeholders (no spinners) |
| Unauthenticated | LandingPage with Sign In / Sign Up (Clerk modals) |
| Authenticated | ChallengeDashboard |

### 8.2 Data States

| State | Visual Treatment |
|-------|-----------------|
| Loading | Skeleton cards with stagger animation (shimmer gradient) |
| Empty (no challenges) | Centered card: icon + "No challenges yet" + Create/Join buttons |
| Error | Red alert box with error message + Retry button |
| Success (workout logged) | Confetti + checkmark draw + summary card + WhatsApp share |

### 8.3 Challenge Status

| Status | Badge Color | HeroActionCard | Weekly Grid |
|--------|-------------|----------------|-------------|
| Active | Orange + pulse dot | Visible (log workouts) | Interactive |
| Upcoming | Amber/Warning | Hidden | View only |
| Completed | Muted gray | Hidden | View only (history) |

---

## 9. Icons

- **Library**: Heroicons (inline SVGs with `stroke="currentColor"`)
- **Sizes**: 12px (`w-3`), 16px (`w-4`), 20px (`w-5`), 24px (`w-6`)
- **Emojis**: Used for activity types (🏃🚶🚴🏊🏋️🧘🤸⛰️💃🥋🔥🙆⚡), leaderboard medals (🥇🥈🥉), streak indicator (🔥)

---

## 10. Glass / Surface Effects

| Class | Properties | Usage |
|-------|-----------|-------|
| `.glass` | `background: rgba(255,255,255,0.85)`, `backdrop-filter: blur(12px)`, `border: 1px solid rgba(0,0,0,0.06)` | Modals, feature cards, stat cards |
| `.card` | `background: hsl(var(--card))`, `border: 1px solid hsl(var(--border))`, `border-radius: var(--radius)` | Standard content containers |
| `.card-accent-left` | 3px left border in semantic color | Status-coded cards |

---

## 11. Known Issues & Inconsistencies

1. **JoinChallengeForm** uses hardcoded dark theme (`bg-slate-900`, `text-white`, purple buttons) instead of the design system tokens — visually inconsistent with the rest of the app.
2. **`prefers-reduced-motion`** is not implemented — all animations run regardless of user preference.
3. **Icon-only buttons** (close, nav arrows) lack `aria-label` attributes — poor screen reader experience.
4. **Muted foreground text** (`#6B6B7D` on white) has ~3.5:1 contrast — borderline WCAG AA for small text.
5. **Gradient silver/bronze tokens** are defined but unused.
6. **Some clickable divs** use `role="button"` instead of native `<button>` elements.

---

## 12. Design System Summary

| Aspect | Approach |
|--------|----------|
| Styling | Tailwind utilities + CSS custom properties + inline styles |
| Component library | None — all custom React components |
| Theme | Light only (no dark mode) |
| Layout | Flexbox + CSS Grid, max-w-3xl content container |
| Motion | CSS keyframes + Tailwind transition utilities |
| Auth UI | Clerk (hosted modals for sign-in/sign-up) |
| Icons | Heroicons (inline SVG) + Emoji |
| Fonts | Space Grotesk (UI) + JetBrains Mono (numbers) |
| Border radius | Global 6px |
