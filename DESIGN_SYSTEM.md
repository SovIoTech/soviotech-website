# Soviotech — Design System

Single source of truth for all design decisions. Every prompt to Claude Code about UI/UX must reference this file. If a rule here is violated, that is a bug.

References synthesized: **Linear** (typographic restraint, gradient-on-black hero), **Vercel** (geometric grids, terminal-as-hero), **Resend** (live-feeling product demos), **Anthropic** (serif/sans pairing, generous whitespace, technical-but-warm voice), **Railway** (dark glow/glass, strong motion).

---

## 1. Design Principles

These come first. When tokens conflict with principles, principles win.

1. **Substance over decoration.** Every visual element earns its presence with information value or hierarchy reinforcement. No abstract shapes for "vibes."
2. **Engineering credibility is the brand.** The site should feel like an oscilloscope readout, not a marketing campaign. Mono fonts, real terminal output, real schematics.
3. **Restraint is premium.** Linear and Anthropic look expensive because 95% of the page is whitespace, neutral surfaces, and one assertive type choice. Resist the urge to fill space.
4. **Motion serves comprehension.** Animations reveal structure (scroll-linked reveals, sequence numbering) — they never decorate.
5. **One accent. Used sparingly.** The lime `#c8ff00` is a scalpel, not a paintbrush. If accent appears more than ~6 times above the fold, cut something.
6. **Prove it, don't claim it.** Replace adjectives ("scalable", "robust") and placeholders (`0+`) with artifacts: a real telemetry chart, a real schematic, a real client logo, a real metric.

---

## 2. Color Tokens

Locked. Do not introduce new hexes without updating this section.

```css
/* Backgrounds — five steps for layered depth */
--bg:        #0a0a0b;   /* canvas — true near-black */
--bg-2:      #111113;   /* alt sections (zebra) */
--bg-3:      #19191d;   /* elevated cards on bg-2 */
--surface:   #1e1e23;   /* modals, popovers */
--bg-deep:   #050506;   /* hero overlay, footer */

/* Borders — three steps */
--border:    #2a2a32;   /* default hairline */
--border-2:  #3a3a45;   /* hover/active hairline */
--border-3:  #4a4a58;   /* focus ring base */

/* Text — three steps + inverse */
--text:      #e8e6e3;   /* primary copy, headings */
--text-2:    #9d9b97;   /* secondary copy, descriptions */
--text-3:    #6b6966;   /* tertiary, captions, meta */
--text-inv:  #0a0a0b;   /* on accent backgrounds */

/* Accent — chartreuse, signature */
--accent:        #c8ff00;
--accent-2:      #a6d400;   /* hover state */
--accent-dim:    rgba(200, 255, 0, 0.08);   /* tag backgrounds */
--accent-glow:   rgba(200, 255, 0, 0.15);   /* glow halos */
--accent-line:   rgba(200, 255, 0, 0.30);   /* dividers, key strokes */

/* Semantic — use rarely, only for status */
--blue:      #4a9eff;       /* JSON keys in code, links inside terminal */
--amber:     #e8a848;       /* string literals, warnings */
--green:     #4ade80;       /* success states, "online" indicators */
--red:       #ff6b6b;       /* error states only — never decorative */
```

### Accent usage rules

- **DO** use accent for: 1 hero word, 1 CTA, section tags, terminal `t-val` tokens, single-pixel dividers under section headings.
- **DO NOT** use accent for: card backgrounds, body text, multiple buttons in same viewport, decorative gradients spanning >30% of any section.
- **Glow rule:** `--accent-glow` is allowed only on the hero, the primary CTA, and "live" indicators (e.g., a pulsing dot on a status badge).

---

## 3. Typography

```css
--font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
--font-body:    'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono:    'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
```

**Why two sans-serifs?** Space Grotesk has personality at display sizes; Inter is the most-readable-at-small-sizes interface font shipped. Display gets the headlines; body gets the paragraphs. This pairing is the Linear move.

