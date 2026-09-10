# LifeOS - Design Document

## Overview
- **Motion Style**: Cinematic depth with liquid 3D transforms and orchestrated micro-interactions
- **Animation Intensity**: Ultra-Dynamic
- **Technology Stack**: CSS Animations, GSAP ScrollTrigger, Three.js (hero particles), Custom Shaders

## Brand Foundation

### Colors

**Primary Colors:**
- Primary Blue: #3880ff
- Secondary Blue: #5260ff
- Dark Blue: #1a1a2e
- Light Blue: #e0e7ff

**Accent Colors:**
- Success Green: #2dd36f
- Warning Orange: #ffc409
- Danger Red: #eb445a
- Purple: #6c5ce7
- Teal: #00cec9
- Pink: #fd79a8

**Background Colors:**
- Dark Background: #0f0f1a
- Dark Card: #16162a
- Dark Border: #2a2a4a
- Light Background: #f5f7fa
- Light Card: #ffffff
- Light Border: #e1e8ed

**Text Colors:**
- Dark Mode Text: #ffffff
- Dark Mode Muted: #a0a0b0
- Light Mode Text: #1a1a2e
- Light Mode Muted: #6b7280

### Typography

**Font Families:**
- Primary: "Inter" (weights: 300, 400, 500, 600, 700)
- Display: "Space Grotesk" (weights: 400, 500, 600, 700)

**Font URLs:**
```
Google Fonts: https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap
```

**Font Sizes:**
- H1: 48px/56px (mobile: 32px/40px)
- H2: 36px/44px (mobile: 28px/36px)
- H3: 28px/36px (mobile: 24px/32px)
- H4: 22px/30px (mobile: 20px/28px)
- H5: 18px/26px
- H6: 16px/24px
- Body: 16px/24px
- Small: 14px/20px
- Tiny: 12px/16px

---

## Global Motion System

### Animation Timing Library

**Custom Easing Functions:**
```css
--ease-expo-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-expo-in: cubic-bezier(0.7, 0, 0.84, 0);
--ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-dramatic: cubic-bezier(0.87, 0, 0.13, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-liquid: cubic-bezier(0.23, 1, 0.32, 1);
```

**Duration Scale:**
- Micro: 150ms (hover states, micro-interactions)
- Fast: 300ms (button clicks, small transitions)
- Medium: 500ms (card animations, reveals)
- Slow: 800ms (section transitions, dramatic reveals)
- Cinematic: 1200ms (hero animations, page transitions)
- Ambient: 8000-20000ms (continuous floating, breathing)

**Stagger Patterns:**
- Cascade: 80ms between elements (top-to-bottom reveals)
- Ripple: 100ms from center outward
- Wave: 120ms with sine-wave offset
- Dramatic: 150ms for impact moments

### Continuous Ambient Effects

**Floating Motion System:**
- All cards have subtle floating animation
- Y-axis oscillation: ±8px over 6s
- Rotation micro-wobble: ±1deg synchronized
- Each card has unique phase offset (0-4s)

**Living Gradients:**
- Background gradients slowly shift hue ±15deg over 15s
- Accent elements pulse opacity 0.8-1.0 over 4s
- Glow intensities breathe with 5s cycle

### Scroll Engine Configuration

**Parallax Layers:**
- Layer 1 (Background): 0.2x scroll speed
- Layer 2 (Decorative): 0.5x scroll speed
- Layer 3 (Content): 1.0x scroll speed (normal)
- Layer 4 (Foreground accents): 1.3x scroll speed

**Pin Points:**
- Hero section: Pinned for 50vh additional scroll
- Dashboard preview: Pinned for 30vh with content reveal

**Progress-Driven Animations:**
- Section reveals triggered at 15% viewport entry
- Exit animations begin at 85% viewport exit
- Smooth scrubbing for all scroll-linked effects

---

## Section 1: Authentication Screen

### Layout
- Full-screen immersive experience
- Diagonal split composition (55% content / 45% form)
- Content area angled at 5deg, form area counter-angled
- Overlapping zones create depth

#### Spatial Composition
```
┌─────────────────────────────────────────────────────┐
│  ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱  │
│ ╱   LOGO + TAGLINE                           ╱    │
│╱    "Your Life, Organized"                   ╱     │
│     [Animated particles background]         ╱      │
│                                            ╱       │
│   Feature highlights                      ╱        │
│   • Secure                                ╱         │
│   • Simple                               ╱          │
│   • Powerful                            ╱           │
│                                        ╱            │
│┌──────────────────────────────────────┘             │
││         LOGIN FORM (floating card)                 │
││  ┌────────────────────────────────────┐            │
││  │  Email Input                        │            │
││  │  Password Input                     │            │
││  │  [  Sign In  ]                      │            │
││  │  ────── OR ──────                   │            │
││  │  [G] [Apple] [GitHub]               │            │
││  └────────────────────────────────────┘            │
└─────────────────────────────────────────────────────┘
```

### Content

**Logo Area:**
- LifeOS logo (animated SVG)
- Tagline: "Your Life, Organized"

**Login Form:**
- Heading: "Welcome Back"
- Subheading: "Sign in to continue your journey"
- Email input with floating label
- Password input with toggle visibility
- "Sign In" primary button
- "Forgot Password?" link
- Divider with "or continue with"
- Social login buttons (Google, Apple, GitHub)
- "Don't have an account? Sign Up" link

### Motion Choreography

