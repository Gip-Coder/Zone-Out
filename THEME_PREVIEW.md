# ZoneOut Theme Preview & Specifications

## Theme 1: Dark Futuristic (Default)

### Visual Characteristics
- **Primary Background**: Deep space navy (#0a0e27)
- **Secondary Background**: Darker purple-tinted navy (#131829)
- **Feel**: Neural AI control center with cyberpunk aesthetics
- **Glow Effects**: Prominent neon accents with subtle glows
- **Animation**: Energetic, responsive with smooth transitions

### Color Palette

```
Background Colors:
├── Primary:     #0a0e27
├── Secondary:   #131829
├── Tertiary:    #1a1f3a
└── Quaternary:  #232d4d (lighter for contrast)

Text Colors:
├── Primary:     #e8f0ff (nearly white, blue tint)
├── Secondary:   rgba(232, 240, 255, 0.65)
└── Tertiary:    rgba(232, 240, 255, 0.45)

Accent Colors:
├── Primary (Indigo):    #6366f1
├── Secondary (Pink):    #ec4899
├── Tertiary (Blue):     #3b82f6
├── Cyan:                #06b6d4
├── Success:             #10b981
├── Warning:             #f59e0b
└── Error:               #ef4444

Gradients:
├── Button:   linear-gradient(135deg, #6366f1, #3b82f6, #06b6d4)
├── Button 2: linear-gradient(135deg, #ec4899, #f43f5e)
└── Glow:     0 0 40px rgba(99, 102, 241, 0.6)
```

### Key Visual Elements

**Cards**:
- Background: rgba(255, 255, 255, 0.05)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Backdrop Filter: blur(20px)
- Glow on Hover: 0 16px 48px rgba(99, 102, 241, 0.25)

**Buttons**:
- Gradient: Indigo → Blue → Cyan
- Glow: 0 10px 30px rgba(124, 58, 237, 0.5)
- Hover Scale: 1.02
- Active Scale: 0.98

**Typography**:
- Headers: Bold, often with gradient text
- Body: Regular 14-16px
- Links: Colored, underline on hover

### Examples

#### Button Styles
```
Primary Button:
  Background: gradient(indigo → blue → cyan)
  Text Color: White
  Glow: Soft blue/purple glow

Secondary Button:
  Background: rgba(255, 255, 255, 0.1)
  Text Color: Light gray
  No glow
```

#### Card Examples
```
Glass Card (Default):
  Translucent background with blur
  Subtle border with white/10 opacity
  Hover: Increased glow and opacity

Info Card:
  White/5 background
  Enhanced border opacity on hover
  Smooth scale transition
```

---

## Theme 2: Light Green Sleek

### Visual Characteristics
- **Primary Background**: Off-white (#fafbf8)
- **Secondary Background**: Pure white (#ffffff)
- **Feel**: Premium minimalist productivity app (Apple-inspired)
- **Glow Effects**: Minimal, subtle accents
- **Animation**: Smooth, understated with refined transitions

### Color Palette

```
Background Colors:
├── Primary:     #fafbf8 (off-white with slight green tint)
├── Secondary:   #ffffff (pure white)
├── Tertiary:    #f0fdf4 (very light green)
└── Quaternary:  #e7f5e1 (light green)

Text Colors:
├── Primary:     #1f2937 (dark gray)
├── Secondary:   #6b7280 (medium gray)
└── Tertiary:    #9ca3af (light gray)

Accent Colors:
├── Primary (Green):     #16a34a
├── Secondary (Emerald): #059669
├── Tertiary (Teal):     #0d9488
├── Success:             #16a34a
├── Warning:             #f59e0b
└── Error:               #dc2626

Gradients:
├── Button:   linear-gradient(135deg, #16a34a, #059669)
├── Button 2: linear-gradient(135deg, #10b981, #0d9488)
└── Glow:     0 0 25px rgba(22, 163, 74, 0.2)
```

### Key Visual Elements

**Cards**:
- Background: rgba(255, 255, 255, 0.5) or pure white
- Border: 1px solid rgba(0, 0, 0, 0.06)
- Shadow: 0 4px 12px rgba(0, 0, 0, 0.06)
- Hover Shadow: 0 12px 24px rgba(0, 0, 0, 0.1)

**Buttons**:
- Gradient: Green → Emerald
- Shadow: Soft drop shadow, no glow
- Hover Scale: 1.02
- Active Scale: 0.98

**Typography**:
- Headers: Bold dark gray
- Body: Medium gray for readability
- Secondary: Light gray for tertiary info

### Examples

#### Button Styles
```
Primary Button:
  Background: gradient(green → emerald)
  Text Color: White
  Shadow: Soft shadow

Secondary Button:
  Background: White with border
  Text Color: Dark gray
  Minimal shadow
```

#### Card Examples
```
Light Glass Card:
  White/50 background
  Soft border
  Minimal shadow, more on hover
  Hover: Enhanced shadow only

Light Solid Card:
  Pure white background
  Subtle border
  Premium feel with minimal glow
```

---

## Side-by-Side Comparison

### Dashboard Page

**Dark Theme**:
```
┌─────────────────────────────────────┐
│ Welcome Back, Scholar               │
│ (Gradient indigo → blue → cyan)      │
├─────────────────────────────────────┤
│ [47 Hours] [12 Goals] [89% Done]    │
│ (Glass cards with soft glow)        │
├─────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │Focus │ │Goals │ │Courses           │
│ │Timer │ │Track │ │Vault  │         │
│ └──────┘ └──────┘ └──────┘         │
│ (Gradient icons with neon glow)    │
└─────────────────────────────────────┘
```

**Light Theme**:
```
┌─────────────────────────────────────┐
│ Welcome Back, Scholar               │
│ (Dark gray text)                    │
├─────────────────────────────────────┤
│ [47 Hours] [12 Goals] [89% Done]    │
│ (White cards with soft shadow)      │
├─────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │Focus │ │Goals │ │Courses           │
│ │Timer │ │Track │ │Vault  │         │
│ └──────┘ └──────┘ └──────┘         │
│ (Green gradient icons)              │
└─────────────────────────────────────┘
```

---

## Animation Specifications

### Entrance Animations
```
Container Delay:    0.2s (wait before children start)
Stagger:            0.1s between children
Duration:           0.5s per item
Easing:             ease-out
Motion:             opacity + translateY(20px)
```

### Hover Animations
```
Button Scale:       1.02 → 1.0
Press Scale:        0.98 → 1.0
Duration:           0.2s
Card Glow:          Fade in/out 0.3s
Smooth Curves:      All easing
```

### Page Transitions
```
Page Enter:         Fade in + subtle scale
Duration:           0.6s
Stagger Start:      0.2s
Easing:             easeOut
```

---

## Dark Theme Specifications

### HSL Values (Alternative)
```
Primary BG:    hsl(220, 100%, 7%)
Secondary BG:  hsl(260, 35%, 10%)
Accent Primary: hsl(236, 100%, 52%)
Accent Secondary: hsl(333, 96%, 57%)
Text Primary:  hsl(215, 100%, 92%)
```

### Shadow Specifications
```
Soft Glow:    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4)
Strong Glow:  box-shadow: 0 0 40px rgba(99, 102, 241, 0.6)
Card Shadow:  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15)
Hover Shadow: box-shadow: 0 16px 48px rgba(99, 102, 241, 0.25)
```

### Border Specifications
```
Default Border:  1px solid rgba(255, 255, 255, 0.08)
Active Border:   1px solid rgba(99, 102, 241, 0.5)
Glow Border:     2px solid rgba(99, 102, 241, 0.3)
```

---

## Light Theme Specifications

### HSL Values
```
Primary BG:    hsl(100, 18%, 98%)
Secondary BG:  hsl(0, 0%, 100%)
Accent Primary: hsl(142, 71%, 45%)
Accent Secondary: hsl(171, 100%, 41%)
Text Primary:  hsl(217, 33%, 17%)
```

### Shadow Specifications
```
Subtle Shadow:  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06)
Card Shadow:    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06)
Hover Shadow:   box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1)
```

### Border Specifications
```
Default Border:  1px solid rgba(0, 0, 0, 0.06)
Active Border:   1px solid rgba(22, 163, 74, 0.5)
Accent Border:   2px solid rgba(22, 163, 74, 0.3)
```

---

## Responsive Design Details

### Mobile (0px - 640px)
- Single column layout
- Full-width cards
- Larger touch targets (48px+)
- Sidebar hidden, menu toggle visible
- Smaller padding (16px)

### Tablet (640px - 1024px)
- 2-column grids
- Medium padding (20-24px)
- Sidebar starting to appear
- Enhanced spacing

### Desktop (1024px+)
- Full layouts (3-4 columns)
- Sidebar always visible
- Maximum width: 1400px
- Generous padding (32-48px)

---

## Font Stack

```css
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;

Font Sizes:
- H1: 48px (3rem) bold
- H2: 36px (2.25rem) bold
- H3: 24px (1.5rem) semibold
- Body: 16px (1rem) regular
- Small: 14px (0.875rem) regular
- Tiny: 12px (0.75rem) regular

Line Heights:
- Headings: 1.2
- Body: 1.5 - 1.6
- Dense: 1.4
```

---

## Print & Export Notes

When exporting or taking screenshots:
1. Dark theme captures should emphasize neon glows
2. Light theme captures should highlight clean minimalism
3. Include both themes for documentation
4. Use consistent sizing (1920x1080 for demos)
5. Capture interactive states (hover, active, focus)

---

**Theme System Version**: 2.0
**Last Updated**: February 2026
**Status**: Production Ready ✓