### Type scale

Strict modular scale, base 16px, ratio ~1.25 (major third).

| Token         | Size                       | Weight | Line-height | Use                          |
|---------------|----------------------------|--------|-------------|------------------------------|
| `--t-display` | `clamp(2.8rem, 7vw, 5.5rem)` | 700    | 1.05        | Hero only                    |
| `--t-h1`      | `clamp(2rem, 4vw, 3rem)`   | 700    | 1.15        | Section titles               |
| `--t-h2`      | `1.6rem`                   | 700    | 1.2         | Project titles               |
| `--t-h3`      | `1.2rem`                   | 600    | 1.3         | Card titles                  |
| `--t-h4`      | `1rem`                     | 600    | 1.4         | Sub-card titles              |
| `--t-body-lg` | `1.05rem`                  | 400    | 1.7         | Lead paragraphs, hero sub    |
| `--t-body`    | `0.95rem`                  | 400    | 1.65        | Default body                 |
| `--t-small`   | `0.875rem`                 | 400    | 1.5         | UI text                      |
| `--t-caption` | `0.75rem`                  | 500    | 1.4         | Meta, timestamps             |
| `--t-mono-sm` | `0.8rem`                   | 500    | 1.5         | Section tags, eyebrow labels |

### Letter-spacing rules

- Display & H1: `letter-spacing: -0.03em` (tighten — premium feel)
- H2 / H3: `letter-spacing: -0.02em`
- Body: `letter-spacing: 0`
- Mono eyebrow / caption uppercase: `letter-spacing: 0.08em` (open up — terminal feel)
- All-caps labels: ALWAYS `letter-spacing: 0.06em` minimum

### Hero headline rule

Hero headline is **two lines maximum, ≤7 words per line.** One word may be wrapped in `.hero__title-accent` (lime). Never two.

---

## 4. Spacing Scale

8-point grid. No exceptions.

```css
--s-1:  4px;
--s-2:  8px;
--s-3:  12px;
--s-4:  16px;
--s-5:  24px;
--s-6:  32px;
--s-7:  48px;
--s-8:  64px;
--s-9:  96px;
--s-10: 128px;
```

**Section padding:** `padding: var(--s-10) 0;` (128px top/bottom). Never less for top-level sections. This is the Anthropic move — generous breathing room signals confidence.

**Card padding:** `padding: var(--s-6) var(--s-7);` (32px / 48px). Cards should feel airy, not stuffed.

**Container max-width:** `1200px`. Hero/CTA may go to `1100px` for tighter focus.

---

## 5. Borders, Radii, Shadows

### Border radii

```css
--r-sm:   4px;   /* tags, mono labels */
--r-md:   6px;   /* nav CTA, small buttons */
--r-lg:   8px;   /* default buttons, inputs */
--r-xl:   12px;  /* cards, terminal */
--r-2xl:  16px;  /* hero feature blocks */
--r-full: 999px; /* pills, status dots */
```

### Shadows — use sparingly on dark UI

```css
--shadow-sm:    0 1px 2px rgba(0,0,0,0.4);
--shadow-md:    0 4px 12px rgba(0,0,0,0.35);
--shadow-glow:  0 0 32px rgba(200, 255, 0, 0.15);   /* accent halo — hero CTA only */
--shadow-card-hover: 0 12px 32px rgba(0,0,0,0.45), 0 0 1px var(--border-3);
```

### The "1px hairline" rule

Most premium dark UIs (Linear, Railway) lean almost entirely on **1px borders + bg shifts** for elevation, not shadows. Default to `border: 1px solid var(--border)` for cards. Use shadows only when the element must lift off the page (modal, hero CTA hover).

---

## 6. Component Patterns

### 6.1 Buttons

Three variants, no more.