#### Background Particle System
```
Technology: Three.js Points + Custom Shader
Particle Count: 150-200 (performance optimized)
Behavior: Slow upward drift with horizontal sine wave
Colors: Primary blue (#3880ff) at 30% opacity, white at 20%
Connection Lines: None (purely aesthetic dots)
Mouse Interaction: Subtle repulsion (50px radius, 20px max displacement)
```

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Background | Fade + Scale | opacity 0→1, scale 1.1→1 | 1200ms | 0ms | expo-out |
| Logo | SVG Draw + Fade | stroke-dashoffset, opacity | 800ms | 200ms | expo-out |
| Tagline | Split Text Reveal | y: 30→0, opacity 0→1 per char | 600ms | 400ms | expo-out |
| Feature bullets | Stagger Slide | x: -30→0, opacity 0→1 | 400ms | 500ms+80ms each | expo-out |
| Form Card | 3D Flip In | rotateY: -90→0, opacity 0→1 | 800ms | 600ms | elastic |
| Form Inputs | Stagger Rise | y: 20→0, opacity 0→1 | 400ms | 900ms+100ms each | smooth |
| Social Buttons | Pop In | scale 0→1.1→1 | 500ms | 1200ms+80ms each | bounce |

#### Form Interactions
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Input Focus | Focus | Border glow pulse, label float up | 300ms | smooth |
| Input Focus | Focus | Underline expand from center | 400ms | expo-out |
| Password Toggle | Click | Eye icon morph, ripple effect | 300ms | elastic |
| Sign In Button | Hover | Scale 1.02, glow intensify | 200ms | smooth |
| Sign In Button | Click | Ripple from click point, scale 0.98→1 | 400ms | expo-out |
| Social Buttons | Hover | Lift -4px, shadow expand | 200ms | smooth |
| Form Card | Idle | Subtle floating (y ±6px, 5s) | infinite | sine |

#### Error States
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Form Card | Shake (x: -10, 10, -10, 10, 0) | 500ms | elastic |
| Error Message | Slide down + Fade in | 300ms | expo-out |
| Input Border | Flash red, pulse glow | 400ms | smooth |

---

## Section 2: Dashboard

### Layout
- Asymmetric bento-grid with dynamic card sizing
- Cards break traditional grid with intentional overlaps
- Z-depth layering creates visual hierarchy
- Sidebar collapses to icons with hover expansion

#### Spatial Composition
```
┌─────────────────────────────────────────────────────────────────────┐
│ [≡]  LifeOS    🔍 Search...              🔔 👤 Profile    [⚙]     │
├──────────┬──────────────────────────────────────────────────────────┤
│          │  ┌─────────────────────────────────────────────────────┐ │
│  [📊]    │  │  WELCOME BACK, ALEX!              [Quick Actions]  │ │
│  [💰]    │  │  "You have 3 tasks due today"                       │ │
│  [📅]    │  └─────────────────────────────────────────────────────┘ │
│  [🔒]    │                                                          │
│  [📁]    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  [⏰]    │  │  FINANCIAL   │  │ UPCOMING     │  │  SECURITY    │   │
│  [🔔]    │  │  OVERVIEW    │  │ BILLS        │  │  SCORE       │   │
│          │  │              │  │              │  │              │   │
│  ──────  │  │  $2,450/mo   │  │  💡 Electric │  │    85/100    │   │
│  [⚙️]    │  │  [Chart]     │  │  $120 due    │  │  [Progress]  │   │
│  [🚪]    │  │              │  │  in 3 days   │  │              │   │
│          │  └──────────────┘  └──────────────┘  └──────────────┘   │
│          │                                                          │
│          │  ┌────────────────────────┐  ┌────────────────────────┐  │
│          │  │  WARRANTY EXPIRING     │  │  7-DAY TIMELINE        │  │
│          │  │  ┌──────────────────┐  │  │                        │  │
│          │  │  │ 🖥️ Monitor       │  │  │  [Visual timeline      │  │
│          │  │  │ Expires in 15d   │  │  │   with dots & lines]   │  │
│          │  │  └──────────────────┘  │  │                        │  │
│          │  └────────────────────────┘  └────────────────────────┘  │
│          │                                                          │
│          │  ┌─────────────────────────────────────────────────────┐ │
│          │  │  SMART REMINDERS                                    │ │
│          │  │  [Intelligent suggestions based on your data]       │ │
│          │  └─────────────────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────────────┘
```

### Content

**Header:**
- Hamburger menu toggle
- LifeOS logo
- Search bar with placeholder "Search anything..."
- Notification bell with badge
- Profile avatar dropdown
- Settings quick access

**Welcome Banner:**
- "Welcome back, [Name]!"
- Contextual subtitle: "You have 3 bills due this week"
- Quick action buttons: "Add Bill", "New Reminder", "Upload Doc"

**Widget Cards:**

1. **Financial Overview**
   - Title: "Monthly Spending"
   - Amount: "$2,450"
   - Change: "+12% from last month"
   - Mini donut chart

2. **Upcoming Bills**
   - Title: "Due Soon"
   - List of 3 upcoming bills with icons
   - Due dates and amounts

3. **Security Score**
   - Title: "Security Health"
   - Score: "85/100"
   - Progress ring visualization
   - "2 weak passwords" warning

4. **Warranty Expiring**
   - Title: "Warranties Expiring Soon"
   - Product cards with countdown

5. **7-Day Timeline**
   - Visual timeline with events
   - Dots connected by animated line

