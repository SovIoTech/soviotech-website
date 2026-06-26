# SEO Plan — Soviotech (soviotech.com)

**Plan date:** 2026-06-26
**Scope:** Three production pages — `index.html`, `work.html`, `about.html`.
**Stack:** Static HTML on Cloudflare Pages, no CMS, no build step.
**Sources:** Google Search Central (developers.google.com/search), web.dev (Core Web Vitals 2026), Schema.org, MDN, OpenGraph spec.

---

## 1. Page intent map

Every page gets one clear primary intent. Drives title, description, H1, internal links.

| Page | Primary intent | Primary query class | Target keyword head |
|---|---|---|---|
| `index.html` | "Who are these people and what do they do?" | Brand / capability discovery | **end-to-end IoT and embedded engineering services** |
| `work.html` | "Show me their actual projects." | Portfolio / proof | **embedded firmware and RF engineering portfolio** |
| `about.html` | "Can I trust them with my project?" | Team / operations / process | **small engineering studio operating model** |

No keyword cannibalization: each page owns one theme. Internal links push trust toward `work.html` (the highest-conversion page).

---

## 2. Technical SEO checklist

### Crawlability

- [ ] `robots.txt` at repo root — template in §7
- [ ] `sitemap.xml` at repo root with the 3 production URLs only — template in §7
- [ ] Confirm no production page has `noindex`. Currently archive pages (`/glb-test.html`, `/logo-redesign.html`) get `X-Robots-Tag: noindex` via `_headers`. Verified correct.
- [ ] All 3 pages reachable in ≤1 click from `index.html` (current nav already does this).
- [ ] No redirect chains. The `www → apex` rule in `_redirects` is one hop. Verified.

### Indexability

- [ ] Canonical tag on every page (apex domain, no trailing slash except home):
  - `index.html` → `<link rel="canonical" href="https://soviotech.com/">`
  - `work.html` → `<link rel="canonical" href="https://soviotech.com/work">`
  - `about.html` → `<link rel="canonical" href="https://soviotech.com/about">`
- [ ] Strip `.html` extension via `_redirects` (cleaner URLs):
  ```
  /index.html   /                  301!
  /work.html    /work              301!
  /about.html   /about             301!
  ```
- [ ] Set Cloudflare Pages to serve `index.html` as default — already its default.

### Mobile-first

- [ ] Google indexes the mobile rendering. Carousel is replaced with `.projects-mobile` stub on mobile — confirm crawler sees this. Use Chrome → Lighthouse Mobile.
- [ ] All copy on mobile stub must reflect the same keyword intent as desktop carousel.

---

## 3. On-page meta — explicit per-page tags

Drop the block below into each page's `<head>`. Replace existing `<title>` / `<meta name="description">`.

### `index.html`

```html
<title>Soviotech — End-to-End IoT, Embedded &amp; RF Engineering</title>
<meta name="description" content="Soviotech is a small engineering studio shipping production-grade hardware, firmware, cloud, and RF systems. Sensor-to-dashboard, owned end-to-end.">
<link rel="canonical" href="https://soviotech.com/">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Soviotech">
<meta property="og:url" content="https://soviotech.com/">
<meta property="og:title" content="Soviotech — End-to-End IoT, Embedded &amp; RF Engineering">
<meta property="og:description" content="One small team shipping production-grade hardware, firmware, cloud, and RF systems. Sensor to dashboard, owned end-to-end.">
<meta property="og:image" content="https://soviotech.com/og/og-home.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Soviotech — End-to-End IoT, Embedded &amp; RF Engineering">
<meta name="twitter:description" content="One small team shipping production-grade hardware, firmware, cloud, and RF systems.">
<meta name="twitter:image" content="https://soviotech.com/og/og-home.png">
```

### `work.html`

```html
<title>Work — Embedded, RF &amp; IoT Engineering Portfolio | Soviotech</title>
<meta name="description" content="25 production engineering projects across RF, embedded firmware, IoT, and edge AI. Each entry ships with the source repo and a 2-page case study.">
<link rel="canonical" href="https://soviotech.com/work">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Soviotech">
<meta property="og:url" content="https://soviotech.com/work">
<meta property="og:title" content="Work — Embedded, RF &amp; IoT Engineering Portfolio | Soviotech">
<meta property="og:description" content="25 production engineering projects across RF, embedded firmware, IoT, and edge AI.">
<meta property="og:image" content="https://soviotech.com/og/og-work.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Work — Embedded, RF &amp; IoT Engineering Portfolio | Soviotech">
<meta name="twitter:description" content="25 production engineering projects across RF, embedded firmware, IoT, and edge AI.">
<meta name="twitter:image" content="https://soviotech.com/og/og-work.png">
```

### `about.html`

