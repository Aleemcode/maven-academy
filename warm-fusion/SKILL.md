---
name: dmaven-warm-fusion
description: >-
  Comprehensive guide and design system rules for DMaven Design System (Warm Fusion).
  Combines Neo-Brutalist tactile physics with Swiss typographic warmth for rich multi-color brands.
  Includes 12-step Radix semantic color tokens, Tailwind CSS presets, complete React + Radix UI component library, Phosphor Icons, and strict guardrails.
---

# DMaven Design System · Warm Fusion (`dmaven-warm-fusion`)

The **DMaven Design System** is an intentional, high-contrast design language and component architecture born from the fusion of **Neo-Brutalist structural physics** and **Swiss typographic warmth**, engineered specifically for expressive, multi-color brand identities.

---

## 1. The Design Genesis & Philosophy

### A. The Neo-Brutalist Outset (The Bone)
- **Tactile Physics**: Crisp 2.5px ink borders (`var(--slate-12)` / `#001F51`), hard 5px × 5px drop shadows with zero blur, and physical press micro-interactions (`translate(2px, 2px)` on active/hover).
- **Structural Confidence**: High visual clarity, bold monospace badges, distinct section boundaries, and truth to screen.

### B. The Swiss Style Warmth (The Soul)
- **Organic Grounds**: Replaces cold sterile pure whites/grays with warm organic cream backgrounds (`var(--sand-1)`, `var(--sand-2)`).
- **Human Typographic Scale**: High-character display headers (`Bricolage Grotesque`), ultra-legible modern body type (`Instrument Sans`), precise data badges (`Space Mono`), and classical Arabic script (`Amiri`).
- **Warm Rounded Curves**: Generous rounded corners (16px / 22px) and pill chips that soften brutalist rigidity into an inviting, approachable artifact.

### C. Multi-Color Brand Harmony
- Engineered specifically for brands with rich multi-color palettes (Deep Navy, Sacred Terra, Emerald Growth, Warm Gold, Brilliant Blue), ensuring high vibrancy without visual clutter.

---

## 2. Radix UI 12-Step Semantic Color Token Standard

DMaven Warm Fusion uses the standard **Radix UI 12-step color scale** (`@radix-ui/colors`) mapped to semantic roles:

```
Step 1–2:  Ground / App Canvases & Section Washes
Step 3–5:  Interactive Surfaces, Tints & Card Hover/Active States
Step 6–8:  UI Borders & Focus Rings
Step 9–10: Solid Backgrounds & Primary CTAs (High Contrast)
Step 11:   Muted / Secondary Text
Step 12:   High-Contrast Ink & Brutalist 2.5px Structural Borders
```

### Semantic Token Mapping Table
| Token Variable | Radix Color Token | Value (Light) | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--wf-ground` | `var(--sand-2)` | `#F9F6F0` | App canvas background |
| `--wf-ground-2` | `var(--sand-3)` | `#F1ECE0` | Raised section wash |
| `--wf-surface` | `#FFFFFF` / `var(--sand-1)` | `#FFFFFF` | Card & modal surface |
| `--wf-ink` / `--wf-border` | `var(--slate-12)` | `#001F51` | Primary ink & 2.5px brutalist border |
| `--wf-ink-2` | `var(--slate-11)` | `#27456D` | Secondary body text |
| `--wf-muted` | `var(--sand-11)` | `#5E5646` | Muted captions & metadata |
| `--wf-terra` | `var(--orange-9)` | `#FB5707` | Primary CTA & energy accent |
| `--wf-terra-deep` | `var(--orange-10)` | `#D44200` | CTA active / hover state |
| `--wf-green` | `var(--grass-9)` | `#1BC67F` | Emerald growth & success indicator |
| `--wf-green-dark` | `var(--grass-11)` | `#006634` | Dark green ink & badges |
| `--wf-gold` | `var(--amber-9)` | `#FFCB66` | Warm gold & prestige highlight |
| `--wf-blue` | `var(--blue-9)` | `#3B86FE` | Brilliant blue info & links |
| `--wf-danger` | `var(--crimson-9)` | `#E11D48` | Danger actions & error states |

---

## 3. Official System Icon Standard: Phosphor Icons
- **Official Icon Family**: **Phosphor Icons** (`@phosphor-icons/react`, `@phosphor-icons/web`).
- **Default Weight**: `bold` (matches the 2.5px brutalist border weight and geometric character).
- **Never use emojis** for UI navigation or buttons. Always use Phosphor Icons:
  ```tsx
  import { ArrowRight, CheckCircle, Warning, XCircle, Info, Sparkle, SlidersHorizontal } from "@phosphor-icons/react";
  // Usage:
  <ArrowRight weight="bold" className="w-5 h-5" />
  ```