6. **Smart Reminders**
   - AI-suggested actions
   - "Renew your passport in 2 months"

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Header | Slide Down | y: -30→0, opacity 0→1 | 500ms | 0ms | expo-out |
| Sidebar | Slide In | x: -100→0, opacity 0→1 | 600ms | 100ms | expo-out |
| Welcome Banner | Scale + Fade | scale 0.95→1, opacity 0→1 | 500ms | 200ms | expo-out |
| Widget Cards | Stagger 3D Rise | y: 60→0, rotateX: 10→0, opacity 0→1 | 600ms | 300ms+100ms each | expo-out |
| Card Contents | Cascade Reveal | opacity 0→1, y: 20→0 | 400ms | 600ms+50ms each | smooth |
| Charts | Draw Animation | stroke-dashoffset, scale 0→1 | 800ms | 800ms | expo-out |

#### Scroll Effects
| Trigger | Element | Effect | Start | End | Values |
|---------|---------|--------|-------|-----|--------|
| Scroll | Welcome Banner | Parallax + Fade | 0% | 50% | y: 0→-30, opacity 1→0.7 |
| Scroll | Widget Cards | Staggered Parallax | 0% | 100% | y: 0→-15 each at different rates |
| Scroll | Timeline Line | Draw Progress | 0% | 100% | stroke-dashoffset sync to scroll |

#### Card Hover Effects
| Element | Animation | Values | Duration | Easing |
|---------|-----------|--------|----------|--------|
| Card | Lift + Glow | y: -8, shadow expand, border glow | 300ms | smooth |
| Card | Micro-tilt | rotateX/Y based on hover position (±3deg) | 200ms | smooth |
| Card Content | Subtle scale | scale 1.01 | 300ms | smooth |
| Chart | Pulse | scale 1.05, glow intensify | 400ms | elastic |

#### Continuous Animations
```
Security Score Ring:
- Continuous rotation: 360deg over 20s
- Pulse on score change: scale 1→1.1→1 over 600ms

Timeline Dots:
- Pulse glow: opacity 0.5→1→0.5 over 3s
- Staggered timing per dot

Notification Bell:
- Idle subtle swing: rotate ±5deg over 4s
- On notification: rapid shake + ring animation

Chart Data Points:
- Floating animation: y ±3px over 4s
- Staggered phases
```

#### Interaction Effects
| Element | Trigger | Animation | Duration |
|---------|---------|-----------|----------|
| Sidebar Item | Hover | Expand width, text fade in, icon lift | 300ms |
| Sidebar Item | Click | Ripple, active indicator slide | 400ms |
| Search Bar | Focus | Expand width, glow, placeholder fade | 300ms |
| Quick Action | Hover | Scale 1.05, icon rotate 10deg | 200ms |
| Notification | New | Badge pop + bell ring animation | 600ms |

### Advanced Effects

#### 3D Card Tilt
```
Technology: CSS transform-style: preserve-3d + JS mouse tracking
Implementation:
- Track mouse position relative to card center
- Calculate rotateX and rotateY (max ±5deg)
- Apply with transform: perspective(1000px) rotateX() rotateY()
- Smooth transition on mouse move (16ms throttle)
- Reset to neutral on mouse leave (300ms spring)
```

#### Chart Animations
```
Donut Chart:
- Segments draw in with stroke-dashoffset animation
- Each segment staggered by 150ms
- Hover: segment expands outward (translate radially)
- Center number counts up from 0

Progress Ring:
- SVG circle with animated stroke-dashoffset
- Gradient stroke that rotates slowly
- Glow filter that pulses
```

---

## Section 3: Bills & Finance

### Layout
- Split view: Summary cards top, detailed list bottom
- List items with swipe-like hover reveal actions
- Floating "Add" button with magnetic cursor attraction

#### Spatial Composition
```
┌─────────────────────────────────────────────────────────────────────┐
│  BILLS & FINANCE                                [+ Add New Bill]    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ TOTAL DUE   │  │ PAID THIS   │  │ PENDING     │  │ OVERDUE     │ │
│  │             │  │ MONTH       │  │             │  │             │ │
│  │  $1,240     │  │  $3,650     │  │    4        │  │    1        │ │
│  │             │  │             │  │             │  │  [!]        │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  [All ▼] [Category ▼] [Status ▼]              [🔍 Search...]       │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  💡  Electric Bill                    $120    Due in 3 days    ││
│  │      Category: Utilities    [Pay] [Edit] [Delete]              ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │  🏠  Rent                             $1,200   Due tomorrow    ││
│  │      Category: Housing    [Pay] [Edit] [Delete]                ││
│  │      [URGENT - Red glow border]                                ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │  📱  Phone Plan                        $45    Due in 7 days    ││
│  │      Category: Utilities    [Pay] [Edit] [Delete]              ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│                    [1] [2] [3] ... [Next →]                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Content

**Summary Cards:**
- Total Due: "$1,240"
- Paid This Month: "$3,650"
- Pending: "4 bills"
- Overdue: "1 bill" (with warning icon)

**Filter Bar:**
- Dropdown: All, Due Soon, Paid, Overdue
- Category filter
- Status filter
- Search input

**Bill Items:**
- Icon (category-based)
- Title
- Amount
- Due date with urgency indicator
- Category tag
- Action buttons (Pay, Edit, Delete)

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Header | Slide + Fade | y: -20→0, opacity 0→1 | 400ms | 0ms | expo-out |
| Summary Cards | Stagger Pop | scale 0.8→1.02→1, opacity 0→1 | 500ms | 100ms+80ms each | bounce |
| Card Numbers | Count Up | 0→value over 800ms | 800ms | 400ms | expo-out |
| Filter Bar | Slide In | x: -30→0, opacity 0→1 | 400ms | 400ms | expo-out |
| Bill Items | Stagger Slide | x: -40→0, opacity 0→1 | 400ms | 500ms+60ms each | expo-out |

#### List Item Interactions
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| List Item | Hover | Lift -4px, shadow expand, bg lighten | 200ms | smooth |
| List Item | Hover | Action buttons slide in from right | 300ms | expo-out |
| Pay Button | Hover | Scale 1.05, glow green | 200ms | smooth |
| Pay Button | Click | Ripple, checkmark morph | 400ms | elastic |
| Delete | Hover | Red glow, shake warning | 300ms | smooth |
| Urgent Item | Idle | Pulsing red border glow | 2s | sine infinite |

#### Add Button (Magnetic)
```
Technology: JS mouse tracking + CSS transform
Behavior:
- Button has magnetic radius of 100px
- Within radius, button moves toward cursor (30% of distance)
- Spring physics on release
- Continuous subtle pulse when idle
- On click: Ripple + scale bounce
```

#### Filter Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Dropdown Open | Scale Y 0→1, opacity 0→1, origin top | 300ms | expo-out |
| Filter Apply | List crossfade, items reorder with FLIP | 400ms | smooth |
| Search Type | Results filter with stagger fade | 200ms | smooth |

### Advanced Effects

#### Urgency Glow System
```
Due Tomorrow:
- Orange border glow pulse
- Icon subtle bounce
- "Due Tomorrow" text slides in