```html
<title>About — How Soviotech Operates | Small Engineering Studio</title>
<meta name="description" content="Three engineers, all three layers. How Soviotech ships hardware, cloud, and interfaces under one roof — with long-term support after delivery.">
<link rel="canonical" href="https://soviotech.com/about">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Soviotech">
<meta property="og:url" content="https://soviotech.com/about">
<meta property="og:title" content="About — How Soviotech Operates | Small Engineering Studio">
<meta property="og:description" content="Three engineers, all three layers. Hardware, cloud, and interface under one roof — with long-term support after delivery.">
<meta property="og:image" content="https://soviotech.com/og/og-about.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="About — How Soviotech Operates">
<meta name="twitter:description" content="Three engineers, all three layers. Hardware, cloud, and interface under one roof.">
<meta name="twitter:image" content="https://soviotech.com/og/og-about.png">
```

### Title / description rules applied

- Titles 55-60 chars; primary keyword in first 30; brand at end.
- Descriptions 145-160 chars; one sentence; honest, no clickbait.
- OG image: 1200×630 PNG, < 200KB each. Live under `/og/`.

---

## 4. Heading structure (fix any drift)

| Page | H1 (one only) | H2 themes |
|---|---|---|
| `index.html` | "We automate what matters." | Selected work · How we work |
| `work.html` | "Boards we shipped. Code that runs in production." | Selected Work · CTA |
| `about.html` | "One small team. All three layers." | How we operate · Long-term support · CTA |

**Audit task:** confirm each page has exactly one `<h1>`. Demote duplicates to `<h2>`/`<h3>`.

---

## 5. Structured data (JSON-LD)

Drop into each page's `<head>`. Validate after deploy at https://search.google.com/test/rich-results.

### Site-wide (all pages) — Organization

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Soviotech",
  "url": "https://soviotech.com/",
  "logo": "https://soviotech.com/logo.png",
  "email": "info@soviotech.com",
  "description": "Small engineering studio shipping production-grade hardware, firmware, cloud, and RF systems.",
  "areaServed": "Worldwide",
  "sameAs": [
    "https://github.com/SovIoTech"
  ]
}
</script>
```

### `index.html` — WebSite (enables search-as-you-type sitelinks later)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Soviotech",
  "url": "https://soviotech.com/",
  "publisher": { "@type": "Organization", "name": "Soviotech" }
}
</script>
```

### `work.html` — CollectionPage with hasPart[] for the 25 projects

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Soviotech Work",
  "url": "https://soviotech.com/work",
  "isPartOf": { "@type": "WebSite", "name": "Soviotech", "url": "https://soviotech.com/" },
  "hasPart": [
    { "@type": "CreativeWork", "name": "AWR2944 77 GHz Radar Board", "url": "https://github.com/SovIoTech/AWR2944-77-GHz-Radar-Board" },
    { "@type": "CreativeWork", "name": "GaN Power Amplifier 5-6 GHz 10 W", "url": "https://github.com/SovIoTech/GaN-Power-Amplifier-5-to-6-GHz-10-W" }
  ]
}
</script>
```

Generate the full 25-item list from the `PROJECTS` array in `work-page.js`.

### `about.html` — AboutPage + breadcrumb

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Soviotech",
  "url": "https://soviotech.com/about",
  "mainEntity": { "@type": "Organization", "name": "Soviotech" }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://soviotech.com/" },
    { "@type": "ListItem", "position": 2, "name": "About", "item": "https://soviotech.com/about" }
  ]
}
</script>
```

**Do NOT add** `FAQPage`, `Product`, or `Review` schema — content doesn't match those types. Schema must match real on-page content per Google's policy.

---

## 6. Performance — Core Web Vitals 2026 targets

| Metric | 2026 target | Current risk |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5 s | Hero text on `index.html` should be the LCP. Watch the model-viewer poster — could overtake hero. |
| **INP** (Interaction to Next Paint) | < 200 ms | Carousel rolodex JS runs on every scroll. Already throttled — should pass desktop. |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Reserve aspect ratios on `<img>` + `<model-viewer>`. Currently fine. |
| **TTFB** | < 800 ms | Cloudflare CDN handles this. |

**Fixes to apply before launch:**

1. **HDR shrink** — `studio-env.hdr` is 6.2 MB. Resize to 1K (~1.5 MB) via HDRView GUI or re-download a 1K variant from Poly Haven. Single biggest perf win.
2. **Image dimensions on `<img>`** — every `<img>` should have explicit `width` + `height` attributes (CLS prevention).
3. **Preload key assets:**
   ```html
   <link rel="preload" href="logo.png" as="image">
   ```
4. **Defer non-critical JS** — `script.js` is at end of `<body>`. `work-page.js` uses `defer`. Verified.
5. **Font display swap** — confirm fonts URL has `&display=swap` (it does). FOIT avoided.
6. **GLB lazy-load** — `<model-viewer loading="lazy">` already set. Verified.
7. **Lighthouse target:** ≥ 90 Performance, ≥ 95 SEO, ≥ 95 Best Practices, ≥ 95 Accessibility.