---

## 4. Complete React + Radix Component Library

Install package:
```bash
npm install @designmaven/design-system @phosphor-icons/react
```

### Component 1: `Button`
Tactile physical button with zero text wrapping, brutalist borders, and click offset physics.
```tsx
import { Button } from "@designmaven/design-system";
import { Sparkle, ArrowRight } from "@phosphor-icons/react";

<Button variant="primary" size="md">
  <Sparkle weight="bold" /> Start Assessment <ArrowRight weight="bold" />
</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger">Delete Workspace</Button>
```

### Component 2: `Card`
Tactile card with hard drop shadow and optional hover lift micro-interaction.
```tsx
import { Card, Badge } from "@designmaven/design-system";

<Card variant="surface" interactive>
  <Badge variant="terra">Active Batch</Badge>
  <h3 className="font-display font-bold text-lg text-ink mt-2">Tactile Card Container</h3>
  <p className="font-body text-sm text-ink-2 mt-1">Swiss warmth fused with crisp structural boundaries.</p>
</Card>
```

### Component 3: `Badge` / `Tag`
High-contrast monospace pill tag for categories, status badges, and metadata.
```tsx
import { Badge } from "@designmaven/design-system";
import { CheckCircle } from "@phosphor-icons/react";

<Badge variant="terra">New Release</Badge>
<Badge variant="green"><CheckCircle weight="bold" /> 100% Verified</Badge>
<Badge variant="gold">Premium</Badge>
<Badge variant="neutral">Draft</Badge>
```

### Component 4: `Dialog` / `Modal` & `Drawer`
Centered dialog on desktop with hard 8px shadow; docks automatically to the bottom edge with a drag handle on mobile viewports ($\le 680\text{px}$).
```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button } from "@designmaven/design-system";

<Dialog>
  <DialogTrigger asChild>
    <Button variant="primary">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Adaptive Modal & Drawer</DialogTitle>
      <DialogDescription>
        Renders as a floating centered modal on desktop and docks seamlessly as a tactile bottom sheet on mobile screens.
      </DialogDescription>
    </DialogHeader>
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="secondary">Dismiss</Button>
      <Button variant="primary">Confirm Action</Button>
    </div>
  </DialogContent>
</Dialog>
```

### Component 5: `Toast` (Signature Feedback Notification)
Monospace status pill header with clear colored indicator and conversational copy.
```tsx
import { Toast, useToast } from "@designmaven/design-system";

const { toast } = useToast();

// Success
toast({
  type: "success", // Header: "✓ SUCCESS · #1BC67F"
  title: "Profile updated successfully!",
  description: "Your brand tokens have been synchronized across all views."
});

// Error
toast({
  type: "error", // Header: "× ERROR · #E11D48"
  title: "Connection timeout",
  description: "Could not reach the database. Please check your credentials."
});
```

### Component 6: `Input`, `Select`, `Textarea`
Tactile input controls with generous padding, right-aligned dropdown chevrons, and high-contrast focus rings.
```tsx
import { Input, Select, Textarea } from "@designmaven/design-system";

<Input label="Workspace Name" placeholder="e.g. BrilliantRoots Production" />
<Select label="Color Preset" options={[{ label: "Warm Fusion", value: "classic" }]} />
<Textarea label="Custom Guardrails" rows={4} />
```

### Component 7: `Tabs`, `Accordion`, `Switch`
Accessible Radix primitives styled with tactile DMaven borders and active pill states.
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent, Accordion, Switch } from "@designmaven/design-system";
```

---

## 5. Strict System Guardrails

1. **Icons**: Exclusively use **Phosphor Icons** (weight: `bold` or `regular`). Never use system emojis or mismatched icon sets.
2. **Shadows**: Never use soft, blurred shadows. Always use hard offset drop shadows (`5px 5px 0 var(--wf-border)`).
3. **Ink & Borders**: Default to Deep Navy `var(--slate-12)` (`#001F51`). Never use pure `#000000` black unless explicitly configured.
4. **Button Wrapping**: Always enforce `white-space: nowrap !important;` on buttons and action chips. Text must never break into two awkward lines inside a button.
5. **Mobile-first Drawer / Modal standard**:
   - On screens $\le 680\text{px}$, modals **must** dock to `bottom: 0` as a bottom-sheet drawer with a tactile drag handle (`.wf-modal-handle`), zero lateral offset, and safe-area padding.
   - On desktop screens ($> 680\text{px}$), modals render as centered dialogs with a solid 8px × 8px drop shadow.
6. **Minimum Touch Target**: All interactive elements must maintain a minimum tap target of 44px × 44px on mobile viewports.
7. **Tactile Button Press**: Interactive buttons must animate with physical feedback on active:
   `transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--wf-border);`.
