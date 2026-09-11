# Design System

The design system defines reusable visual and interface foundations for Almsby.

It should make the product coherent without forcing every screen into the same visual shape.

## Scope

This directory is for:

- typography;
- color roles;
- spacing;
- sizing;
- elevation/borders;
- layout primitives;
- interaction states;
- component foundations;
- motion principles;
- responsive foundations;
- accessibility-related visual requirements.

It is not the place for page-specific art direction.

## Principles

### Coherent, not generic

Reuse should create a recognizable Almsby language, not a generic SaaS appearance.

### Hierarchy before decoration

Visual choices should clarify importance, state, and action before adding ornament.

### Product context matters

Dashboard/compliance experiences and public maker story pages can have different densities while still belonging to the same product.

### Accessibility is foundational

Contrast, focus, readable typography, target sizing, and state visibility are part of the design system rather than optional polish.

### System before exception

Prefer reusable tokens and primitives. Introduce an exception only when the product experience has a clear reason to need it.

## Current technical source

The existing technical architecture document contains design-system material that should be migrated here as the UX structure is adopted.

Engineering should consume the design system; it should not be the authoritative home for visual policy.

Locked decisions for fonts and color — apply consistently across the dashboard, story pages, and any future marketing surfaces built inside the Next.js app.

## Typography

| Role | Font | Source | Usage |
|---|---|---|---|
| Headings | Bricolage Grotesque | Google Fonts | H1–H4, display text, hero headlines, section titles |
| Body | Albert Sans | Google Fonts | Body copy, UI labels, form fields, captions, all running text |

Load both via Google Fonts in the Next.js app's root layout. Specify weights explicitly to avoid loading the full variable font range unnecessarily:

```html
<!-- In <head> or Next.js font optimization -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Albert+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

Or preferably via Next.js's built-in font optimization (`next/font/google`), which self-hosts and eliminates the Google Fonts round-trip:

```typescript
import { Bricolage_Grotesque, Albert_Sans } from 'next/font/google'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
})

const albert = Albert_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
})
```

## Color system

Four ramps, each with a defined role. Use the role, not the ramp name, when making decisions — if you find yourself reaching outside a ramp's defined role, that's a signal to check in rather than improvise.

```css
/* primary — brand, warmth, marketing surfaces, interactive elements */
--primary-100: #f8f2f3;
--primary-200: #e3d5d6;
--primary-300: #c7aeb0;
--primary-400: #ad8183;
--primary-500: #8e5f6b;
--primary-600: #734253;
--primary-700: #613146;
--primary-800: #592941;
--primary-900: #331323;

/* blue — compliance status, data, informational UI, system feedback */
--blue-100: #eff5f7;
--blue-200: #cfe0e5;
--blue-300: #a6c5ce;
--blue-400: #7faebb;
--blue-500: #538ea1;
--blue-600: #366e83;
--blue-700: #235064;
--blue-800: #153b50;
--blue-900: #0b2433;

/* gold — accents, CTAs, highlights — use sparingly, not as a structural color */
--gold-100: #fff8eb;
--gold-200: #ffe2b3;
--gold-300: #ffcb77;
--gold-400: #f5ad4b;
--gold-500: #db8d24;
--gold-600: #ad690b;
--gold-700: #804b00;
--gold-800: #543000;
--gold-900: #301b00;

/* neutral — UI chrome, text, borders, backgrounds, form elements, disabled states */
--neutral-100: #f8f6f5;
--neutral-200: #ebe6e4;
--neutral-300: #d3cbc8;
--neutral-400: #b5aba7;
--neutral-500: #8c8078;
--neutral-600: #675c55;
--neutral-700: #4a3f3a;
--neutral-800: #302825;
--neutral-900: #1a1512;
```

## Usage guidance

- **Backgrounds:** neutral-100 for app surfaces, primary-100 for brand/marketing surfaces
- **Body text:** neutral-800 on light backgrounds, neutral-100 on dark
- **Headings:** primary-800 or neutral-900 depending on surface warmth
- **Interactive/CTA:** primary-500 to primary-700 range
- **Compliance status UI:** blue ramp — "Sunrise-ready" badges, status indicators, data tables
- **Accent/highlight:** gold-500 sparingly — notification dots, progress indicators, pricing highlights
- **Borders:** neutral-200 to neutral-300
- **Disabled states:** neutral-300 to neutral-400