---

## 7. `robots.txt` and `sitemap.xml` templates

### `robots.txt` — drop at repo root

```
User-agent: *
Allow: /
Disallow: /archive/
Disallow: /assets/renders/

Sitemap: https://soviotech.com/sitemap.xml
```

Block `/assets/renders/` because the GLB + HDR files don't need to be in search results and waste crawl budget.

### `sitemap.xml` — drop at repo root

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://soviotech.com/</loc>
    <lastmod>2026-06-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://soviotech.com/work</loc>
    <lastmod>2026-06-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://soviotech.com/about</loc>
    <lastmod>2026-06-26</lastmod>
    <changefreq>quarterly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

Update `<lastmod>` whenever a page's content changes.

---

## 8. Internal linking strategy

Every page should push toward `/work` (highest-conversion).

| From | To | Anchor text |
|---|---|---|
| `index.html` hero CTA | `/work` | "See Our Work" *(already done)* |
| `index.html` mobile stub | `/work` | "Browse all work" *(already done)* |
| `about.html` CTA | `/work` (add) | "See projects we've shipped" *(add a paragraph + link)* |
| `work.html` end | `/about` | "Want to see how we work?" *(add post-grid CTA)* |
| Footer (all pages) | `/work`, `/about` | text links *(add)* |

Avoid generic "click here". Always describe the destination.

---

## 9. Content quality

Site is a portfolio, not a content site, so the bar is "be a credible answer to your buyer's queries." No blog yet.

**Highest-value future content:**
1. One case-study landing page per top 3-5 projects (so they rank for "AWR2944 reference design", "GaN PA 5 GHz tutorial", etc.). One URL per project, not a JS-rendered modal — Google indexes static HTML far better.
2. A single "Process" or "How we ship" page that targets "small embedded firmware consulting" and similar long-tail.
3. Keep copy human. AI boilerplate hurts more than it helps.

---

## 10. Off-page (outside repo, but launch-critical)

- **Google Search Console:** add `soviotech.com` property, verify via DNS TXT record, submit `sitemap.xml`.
- **Bing Webmaster Tools:** same.
- **GitHub org `SovIoTech`:** add `https://soviotech.com` to the org website URL. Free link equity.
- **Founder/team LinkedIn pages:** add Soviotech as current employer. Free brand-mention signals.

---

## 11. Implementation order (do these in order)

Each step is independently shippable.

1. **Drop `robots.txt` + `sitemap.xml`** at repo root (§7).
2. **Add canonical + Open Graph + Twitter card meta** to all 3 pages (§3).
3. **Add JSON-LD Organization + per-page schema** (§5).
4. **Generate 3 OG images** (1200×630): `og-home.png`, `og-work.png`, `og-about.png`. Place under `/og/`.
5. **Strip `.html` extension** in `_redirects` for cleaner URLs (§2).
6. **Shrink HDR** to 1K (§6).
7. **Add explicit `width`/`height` on every `<img>` tag** (§6).
8. **Confirm one `<h1>` per page** — fix any duplicates (§4).
9. **Add internal links per §8**.
10. **Run Lighthouse mobile + desktop** on the live URL. Fix anything below targets.
11. **Submit `sitemap.xml`** to Google Search Console + Bing.
12. **Validate JSON-LD** at https://search.google.com/test/rich-results.

---

## 12. Anti-patterns to avoid

| Don't | Why |
|---|---|
| Keyword-stuff the description with "RF embedded IoT cloud AI firmware engineer Pakistan global" | Google ranks for understanding, not density. Hurts trust. |
| Add `FAQPage` JSON-LD with invented Q&As | Schema must match visible content. Violates Google policy. |
| Use AI-generated boilerplate for portfolio cards | The current human copy IS the SEO advantage. |
| Add a fake blog of LLM-rewritten posts | Detected as spam. Hurts the whole domain. |
| Submit each archive page to sitemap | Wastes crawl budget on dev pages. |
| Track users with Google Analytics | Adds 3rd-party requests + breaks the privacy story already in CSP. |

---

## 13. Sources

- **Google Search Central** — https://developers.google.com/search/docs
- **web.dev — Core Web Vitals** — https://web.dev/articles/vitals
- **Schema.org** — https://schema.org
- **MDN — `<link rel>`, preload, canonical** — https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
- **OpenGraph spec** — https://ogp.me
- **Google Rich Results Test** — https://search.google.com/test/rich-results
- **PageSpeed Insights** — https://pagespeed.web.dev

---

**Next action:** ship steps 1-3 of §11 right now. They're zero-risk additions to existing pages and immediately improve search appearance.