Overdue:
- Red border glow with rapid pulse
- Item slight shake every 5s
- Urgent badge pops in
- Shadow turns red
```

---

## Section 4: Subscriptions

### Layout
- Masonry-style grid with variable card heights
- Cards grouped by category with color coding
- Animated total calculator at top

#### Spatial Composition
```
┌─────────────────────────────────────────────────────────────────────┐
│  SUBSCRIPTIONS                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  MONTHLY TOTAL                                                  ││
│  │                                                                 ││
│  │  $247.50 / month                                                ││
│  │  [Animated bar chart by category]                               ││
│  │  Entertainment: $85  |  Work: $120  |  Health: $42.50          ││
│  └─────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ 🎬 Netflix  │  │ 💼 Slack    │  │ 🏋️ Gym      │  │ ☁️ Dropbox  │ │
│  │             │  │             │  │             │  │             │ │
│  │  $15.99/mo  │  │  $8/mo      │  │  $42.50/mo  │  │  $12/mo     │ │
│  │             │  │             │  │             │  │             │ │
│  │ Renews: 15d │  │ Renews: 3d  │  │ Renews: 22d │  │ Renews: 8d  │ │
│  │             │  │ [SOON]      │  │             │  │             │ │
│  │ [Category:  │  │ [Category:  │  │ [Category:  │  │ [Category:  │ │
│  │Entertainment]│  │   Work]     │  │   Health]   │  │    Work]    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                                     │
│  [+ Add Subscription]                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Content

**Total Calculator:**
- "Monthly Total: $247.50"
- Category breakdown with mini bar chart
- Animated number that updates on changes

**Subscription Cards:**
- Service icon/logo
- Name
- Amount with billing period
- Renewal countdown
- Category badge
- Cancellation link (hidden under "Manage")

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Total Bar | Expand | scaleX 0→1, origin left | 600ms | 0ms | expo-out |
| Total Number | Count Up | 0→247.50 | 800ms | 300ms | expo-out |
| Category Bars | Stagger Grow | width 0→value | 400ms | 400ms+100ms each | expo-out |
| Cards | Stagger 3D Flip | rotateY: 90→0, opacity 0→1 | 500ms | 500ms+80ms each | expo-out |

#### Card Interactions
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Card | Hover | Lift -6px, tilt toward cursor, glow | 300ms | smooth |
| Logo | Hover | Scale 1.1, subtle rotate | 200ms | elastic |
| Renewal Badge | Idle (if <7d) | Pulse glow, subtle shake | 2s | sine |
| Manage Button | Click | Expand card height, reveal options | 400ms | expo-out |

#### Total Update Animation
```
When subscription added/edited/deleted:
1. Old total fades and slides up (300ms)
2. New total slides up from below and fades in (300ms)
3. Category bars animate to new widths (500ms)
4. All cards reorder with FLIP animation (400ms)
```

### Advanced Effects

#### Category Color System
```
Entertainment: Gradient pink (#fd79a8 → #e84393)
Work: Gradient blue (#3880ff → #5260ff)
Health: Gradient green (#2dd36f → #00b894)
Utilities: Gradient orange (#ffc409 → #fdcb6e)

Each card has:
- Top border with category gradient
- Subtle background tint (5% opacity)
- Glow on hover matches category color
```

---

## Section 5: Warranties

### Layout
- Timeline view showing warranties by expiration
- Product cards with visual countdown
- Document preview thumbnails