| Variant     | Background           | Text       | Border                  | Hover                                  |
|-------------|----------------------|------------|-------------------------|----------------------------------------|
| `--primary` | `var(--accent)`      | `--bg`     | none                    | `--accent-2` + `translateY(-1px)` + glow |
| `--ghost`   | transparent          | `--text`   | `1px var(--border-2)`   | bg `rgba(255,255,255,0.03)` + border `--text-2` |
| `--quiet`   | transparent          | `--text-2` | none                    | color `--text` + arrow translateX(2px) |

All buttons: `padding: 12px 28px`, `border-radius: var(--r-lg)`, transition `all 0.25s var(--ease)`. Large variant: `padding: 16px 36px`.

**Magnetic hover (premium move):** Primary CTAs in hero/CTA sections get a subtle pointer-following transform — capped at 8px deviation. Implemented in JS, scoped to `.btn--magnetic` class only.

### 6.2 Cards

Default state: `bg-2` background, 1px `--border`, `--r-xl` radius, 32px/36px padding. Hover state: `bg-3` background, `--border-2` border, `translateY(-2px)`. Transition: `all 0.4s var(--ease)`.

**Bento variant** (for solutions section): asymmetric grid, one card spanning 2 columns containing a live mini-demo (animated chart, scrolling log, schematic). The other 3 are standard.

### 6.3 Terminal blocks

The signature Soviotech component. Rules:

