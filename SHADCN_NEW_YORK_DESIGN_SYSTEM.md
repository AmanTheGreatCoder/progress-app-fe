# shadcn/ui Kit for Figma — New York (January 2025)

Design system reference extracted from the official Figma file. Use this when building UI so tokens, typography, and spacing stay aligned with the kit.

**Source:** [shadcn_ui-kit-for-Figma — New York — January 2025](https://www.figma.com/design/ujar4EkRFgI2s283UdlJEI/shadcn_ui-kit-for-Figma---New-York---January-2025?node-id=643-1940)  
**Extracted from node:** `Theme Preview` (`643:1940`) and related typography / component pages  
**Last synced:** May 2026

---

## Overview

| Property | Value |
|----------|--------|
| **Style** | New York (`new-york`) — slightly tighter radii, refined component proportions |
| **Base palette** | Slate (Tailwind `slate-*`) |
| **Primary typeface** | **Outfit** (`font-sans`) |
| **Monospace** | **Menlo** (`font-mono`; inline code also references Menlo in Figma) |
| **Figma variable collections** | `1. TailwindCSS` · `2. Theme` · `3. Mode` |


---

## Semantic colors

Colors use the `base/*` namespace in Figma (maps to shadcn CSS variables like `--background`, `--primary`, etc.).

### Light mode

| Token | Hex | Tailwind equivalent (approx.) | Usage |
|-------|-----|-------------------------------|--------|
| `background` | `#ffffff` | white | Page background |
| `foreground` | `#0f172a` | slate-900 | Primary text |
| `card` | `#ffffff` | white | Card surfaces |
| `card-foreground` | `#0f172a` | slate-900 | Text on cards |
| `popover` | *(mode variable)* | — | Popover/dropdown background |
| `popover-foreground` | *(mode variable)* | — | Popover text |
| `primary` | `#0f172a` | slate-900 | Primary actions, emphasis |
| `primary-foreground` | `#f8fafc` | slate-50 | Text on primary |
| `secondary` | `#f1f5f9` | slate-100 | Secondary surfaces |
| `secondary-foreground` | `#0f172a` | slate-900 | Text on secondary |
| `muted` | `#f1f5f9` | slate-100 | Muted backgrounds |
| `muted-foreground` | `#64748b` | slate-500 | Muted / helper text |
| `accent` | `#f8fafc` | slate-50 | Hover / accent fills |
| `accent-foreground` | `#0f172a` | slate-900 | Text on accent |
| `destructive` | `#dc2626` | red-600 | Errors, delete actions |
| `destructive-foreground` | `#fef2f2` | red-50 | Text on destructive |
| `border` | `#e2e8f0` | slate-200 | Borders, dividers |
| `input` | `#e2e8f0` | slate-200 | Input borders |
| `ring` | *(mode variable)* | — | Focus rings |
| `chart-1` … `chart-5` | *(mode variables)* | — | Data visualization |

### Dark mode

| Token | Hex | Tailwind equivalent (approx.) | Usage |
|-------|-----|-------------------------------|--------|
| `background` | `#020617` | slate-950 | Page background |
| `foreground` | `#f8fafc` | slate-50 | Primary text |
| `card` | `#0f172a` | slate-900 | Card surfaces |
| `card-foreground` | `#f8fafc` | slate-50 | Text on cards |
| `primary` | `#f8fafc` | slate-50 | Primary actions |
| `primary-foreground` | `#0f172a` | slate-900 | Text on primary |
| `secondary` | `#1e293b` | slate-800 | Secondary surfaces |
| `secondary-foreground` | `#f8fafc` | slate-50 | Text on secondary |
| `muted` | `#1e293b` | slate-800 | Muted backgrounds |
| `muted-foreground` | `#94a3b8` | slate-400 | Muted / helper text |
| `accent` | `#1e293b` | slate-800 | Hover / accent fills |
| `accent-foreground` | `#f8fafc` | slate-50 | Text on accent |
| `destructive` | `#7f1d1d` | red-900 | Errors, delete actions |
| `destructive-foreground` | `#fef2f2` | red-50 | Text on destructive |
| `border` | `#1e293b` | slate-800 | Borders, dividers |
| `input` | `#1e293b` | slate-800 | Input borders |

### Sidebar tokens (Figma `base/sidebar-*`)

Present in the kit as mode-aware variables. Names in Figma:

- `sidebar`, `sidebar-foreground`
- `sidebar-primary`, `sidebar-primary-foreground`
- `sidebar-accent`, `sidebar-accent-foreground`
- `sidebar-border`, `sidebar-ring`

### Chart tokens

Figma defines `base/chart-1` through `base/chart-5` plus `colors/chart-*-light` and `colors/chart-*-dark` in the theme library. Resolve these per mode in Figma’s **3. Mode** collection when implementing charts.

### CSS mapping example

```css
:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --primary: #0f172a;
  --primary-foreground: #f8fafc;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --destructive: #dc2626;
  --destructive-foreground: #fef2f2;
  --border: #e2e8f0;
  --radius: 0.375rem; /* 6px — see Border radius */
}

.dark {
  --background: #020617;
  --foreground: #f8fafc;
  --card: #0f172a;
  --destructive: #7f1d1d;
  --border: #1e293b;
}
```

---

## Typography

### Font families

| Token | Family | Use |
|-------|--------|-----|
| `typography/font family/font-sans` | **Outfit** | All UI and prose |
| `typography/font family/font-mono` | *(mono stack in library)* | Code blocks |
| Inline code | **Menlo** | `Typography / InlineCode` |

### Font weights

| Token | Value | Name |
|-------|-------|------|
| `font/weight/normal` | 400 | Regular |
| `font/weight/medium` | 500 | Medium |
| `font/weight/semibold` | 600 | Semibold |
| `font/weight/bold` | 700 | Bold |
| H1 | 800 | ExtraBold |

### Letter spacing

| Token | Value (px) | Use |
|-------|------------|-----|
| `font/letter-spacing/tighter` | -0.8 | Tight display |
| `font/letter-spacing/tight` | -0.4 | Headings h1–h4 |
| Default body | 0 | Paragraphs, lead, lists |

### Base type scale (`typography/base sizes/*`)

Used by components (buttons, labels, tables). Values are in **px**.

| Scale | Font size | Line height |
|-------|-----------|-------------|
| Extra small | 12 | 16 |
| Small | 14 | 20 |
| Base | 16 | 24 |
| Large | 18 | 28 |
| XLarge | 20 | 28 |
| 2X Large | 24 | 32 |
| 3X Large | 30 | 36 |
| 4X Large | 36 | 40 |

### Typography components (prose / docs)

Maps to [shadcn Typography](https://ui.shadcn.com/docs/components/typography).

| Component | Size | Line height | Weight | Letter spacing | Color |
|-----------|------|-------------|--------|----------------|-------|
| **H1** (desktop) | 48px | none (leading-none) | 800 | -0.4px | `foreground` |
| **H1** (mobile) | 36px | 40px | 800 | -0.4px | `foreground` |
| **H2** | 30px | 36px | 600 | -0.4px | `foreground` |
| **H3** | 24px | 32px | 600 | -0.4px | `foreground` |
| **H4** | 20px | 28px | 600 | -0.4px | `foreground` |
| **P** | 16px | 28px | 400 | 0 | `foreground` |
| **Lead** | 20px | 28px | 400 | 0 | `muted-foreground` |
| **Large** | 18px | 28px | 600 | 0 | `foreground` |
| **Small** | 14px | 14px | 500 | 0 | `foreground` |
| **Muted** | 14px | 14px | 500 | 0 | `muted-foreground` |
| **Blockquote** | 16px | 24px | 400 italic | 0 | `foreground` |
| **List** | 16px | 28px | 400 | 0 | `foreground` |
| **Table** | 16px | — | 400 / 700 (bold head) | 0 | `foreground` |
| **Inline code** | 14px | 20px | 600 | 0 | on `muted` bg |

### Tailwind / class equivalents

```tsx
// H1 desktop
className="scroll-m-20 text-5xl font-extrabold tracking-tight"

// H2
className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"

// Lead
className="text-xl text-muted-foreground"

// Inline code
className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
```

---

## Spacing

Tailwind-compatible scale from collection **1. TailwindCSS** (values in **px**).

| Token | px |
|-------|-----|
| `spacing/0` | 0 |
| `spacing/1` | 4 |
| `spacing/1-5` | 6 |
| `spacing/2` | 8 |
| `spacing/3` | 12 |
| `spacing/4` | 16 |
| `spacing/5` | 20 |
| `spacing/6` | 24 |
| `spacing/7` | 28 |
| `spacing/8` | 32 |
| `spacing/9` | 36 |
| `spacing/10` | 40 |
| `spacing/11` | 44 |
| `spacing/16` | 64 |
| `spacing/32` | 128 |
| `spacing/36` | 144 |
| `spacing/72` | 288 |

Common layout spacing seen in previews: card padding **24px** (`spacing/6`), section gaps **32–40px**.

---

## Border radius

Collection **2. Theme** — New York uses **6px** as the default component radius.

| Token | px | Typical use |
|-------|-----|-------------|
| `border radius/sm` | 2 | Subtle corners |
| `radius/rounded` | 4 | Inline code |
| `border radius/default` | 6 | Buttons, inputs, cards (base `--radius`) |
| `border radius/md` | 6 | Same as default |
| `border radius/lg` | 8 | Larger cards |
| `border radius/xl` | *(in library)* | Modals, sheets |
| `border radius/2xl` | *(in library)* | Hero panels |
| `border radius/full` | 9999 | Pills, avatars |

### shadcn CSS radius derivatives

When `--radius: 6px`:

| CSS variable | Formula | Result |
|--------------|---------|--------|
| `--radius-sm` | `radius × 0.6` | 3.6px |
| `--radius-md` | `radius × 0.8` | 4.8px |
| `--radius-lg` | `radius` | 6px |
| `--radius-xl` | `radius × 1.4` | 8.4px |

---

## Shadows

| Token | Definition |
|-------|------------|
| `shadow/sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `shadow/base` | `0 1px 2px rgba(0,0,0,0.06)`, `0 1px 3px rgba(0,0,0,0.1)` |
| `shadow/lg` | `0 4px 6px -2px rgba(0,0,0,0.05)`, `0 10px 15px -3px rgba(0,0,0,0.1)` |

---

## Sizing (components)

| Token | px | Maps to |
|-------|-----|---------|
| `height/h-4` | 16 | Icon xs |
| `height/h-5` | 20 | Icon sm |
| `height/h-7` | 28 | Compact controls |
| `height/h-8` | 32 | Button `sm` |
| `height/h-9` | 36 | Button `default`, Input |
| `height/h-10` | 40 | Button `lg` |
| `width/w-4` … `w-10` | 16–40 | Matching widths for icon buttons |

### Button sizes (New York)

| Size | Height | Typical padding | Font |
|------|--------|-----------------|------|
| `sm` | 32px | horizontal ~16px | 14px medium |
| `default` | 36px | horizontal ~16px | 14px medium |
| `lg` | 40px | horizontal ~24px | 14px medium |
| `icon` | 36×36px | — | — |

### Button variants

| Variant | Light behavior (summary) |
|---------|---------------------------|
| **Default** | `primary` fill, `primary-foreground` text |
| **Secondary** | `secondary` fill |
| **Destructive** | `destructive` fill (`#dc2626` light / `#7f1d1d` dark) |
| **Outline** | Border `border`, transparent bg, hover → `accent` |
| **Ghost** | Transparent, hover → `accent` |
| **Link** | Text only, underline on hover |

States: **Default**, **Hover**, **Disabled**, **Loading** (see Button page in Figma).

---

## Opacity

| Token | % |
|-------|---|
| `opacity/opacity-20` | 20 |
| `opacity/opacity-25` | 25 |
| `opacity/opacity-50` | 50 |

Used for disabled overlays and subtle UI (e.g. `alpha/90` on dark destructive hover: `#ffffff1a`).

---

## Layout

| Token | px |
|-------|-----|
| `max-width/max-w-sm` | 384 |

---

## Figma file structure (quick map)

| Page | Node ID | Contents |
|------|---------|----------|
| Documentation | `580:9181` | Getting started, variables, theming, dev notes |
| Typography | `22:1400` | Full type ramp (light + dark) |
| Theme Preview | `643:1940` | **Your link** — dashboard-style light/dark preview |
| Button | `34:6` | All variants, sizes, states |
| Icons | `1:433` | Lucide-based icon set |
| Components | `34:6`, `46:65`, … | Avatar, Badge, Card, Input, etc. |
| Blocks (Official) | `477:11332` | Pre-built dashboard blocks |

---

## Implementing in React / Tailwind

### 1. Install Outfit

```bash
npm install @fontsource/outfit
```

```css
@import "@fontsource/outfit/400.css";
@import "@fontsource/outfit/500.css";
@import "@fontsource/outfit/600.css";
@import "@fontsource/outfit/700.css";
@import "@fontsource/outfit/800.css";

@theme inline {
  --font-sans: "Outfit", ui-sans-serif, system-ui, sans-serif;
}
```

### 2. Use semantic tokens (recommended)

Prefer shadcn utilities tied to CSS variables:

```tsx
<div className="bg-background text-foreground">
  <h1 className="text-5xl font-extrabold tracking-tight">Title</h1>
  <p className="text-muted-foreground">Subtitle</p>
  <Button variant="destructive">Delete</Button>
</div>
```

### 3. Match Figma hex exactly

Copy light/dark tables above into `:root` and `.dark` in your global CSS (or sync from Figma Variables export).

---

## Related links

- [shadcn/ui — New York style](https://ui.shadcn.com/docs/components)
- [Typography component docs](https://ui.shadcn.com/docs/components/typography)
- [Theming](https://ui.shadcn.com/docs/theming)
- [Figma kit (source)](https://www.figma.com/design/ujar4EkRFgI2s283UdlJEI/shadcn_ui-kit-for-Figma---New-York---January-2025)

---