#### Spatial Composition
```
┌─────────────────────────────────────────────────────────────────────┐
│  WARRANTIES                                          [+ Add Product]│
├─────────────────────────────────────────────────────────────────────┤
│  TIMELINE VIEW:                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  ○────○────○────●────○────○────○────○────○────○              ││
│  │ Now  30d  60d  90d 120d 150d 180d 210d 240d 270d 300d        ││
│  │         [Current position marker with glow]                    ││
│  └─────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│  EXPIRING SOON:                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  🖥️  Gaming Monitor                                              ││
│  │      Purchased: Jan 15, 2023                                     ││
│  │      Warranty: 2 years                                           ││
│  │      ┌─────────────────────────────────────┐                    ││
│  │      │  EXPIRES IN 15 DAYS                 │                    ││
│  │      │  [████████████░░░░░░░░] 85% elapsed │                    ││
│  │      └─────────────────────────────────────┘                    ││
│  │      [📄 View Receipt]  [🏢 Contact Support]                    ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │  🎧  Wireless Headphones                                         ││
│  │      Purchased: Mar 22, 2023                                     ││
│  │      Warranty: 1 year                                            ││
│  │      ┌─────────────────────────────────────┐                    ││
│  │      │  EXPIRES IN 45 DAYS                 │                    ││
│  │      │  [████████░░░░░░░░░░░░] 60% elapsed │                    ││
│  │      └─────────────────────────────────────┘                    ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Content

**Timeline:**
- Horizontal scrollable timeline
- Current position marked
- Warranty expiration points

**Product Cards:**
- Product icon/image
- Name
- Purchase date
- Warranty duration
- Progress bar showing time elapsed
- Days remaining with urgency color
- Action buttons

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Timeline | Draw In | scaleX 0→1 | 800ms | 0ms | expo-out |
| Timeline Dots | Pop In | scale 0→1.2→1 | 300ms | 400ms+50ms each | bounce |
| Current Marker | Pulse In | scale 0→1, glow fade in | 500ms | 600ms | elastic |
| Product Cards | Stagger Slide | y: 50→0, opacity 0→1 | 500ms | 400ms+100ms each | expo-out |
| Progress Bars | Animate Fill | width 0→value | 800ms | 600ms | expo-out |

#### Progress Bar Effects
```
Color States:
- >90 days: Green gradient, calm pulse
- 30-90 days: Yellow gradient, faster pulse
- <30 days: Orange gradient, urgent pulse
- <7 days: Red gradient, rapid pulse + glow

Animation:
- Continuous subtle pulse on all bars
- Staggered timing per card
- Glow intensifies on hover
```

#### Card Interactions
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Card | Hover | Lift, expand slightly, shadow grow | 300ms | smooth |
| Progress Bar | Hover | Height increase, glow intensify | 200ms | smooth |
| Document Thumbnail | Hover | Scale 1.1, overlay fade in | 200ms | smooth |
| Document Thumbnail | Click | Expand to full preview modal | 400ms | expo-out |

### Advanced Effects

#### Urgency Visualization
```
As expiration approaches:
- Card border color shifts through spectrum
- Progress bar glow intensifies
- Subtle shake animation begins (<7 days)
- "URGENT" badge slides in (<3 days)

Background of expiring soon section:
- Subtle gradient animation
- Color shifts to match urgency
```

---

## Section 6: Documents Vault

### Layout
- Grid view with document cards
- Category tabs with animated underline
- Secure lock animation on access

#### Spatial Composition
```
┌─────────────────────────────────────────────────────────────────────┐
│  DOCUMENTS VAULT                                    [+ Upload Doc]  │
├─────────────────────────────────────────────────────────────────────┤
│  [All] [Passport] [License] [Insurance] [Contracts] [Other ▼]      │
│  ══════ Animated underline indicator                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │ │
│  │  │       │  │  │  │       │  │  │  │       │  │  │  │   +   │  │ │
│  │  │  📄   │  │  │  │  🛂   │  │  │  │  🏥   │  │  │  │       │  │ │
│  │  │       │  │  │  │       │  │  │  │       │  │  │  │       │  │ │
│  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │ │
│  │             │  │             │  │             │  │             │ │
│  │  Passport   │  │  Driver's   │  │  Health     │  │  Upload     │ │
│  │  ***4567    │  │  License    │  │  Insurance  │  │  New        │ │
│  │             │  │  ***8901    │  │  ***2345    │  │             │ │
│  │  Exp: 2027  │  │  Exp: 2026  │  │  Exp: 2025  │  │             │ │
│  │  [🔒 View]  │  │  [🔒 View]  │  │  [🔒 View]  │  │             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Content

**Category Tabs:**
- All, Passport, License, Insurance, Contracts, Other
- Animated underline indicator

**Document Cards:**
- Document preview/thumbnail
- Title
- Masked ID number (***last4)
- Expiration date
- "View" button with lock icon

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Header | Slide Down | y: -20→0, opacity 0→1 | 400ms | 0ms | expo-out |
| Tabs | Stagger Fade | opacity 0→1, y: 10→0 | 300ms | 100ms+50ms each | smooth |
| Underline | Slide to Active | x position animate | 300ms | 400ms | expo-out |
| Cards | Stagger Scale | scale 0.9→1, opacity 0→1 | 400ms | 300ms+60ms each | expo-out |

#### Tab Interactions
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Tab | Hover | Text color change, underline preview | 200ms | smooth |
| Tab | Click | Underline slides to new position | 300ms | expo-out |
| Content | Tab Change | Crossfade with scale | 400ms | smooth |
| Cards | Filter | FLIP reorder animation | 400ms | expo-out |

#### Card Interactions
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Card | Hover | Lift, shadow expand, preview brighten | 300ms | smooth |
| Lock Icon | Hover | Unlock animation (lock rotates) | 400ms | elastic |
| View Button | Click | Lock opens, modal slides up | 500ms | expo-out |
| Modal | Open | Backdrop fade, content scale 0.9→1 | 400ms | expo-out |
| Modal | Close | Reverse open animation | 300ms | expo-in |

### Advanced Effects

#### Security Lock Animation
```
On View click:
1. Lock icon shakes slightly (authentication)
2. Lock shackle rotates up (unlocked state)
3. Brief green flash (access granted)
4. Modal opens with document
5. Document has "CONFIDENTIAL" watermark

On modal close:
1. Lock shackle rotates down
2. Lock returns to locked state
```