- Mac-style traffic lights (3 dots, `--border-2` color — NOT colored, that's cliché)
- File-name label aligned right of dots in `--text-3` mono
- Body padding: 20px, line-height 1.8
- Color tokens: `t-comment` (text-3), `t-key` (text-2), `t-prop` (blue), `t-val` (accent), `t-str` (amber)
- **Premium upgrade:** terminals on first scroll into view should *type themselves* — character-by-character reveal at ~30 chars/sec. After full reveal, a soft caret blinks at the end.

### 6.4 Section eyebrows

Every section starts with `// section name` in mono accent, all lowercase. This is locked — it's your brand voice.

### 6.5 Status indicators

Pulsing 6px dot + label. Used for: "Live" (green pulse on case study), "Deployed" (accent pulse on hero), "Online" (green) on team avatars.

---

## 7. Motion System

```css
--ease:        cubic-bezier(0.16, 1, 0.3, 1);   /* default — exit quickly, settle slowly */
--ease-in:     cubic-bezier(0.4, 0, 1, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--dur-fast:    150ms;
--dur-base:    250ms;
--dur-slow:    400ms;
--dur-reveal:  600ms;
```

### Motion rules

1. **Hover state:** `--dur-base` (250ms). Always.
2. **Scroll reveals:** `--dur-reveal` (600ms), staggered 80ms between siblings. Use IntersectionObserver, threshold 0.2, `once: true`.
3. **Page-level transitions:** prefer view transitions API where supported.
4. **No bounce on serious elements.** `--ease-spring` is for playful micro-interactions only (icon nudges, copy-to-clipboard confirmations). Cards, sections, buttons use `--ease`.
5. **Respect `prefers-reduced-motion`.** All `transform` and `opacity` reveals must short-circuit to no-op when set. Required.

### Signature motion patterns to add

- **Hero word swap:** the accent word in the headline cycles through 3–4 alternates every ~3 seconds with crossfade + 8px Y. Already partially implemented in `script.js` — verify and polish.
- **Marquee logo strip:** infinite horizontal scroll of client/tech logos at the seam between hero and solutions. CSS-only, paused on hover.
- **Scroll-driven progress line:** thin accent line in the side gutter that fills as the user scrolls. Premium Apple-style cue.
- **Magnetic CTAs:** hero + final CTA only.

---

## 8. Section-by-Section Spec

### Hero
- Full viewport height, `padding: 120px 24px 80px`
- Grid background with radial mask (already implemented — keep)
- **NEW:** add subtle noise texture overlay at 4% opacity (premium tactile feel)
- Mono eyebrow → display headline (with one accent word, animated swap) → body lede → CTA pair → stat row
- **Replace `0+` placeholders** with concrete artifacts: "1.2M sensor events/day processed", "AWS us-east-1 + eu-west-2", "ISO 27001 aligned" — each as a small terminal-style card, not a number

### Solutions (was: services)
- Switch from 2×2 uniform grid to **bento layout**: 1 wide + 2 narrow + 1 wide on alternating rows
- Wide cards contain a live demo element (animated waveform, JSON streaming, schematic)
- Each card retains: icon (24px line, accent color), heading, 2-line description, stack tags

### Process (was: how we work)
- Keep horizontal-then-vertical responsive flow
- **NEW:** add a thin animated line connecting the steps that draws itself on scroll (SVG `stroke-dashoffset` animation)
- Step numbers: oversized mono `01`–`04`, `--accent-glow` color (large but quiet)

### Projects (case studies)
- Keep terminal-paired layout — it's distinctive
- **NEW:** each terminal types itself on scroll-in
- **NEW:** add a results strip below each project: 3 metrics in mono, accent left-border (already in CSS — use it consistently)
- **NEW:** if no real client logos available, show "Confidential — defense" / "Confidential — utilities" badges in mono. Honesty reads as premium.

### Tech stack
- Keep 4-column grid
- **NEW:** column headers get a tiny status dot (green pulse) labeled "in production" — proves stack is live, not aspirational

### Team
- Keep 3-card grid
- Avatars stay as monogram tiles (already updated to ES / AM / FE)
- **NEW:** add subtle hover state — accent border-glow + 1px border accent on hover

### CTA
- Keep centered, narrow column
- **NEW:** wrap final CTA in a subtle radial accent-glow background, `--shadow-glow`
- Mono email button is on-brand — keep

### Footer
- Minimal. Keep brand on left, copy on right
- **NEW:** add tiny "All systems operational" status indicator with pulsing green dot — links to a status page (or fake one for now)

---

## 9. Things That Make It Look AI-Generated (and how to avoid)

This list comes from the source video — the "AI slop" markers. Audit every component against it.

| Symptom                                     | Fix                                                            |
|---------------------------------------------|----------------------------------------------------------------|
| Generic stat numbers (`0+`, `99.9%`, `24/7`) | Use real artifacts (event counts, region codes, cert names)    |
| Lorem-style adjectives ("scalable", "robust")| Replace with verbs + objects ("ingests 1M events/sec")         |
| Glowing gradient backgrounds on every section| Limit to hero + final CTA. Other sections: solid `--bg-2`      |
| Identical card hover (lift + border)        | Vary by section: cards lift, terminals glow, team scales       |
| Symmetric grids everywhere                  | Use asymmetric bento for solutions; symmetric for stack/team   |
| Default border-radius `8px` on everything   | Use the 6-step radius scale rigorously                         |
| Generic "Trusted by" with fake logos        | Either real logos or omit entirely. No fake social proof.      |
| Triple-stacked CTAs                         | One primary CTA per viewport. Maximum.                         |

---

## 10. Implementation Checklist (in order)

1. ✅ DESIGN_SYSTEM.md authored (this file)
2. Audit current `style.css` — extract any hardcoded values not yet in tokens, refactor to tokens
3. Hero: replace placeholder stats with real artifacts; add noise texture; verify word-swap animation
4. Solutions: refactor 2×2 → bento layout with one live-demo card
5. Process: add SVG draw-on-scroll connector
6. Projects: terminal type-on-scroll; results strip
7. Stack: production status dots
8. Team: accent-glow hover
9. CTA: radial glow background
10. Footer: live status indicator
11. Global: marquee logo strip between hero and solutions
12. Global: scroll-progress line in side gutter
13. Global: magnetic hover on hero + final CTA
14. Accessibility pass: `prefers-reduced-motion`, focus states, color contrast
15. Lighthouse pass: target 95+ on all four metrics