#### Document Preview
```
Thumbnail has:
- Subtle parallax on hover (image moves slightly)
- Scan line animation (like document scanner)
- Corner fold effect on hover
```

---

## Section 7: Password Manager

### Layout
- Security score header with animated ring
- Password list with strength indicators
- Generator tool in slide-out panel

#### Spatial Composition
```
┌─────────────────────────────────────────────────────────────────────┐
│  PASSWORD MANAGER                                                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌─────────────────────────────────┐  │
│  │    SECURITY SCORE        │  │  PASSWORD GENERATOR             │  │
│  │                          │  │  ┌─────────────────────────────┐│  │
│  │      ┌────────┐          │  │  │  Length: [━━━━━━●━━━] 16    ││  │
│  │      │   85   │          │  │  │                             ││  │
│  │      │  ┌──┐  │          │  │  │  ☑ Uppercase  ☑ Lowercase   ││  │
│  │      │  │▓▓│  │          │  │  │  ☑ Numbers    ☑ Symbols     ││  │
│  │      │  │▓░│  │          │  │  │                             ││  │
│  │      │  └──┘  │          │  │  │  [🔄 Generate]               ││  │
│  │      │   /100 │          │  │  │                             ││  │
│  │      └────────┘          │  │  │  ┌───────────────────────┐  ││  │
│  │                          │  │  │  │  x9$K2mP@vL7qR9w      │  ││  │
│  │  Strong! 2 passwords     │  │  │  │  [📋 Copy]            │  ││  │
│  │  need attention          │  │  │  └───────────────────────┘  ││  │
│  │                          │  │  └─────────────────────────────┘│  │
│  └──────────────────────────┘  └─────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  [All] [Social] [Finance] [Work] [Shopping] [🔍 Search...]         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  🌐  Google Account              ●●●●●●●●●●●●  [👁️] [📋] [✏️]  ││
│  │      Strength: [████████░░░] Strong    Last changed: 2mo ago   ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │  🏦  Bank of America             ●●●●●●●●●●●●  [👁️] [📋] [✏️]  ││
│  │      Strength: [█████░░░░░░] Weak ⚠️   Last changed: 1yr ago   ││
│  │      [Update Recommended]                                       ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │  🛒  Amazon                      ●●●●●●●●●●●●  [👁️] [📋] [✏️]  ││
│  │      Strength: [████████░░░] Strong    Last changed: 3mo ago   ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Content

**Security Score:**
- Animated circular progress (85/100)
- Score label and advice
- Rotating gradient border

**Password Generator:**
- Length slider
- Character type checkboxes
- Generate button with spin animation
- Generated password display
- Copy button

**Password List:**
- Service icon
- Account name
- Masked password
- Strength indicator bar
- Last changed date
- Action buttons (reveal, copy, edit)

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Security Score | Scale + Rotate | scale 0→1, rotate -180→0 | 600ms | 0ms | expo-out |
| Score Ring | Draw | stroke-dashoffset animation | 800ms | 200ms | expo-out |
| Score Number | Count Up | 0→85 | 600ms | 400ms | expo-out |
| Generator | Slide In | x: 50→0, opacity 0→1 | 500ms | 200ms | expo-out |
| Password Items | Stagger Slide | x: -30→0, opacity 0→1 | 400ms | 400ms+60ms each | expo-out |

#### Security Score Ring
```
Animation:
- Continuous slow rotation: 360deg over 15s
- Gradient colors shift through spectrum
- Glow pulse synced with rotation
- On score change: rapid pulse + number count animation

Color States:
- 0-40: Red gradient
- 41-70: Yellow gradient  
- 71-100: Green gradient
```

#### Generator Interactions
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Slider | Drag | Thumb scales, value updates real-time | instant | - |
| Checkboxes | Click | Checkmark draws in, ripple | 300ms | elastic |
| Generate Button | Click | Icon spins, password scrambles | 600ms | expo-out |
| Password Display | Generate | Characters cycle rapidly then settle | 500ms | expo-out |
| Copy Button | Click | Checkmark morph, "Copied!" toast | 400ms | smooth |

#### Password Item Interactions
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Item | Hover | Lift, bg lighten, actions slide in | 300ms | smooth |
| Reveal Eye | Click | Eye opens, password reveals with scramble | 400ms | expo-out |
| Copy | Click | Ripple, checkmark, toast notification | 400ms | elastic |
| Strength Bar | Always | Subtle pulse, color matches strength | 3s | sine |
| Weak Warning | Idle | Gentle shake, orange glow pulse | 4s | sine |

### Advanced Effects

#### Password Scramble Effect
```
On generate or reveal:
1. Display random characters rapidly (50ms per frame)
2. Gradually slow down (ease-out timing)
3. Final character locks into place
4. Subtle glow flash on completion

Visual:
- Characters use monospace font
- Green tint for final password
- Brief "decoding" aesthetic
```

---

## Section 8: Reminders & Tasks

### Layout
- Calendar view with animated transitions
- Task list with priority indicators
- Add button with expanding form

#### Spatial Composition
```
┌─────────────────────────────────────────────────────────────────────┐
│  REMINDERS & TASKS                                                  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐│
│  │      MARCH 2026             │  │  TODAY - March 15               ││
│  │  Su Mo Tu We Th Fr Sa       │  │                                 ││
│  │      1  2  3  4  5  6  7    │  │  [🔴] Pay electricity bill      ││
│  │   8  9 10 11 12 13 14      │  │      Due: Today 5:00 PM         ││
│  │  15 16 17 18 19 20 21      │  │      Category: Finance          ││
│  │  22 23 24 25 26 27 28      │  │                                 ││
│  │  29 30 31                  │  │  [🟡] Call dentist              ││
│  │                            │  │      Due: Tomorrow 10:00 AM     ││
│  │  [◀] [    March 2026    ] [▶]  │      Category: Health           ││
│  │                            │  │                                 ││
│  │  [Today] [Week] [Month]   │  │  [🟢] Buy groceries             ││
│  └─────────────────────────────┘  │      Due: Mar 17                ││
│                                   │      Category: Personal         ││
│                                   │                                 ││
│                                   │  [+ Add Task]                   ││
│                                   └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Content

**Calendar:**
- Month navigation
- Day grid with event dots
- View toggle (Today/Week/Month)

**Task List:**
- Priority indicator (red/yellow/green)
- Task title
- Due date and time
- Category tag
- Complete checkbox

**Add Form:**
- Title input
- Date/time picker
- Priority selector
- Category dropdown
- Recurring options

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Calendar | Fade + Scale | opacity 0→1, scale 0.95→1 | 500ms | 0ms | expo-out |
| Calendar Days | Stagger Pop | scale 0→1 | 300ms | 200ms+20ms each | bounce |
| Today Highlight | Pulse In | scale 1→1.1→1, glow fade | 500ms | 600ms | elastic |
| Task List | Slide In | x: 30→0, opacity 0→1 | 400ms | 300ms | expo-out |
| Tasks | Stagger Slide | y: 20→0, opacity 0→1 | 300ms | 400ms+50ms each | expo-out |

#### Calendar Interactions
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Month Change | Click | Days flip out, new days flip in | 400ms | expo-out |
| Day | Hover | Scale 1.1, bg highlight | 200ms | smooth |
| Day | Click | Ripple, selected state | 300ms | expo-out |
| Event Dots | Idle | Subtle bounce | 3s | sine |
| View Toggle | Click | Slide indicator, content crossfade | 400ms | smooth |

#### Task Interactions
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Task | Hover | Lift, actions slide in | 300ms | smooth |
| Checkbox | Click | Check draws in, strikethrough animates | 400ms | elastic |
| Complete | Click | Task fades, slides up, list reorders | 500ms | expo-out |
| Priority | Always | Colored dot pulses (red fastest) | 2-4s | sine |
| Add Button | Click | Expands to form, fields stagger in | 500ms | expo-out |

#### Add Form Animation
```
On click:
1. Button morphs into card (400ms)
2. Form fields slide in staggered (300ms each, 50ms delay)
3. Input focus triggers floating label
4. Submit button pulses when form valid

On submit:
1. Form collapses back to button (300ms)
2. New task slides into list (400ms)
3. Success toast appears (300ms)
```

### Advanced Effects

#### Priority Pulse System
```
Red (High):
- Rapid pulse: opacity 0.7→1 over 1s
- Subtle glow when overdue
- Urgent badge slides in if past due

Yellow (Medium):
- Medium pulse: opacity 0.8→1 over 2s
- Gentle glow

Green (Low):
- Slow pulse: opacity 0.9→1 over 3s
- Calm appearance
```

---

## Section 9: Smart Reminders Panel

### Layout
- Intelligent suggestions based on user data
- Cards with animated confidence indicators
- One-click action buttons

#### Spatial Composition
```
┌─────────────────────────────────────────────────────────────────────┐
│  SMART REMINDERS 🤖                                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Based on your data, we recommend:                                  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  🛂  Renew Your Passport                                        ││
│  │      Your passport expires in 3 months. Start renewal process.  ││
│  │      Confidence: [████████░░░] 85%                              ││
│  │      [Learn More]  [Mark as Done]  [Remind Me Later]            ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │  💳  Update Credit Card                                         ││
│  │      Your card on Netflix expires next month.                   ││
│  │      Confidence: [██████████░] 95%                              ││
│  │      [Update Now]  [Dismiss]                                    ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │  🏥  Schedule Annual Checkup                                    ││
│  │      It's been 14 months since your last checkup.               ││
│  │      Confidence: [███████░░░░] 70%                              ││
│  │      [Book Appointment]  [Snooze 1 Month]                       ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Content

**Reminder Cards:**
- Icon
- Title
- Description with context
- Confidence score with progress bar
- Action buttons

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Header | Slide Down | y: -20→0, opacity 0→1 | 400ms | 0ms | expo-out |
| Cards | Stagger 3D Rise | y: 40→0, rotateX: 5→0, opacity 0→1 | 500ms | 200ms+100ms each | expo-out |
| Confidence Bars | Animate Fill | width 0→value | 600ms | 500ms | expo-out |
| Buttons | Pop In | scale 0→1 | 300ms | 700ms+50ms each | bounce |

#### Card Interactions
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Card | Hover | Lift, confidence bar glow | 300ms | smooth |
| Action Button | Hover | Scale 1.05, color intensify | 200ms | smooth |
| Dismiss | Click | Card slides out, others reorder | 400ms | expo-out |
| Mark Done | Click | Check animation, card fades to green | 500ms | elastic |

### Advanced Effects

#### Confidence Visualization
```
Confidence Bar:
- Gradient from left (low confidence = yellow, high = green)
- Subtle shimmer animation across bar
- Glow intensifies on hover
- Number counts up on load

Card Border:
- Subtle tint based on confidence level
- Higher confidence = more prominent border
```

---

## Section 10: Settings

### Layout
- Tabbed interface with animated transitions
- Toggle switches with satisfying animations
- Form inputs with floating labels

#### Spatial Composition
```
┌─────────────────────────────────────────────────────────────────────┐
│  SETTINGS                                                           │
├─────────────────────────────────────────────────────────────────────┤
│  [Profile] [Account] [Notifications] [Security] [Appearance] [Data] │
│  ═════════ Animated underline                                       │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  PROFILE INFORMATION                                            ││
│  │                                                                 ││
│  │  ┌─────────────┐                                                ││
│  │  │             │  Name: [Alex Johnson          ]                ││
│  │  │   [Photo]   │  Email: [alex@example.com     ]                ││
│  │  │             │  Phone: [+1 (555) 123-4567    ]                ││
│  │  │  [Change]   │                                                ││
│  │  └─────────────┘  Bio: [Tell us about yourself...]              ││
│  │                                                                 ││
│  │  [Save Changes]                                                 ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │  NOTIFICATION PREFERENCES                                       ││
│  │                                                                 ││
│  │  Email Notifications    [████●░░]  Toggle                       ││
│  │  Push Notifications     [██████░]  Toggle                       ││
│  │  Bill Reminders         [████●░░]  Toggle                       ││
│  │  Security Alerts        [███████]  Toggle                       ││
│  │                                                                 ││
│  │  [Reset to Defaults]                                            ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Content

**Tabs:**
- Profile, Account, Notifications, Security, Appearance, Data

**Profile Section:**
- Avatar upload with preview
- Name, email, phone inputs
- Bio textarea

**Notification Toggles:**
- Email notifications
- Push notifications
- Bill reminders
- Security alerts
- Warranty expirations

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Tabs | Stagger Fade | opacity 0→1, y: 10→0 | 300ms | 0ms+50ms each | smooth |
| Underline | Slide to Active | x position animate | 300ms | 300ms | expo-out |
| Section | Fade In | opacity 0→1 | 400ms | 200ms | smooth |
| Inputs | Stagger Rise | y: 20→0, opacity 0→1 | 400ms | 300ms+80ms each | expo-out |

#### Tab Transitions
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Underline | Slide to new position | 300ms | expo-out |
| Old Content | Fade + Slide left | 300ms | expo-in |
| New Content | Fade + Slide from right | 400ms | expo-out |

#### Toggle Interactions
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Toggle | Click | Knob slides, background color shift | 300ms | elastic |
| Toggle | Click | Ripple from click point | 400ms | expo-out |
| Label | Toggle | Text color shift | 200ms | smooth |

#### Input Interactions
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Input | Focus | Border glow, label float up | 300ms | smooth |
| Input | Type | Underline expands from center | 400ms | expo-out |
| Avatar | Hover | Overlay fade in, "Change" text | 200ms | smooth |
| Avatar | Upload | Loading spinner, then preview update | 600ms | smooth |

### Advanced Effects

#### Toggle Satisfaction
```
On toggle ON:
1. Background fills with color from left (300ms)
2. Knob slides right with slight overshoot (elastic)
3. Subtle haptic-like shake
4. Glow pulse on completion

On toggle OFF:
1. Background fades to gray
2. Knob slides left
3. Softer animation (less satisfying to discourage)
```

---

## Technical Implementation Notes

### Required Libraries
- **GSAP + ScrollTrigger**: Complex scroll animations, pinning
- **Three.js**: Hero particle system only
- **CSS Animations**: All other effects (performance optimal)
- **Intersection Observer**: Triggering entrance animations

### Performance Optimizations

**Critical Rules:**
- Use `transform` and `opacity` exclusively for animations
- Apply `will-change` before animation, remove after
- Use CSS containment (`contain: layout style paint`)
- Throttle scroll events to 16ms (60fps)
- Limit simultaneous animations to 10 elements max
- Use `content-visibility: auto` for off-screen sections

**GPU Acceleration:**
```css
.animated-element {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

**Reduced Motion Support:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Browser Support
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Progressive enhancement for older browsers
- Feature detection with CSS.supports()

---

## Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Adaptations
- Reduce particle count to 50
- Simplify 3D transforms to 2D
- Reduce stagger delays by 50%
- Disable parallax effects
- Use simpler hover alternatives (tap states)
- Reduce animation distances by 40%

### Touch Interactions
- Swipe gestures for lists
- Pull-to-refresh
- Long-press for context menus
- Tap to reveal actions (instead of hover)

---

## Animation Value Reference

### Movement Magnitudes
| Effect Type | Range | Notes |
|-------------|-------|-------|
| Entrance slides | 30-60px | Distance elements travel in |
| Hover lifts | 4-8px | Subtle elevation on hover |
| Scale effects | 0.95x - 1.05x | Micro-interactions |
| Rotations | 3° - 10° | Subtle tilt effects |
| Parallax layers | 20% - 50% speed | Background movement |

### Timing Reference
| Animation Type | Duration | Easing |
|----------------|----------|--------|
| Micro-interactions | 150-200ms | smooth |
| Hover states | 200-300ms | smooth |
| Card entrances | 400-600ms | expo-out |
| Page transitions | 500-800ms | expo-out |
| Ambient loops | 4-8s | sine |

---

## Quality Checklist

- ✓ Every section has memorable entrance animations
- ✓ Hover states provide clear feedback
- ✓ Continuous ambient motion creates life
- ✓ Scroll effects enhance storytelling
- ✓ 3D transforms add depth without disorientation
- ✓ Performance optimized (60fps target)
- ✓ Accessibility considered (reduced motion)
- ✓ Brand identity enhanced through motion
- ✓ Professional polish exceeds static design
- ✓ Typography remains highly readable
- ✓ Visual hierarchy strengthened by animation
