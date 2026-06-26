# Security Audit — Soviotech Static Marketing Site

**Audit date:** 2026-06-25  
**Auditor:** Claude Code (Security Reviewer)  
**Scope:** All HTML, JS, CSS, and Netlify config files in the repository root  
**Stack:** Pure static HTML/CSS/JS, deployed on Netlify  
**Methodology:** Read-only — no files were modified

---

## Findings by Severity

---

### HIGH

---

#### H-1 — No Content Security Policy (CSP) on any page

**File:** `_headers` (missing directive, should be added)

**Evidence:** The `_headers` file applies three security headers globally but no CSP:

```
/*
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
```

**Attack scenario:** Without a CSP, if any future inline script or injected third-party resource introduces an XSS vector (e.g., a compromised CDN dependency), the browser has no policy to block execution. Additionally, the browser will freely make requests to any origin — including attacker-controlled origins — if a script-injection path ever materialises. This also removes the `connect-src` control that would otherwise limit where fetch/XHR requests can go.

**Recommended fix:** Add a strict, allow-listed CSP to `_headers`:

```
/*
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Content-Security-Policy: default-src 'none'; script-src 'self' https://unpkg.com https://ajax.googleapis.com; script-src-elem 'self' https://unpkg.com https://ajax.googleapis.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://cdn.jsdelivr.net https://www.gstatic.com https://modelviewer.dev; frame-src https://cdn.jsdelivr.net; worker-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'

/explode-viewer.html
  Content-Security-Policy: default-src 'none'; script-src 'self' https://unpkg.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://unpkg.com https://www.gstatic.com; worker-src blob:; object-src 'none'; base-uri 'self'; form-action 'none'
```

Note: `unsafe-inline` for style-src is required across all pages due to existing inline `<style>` blocks in `explode-viewer.html` and `glb-test.html`. Inline `<script>` blocks in `work.html` require a nonce or hash if you want to drop `unsafe-inline` for scripts; the long-term fix is to move those scripts to `script.js`.

---

#### H-2 — Missing `noreferrer` on all `target="_blank"` links

**Files and lines:**
- `index.html:206` — `<a href="https://github.com/SovIoTech/Vendbnb" target="_blank" rel="noopener"`
- `index.html:265` — `<a href="https://github.com/SovIoTech/Vaulta-Dashboard" target="_blank" rel="noopener"`
- `index.html:370` — `<a href="explode-viewer.html" target="_blank" rel="noopener"`
- `work.html:96` — `<a ... target="_blank" rel="noopener">`
- `work.html:167` — template literal: `target="_blank" rel="noopener"`
- `work.html:175` — template literal: `target="_blank" rel="noopener"`

**Evidence (representative):**
```html
<a href="https://github.com/SovIoTech/Vendbnb" target="_blank" rel="noopener" class="project__repo-link">
```

**Attack scenario:** `rel="noopener"` prevents the opened tab from accessing `window.opener` (tab-napping). However, the missing `noreferrer` means the full page URL (including any future query-string parameters such as UTM tracking tokens or session identifiers) is sent in the `Referer` header to the destination (GitHub/jsDelivr). This is a privacy/information-disclosure issue. GitHub is low-risk here, but the pattern should be consistent.

**Recommended fix:** Add `noreferrer` to every `rel` that already contains `noopener`. In the `cardHTML` template literal in `work.html`:

```js
// Before
rel="noopener"
// After
rel="noopener noreferrer"
```

Apply to all six instances listed above.

---

#### H-3 — No `sandbox` attribute on PDF iframe in `work.html`

**File:** `work.html:101`

**Evidence:**
```html
<iframe id="pdfModalFrame" title="Case study PDF" loading="lazy"></iframe>
```

The `src` is later set dynamically to a jsDelivr CDN URL serving a PDF. The iframe has no `sandbox` attribute and no `referrerpolicy` attribute.

**Attack scenario:** Without `sandbox`, a PDF served via jsDelivr could (in browsers that execute JavaScript inside PDF viewers embedded in iframes) run scripts with the same origin permissions as the hosting iframe. More practically, an unsandboxed iframe from a CDN retains the ability to navigate the top-level frame (`top.location`), submit forms, and open popups. If jsDelivr were ever compromised or the PDF path mis-targeted, the iframe content gains unnecessary browser privileges against the parent page.

**Recommended fix:**

```html
<iframe
  id="pdfModalFrame"
  title="Case study PDF"
  loading="lazy"
  sandbox="allow-scripts allow-same-origin"
  referrerpolicy="no-referrer">
</iframe>
```

`allow-scripts` is required for PDF rendering; `allow-same-origin` is needed by the browser's PDF plugin. Do not add `allow-top-navigation` or `allow-forms`. Adding `referrerpolicy="no-referrer"` prevents jsDelivr from seeing the referring page URL.

---

#### H-4 — No `sandbox` attribute on the explode-viewer iframe in `index.html`

**File:** `index.html:377`

**Evidence:**
```html
<iframe src="explode-viewer.html" title="VIO assembly exploded view" loading="lazy"></iframe>
```

`explode-viewer.html` loads Three.js modules from `unpkg.com` and DRACO decoders from `gstatic.com`. The iframe has no `sandbox`, no `referrerpolicy`, and no `allow` policy.

**Attack scenario:** The embedded page runs ES modules fetched from unpkg.com without SRI verification (see H-5). If unpkg were to serve a malicious build of `three@0.160.0`, the compromised script would execute inside the iframe with access to the parent frame's `window.opener` chain. An unsandboxed same-origin iframe can also call `parent.postMessage` and access any DOM elements exposed via `parent.*`.

**Recommended fix:**

```html
<iframe
  src="explode-viewer.html"
  title="VIO assembly exploded view"
  loading="lazy"
  sandbox="allow-scripts allow-same-origin"
  referrerpolicy="no-referrer">
</iframe>
```

Note: WebGL requires `allow-scripts`. `allow-same-origin` is needed because `explode-viewer.html` is served from the same origin and needs access to local GLTF files. Omit `allow-top-navigation`, `allow-forms`, and `allow-popups`.

---

#### H-5 — No Subresource Integrity (SRI) on any CDN resource

**Files and lines:**

| File | Line | Resource |
|------|------|----------|
| `explode-viewer.html` | 9 | `fonts.googleapis.com` CSS |
| `explode-viewer.html` | 131–132 | `unpkg.com/three@0.160.0` (importmap) |
| `explode-viewer.html` | 222 | `gstatic.com` DRACO decoders (runtime fetch) |
| `glb-test.html` | 9 | `fonts.googleapis.com` CSS |
| `glb-test.html` | 10 | `ajax.googleapis.com/model-viewer/3.5.0/model-viewer.min.js` |
| `glb-test.html` | 171, 196, 214, 215 | `modelviewer.dev` HDR environment files |
| `index.html` | 15 | `fonts.googleapis.com` CSS |
| `work.html` | 13 | `fonts.googleapis.com` CSS |
| `about.html` | 13 | `fonts.googleapis.com` CSS |

**Evidence (highest-risk):**
```html
<!-- explode-viewer.html:131-132 -->
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
  }
}
</script>
```

```html
<!-- glb-test.html:10 -->
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
```

**Attack scenario:** If unpkg.com, the Google Ajax CDN, or any fonts CDN is compromised (supply-chain attack), they could serve a malicious version of Three.js or model-viewer. Without SRI, the browser cannot detect the substitution and will execute the attacker's code with full page permissions. This is the highest-impact third-party risk in this codebase.

**Recommended fix:** SRI hashes cannot be added to `<script type="importmap">` entries in the current browser spec (importmaps do not support integrity checking natively). The correct fix is to **self-host** these libraries:

```bash
# Download and vendor the exact versions
npm pack three@0.160.0
# Copy build/three.module.js and examples/jsm/ into /vendor/three/
```

Then update `explode-viewer.html`:
```html
<script type="importmap">
{
  "imports": {
    "three": "/vendor/three/build/three.module.js",
    "three/addons/": "/vendor/three/examples/jsm/"
  }
}
</script>
```

For `model-viewer` in `glb-test.html`, self-host and add SRI:
```html
<script
  type="module"
  src="/vendor/model-viewer.min.js"
  integrity="sha384-<computed-hash>"
  crossorigin="anonymous">
</script>
```

For Google Fonts (lower risk — CSS only, no JS execution), add `crossorigin="anonymous"` to the `<link>` tags to enable CORS caching. SRI for Google Fonts CSS is impractical because the response body varies by browser UA, but self-hosting the font files eliminates the dependency entirely.

The DRACO decoder path (`gstatic.com`) is set via JavaScript and cannot use SRI directly; self-host the decoder:
```js
// explode-viewer.html:222 — change to:
draco.setDecoderPath('/vendor/draco/1.5.7/');
```

---

### MEDIUM

---

#### M-1 — `X-Frame-Options: DENY` blocks legitimate self-embedding of `explode-viewer.html`

**File:** `_headers:4`

**Evidence:**
```
/*
  X-Frame-Options: DENY
```

`index.html:377` embeds `explode-viewer.html` in an iframe. However, the global `/*` rule sets `X-Frame-Options: DENY` for all paths, which means `explode-viewer.html` cannot be loaded in an iframe — including by the site's own `index.html`. The iframe silently fails or shows an error in the browser.

**Attack scenario:** The DENY rule is correct for public pages (prevents clickjacking) but breaks the deliberate self-embedding. More importantly, this demonstrates that the CSP `frame-ancestors` directive is absent — without it, the `X-Frame-Options` header is the only clickjacking protection, and it is misconfigured for self-embedding scenarios.

**Recommended fix:** Replace `X-Frame-Options` with `frame-ancestors` in CSP, and scope it correctly:

```
# _headers

/*
  Content-Security-Policy: frame-ancestors 'none'; ...

/explode-viewer.html
  Content-Security-Policy: frame-ancestors 'self'; ...
  # Remove X-Frame-Options for this path since frame-ancestors takes precedence in modern browsers
```

For older browsers that do not support `frame-ancestors`, add path-scoped `X-Frame-Options`:
```
/explode-viewer.html
  X-Frame-Options: SAMEORIGIN
```

---

#### M-2 — `Referrer-Policy` applied globally but not adequate for CDN privacy

**File:** `_headers:5`

**Evidence:**
```
  Referrer-Policy: strict-origin-when-cross-origin
```

`strict-origin-when-cross-origin` sends the full URL (path + query) on same-origin requests and only the origin on cross-origin HTTPS requests. This is the browser default since Chrome 85 and is reasonable. However, `work.html` constructs jsDelivr PDF URLs that embed the GitHub org name and repo name. When the iframe loads the PDF, the jsDelivr server receives the referring origin (`https://soviotech.com` or similar) which is expected. The concern is that future query parameters on the site URL could leak via the `strict-origin` portion.

**Attack scenario:** Low risk at present, but analytics or A/B testing parameters added to the URL in future deployments would be sent as `Referer: origin` to Google Fonts, jsDelivr, and gstatic CDNs. These services log requests with referring origin, enabling cross-site user fingerprinting.

**Recommended fix:** Tighten the policy, particularly for pages loading third-party resources:

```
/*
  Referrer-Policy: no-referrer
```

If the team relies on referrer analytics, `strict-origin` is acceptable — but add `referrerpolicy="no-referrer"` to all `<link>` preconnect tags and iframes to limit per-element leakage.

---

#### M-3 — Missing `Permissions-Policy` header

**File:** `_headers` (missing directive)

**Evidence:** The `_headers` file has no `Permissions-Policy`. The `glb-test.html` page uses the `<model-viewer>` custom element, which uses the camera API internally on some configurations. No other pages use camera, microphone, geolocation, or payment APIs.

**Attack scenario:** Any compromised third-party script (CDN supply-chain compromise) could attempt to access device APIs — camera, microphone, geolocation — without a Permissions-Policy header explicitly denying them.

**Recommended fix:**

```
/*
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=()
```

---

#### M-4 — `work.html` inline `<script>` block is large and unextracted; creates future maintenance risk for CSP nonces

**File:** `work.html:118–308`

**Evidence:** The entire PROJECTS array, card rendering logic, pagination, filter, and PDF modal logic lives in an inline `<script>` block (191 lines). This is the block that constructs HTML via template literals and sets `innerHTML`.

```html
<!-- work.html:118 -->
<script>
  const PROJECTS = [ ... ];
  ...
  document.getElementById('workGrid').innerHTML = PROJECTS.map(cardHTML).join('');
  ...
</script>
```

**Attack scenario:** The code itself is safe (data is hardcoded; see XSS analysis below). However, an inline script block requires either `unsafe-inline` in the CSP `script-src` directive, or a per-request nonce. Netlify does not support nonce injection for static HTML, so `unsafe-inline` is currently required for scripts — which defeats much of the protection a CSP offers.

**Recommended fix:** Move the inline script block to `work-page.js` (a new file), referenced as `<script src="work-page.js"></script>`. This allows the CSP to use `script-src 'self'` without `unsafe-inline`.

---

#### M-5 — Error message exposed in UI from failed GLTF load

**File:** `explode-viewer.html:360`

**Evidence:**
```js
init().catch(err => {
  loadingEl.textContent = 'load failed: ' + err.message;
  console.error(err);
});
```

**Attack scenario:** If the GLTF/DRACO load fails due to a network error, server error response, or CORS rejection, the raw JavaScript `Error.message` is written directly into the visible DOM via `textContent`. This is low-risk here because the error originates from the browser's own fetch/network stack (not user input), but it sets a bad precedent. If the error-source ever changes to include a user-supplied URL or response body, the same pattern would become an XSS vector.

**Recommended fix:**

```js
init().catch(err => {
  loadingEl.textContent = 'Failed to load model. Please refresh the page.';
  console.error('[explode-viewer] load failed:', err);
});
```

---

#### M-6 — PDF modal iframe has no focus trap; hidden modal is keyboard-reachable when `aria-hidden="true"`

**File:** `work.html:87–104`, `style.css:1345–1360`

**Evidence:** The modal uses CSS `opacity: 0; pointer-events: none` when `aria-hidden="true"`, but does not use `display: none` or `visibility: hidden`. The iframe and all its focusable children remain in the natural tab order even when the modal is visually hidden.

```css
/* style.css:1345-1360 */
.pdf-modal {
  opacity: 0;
  pointer-events: none;
  ...
}
.pdf-modal[aria-hidden="false"] {
  opacity: 1;
  pointer-events: auto;
}
```

```html
<!-- work.html:87 -->
<div class="pdf-modal" id="pdfModal" aria-hidden="true" role="dialog" aria-modal="true">
```

**Attack scenario:** Keyboard users tabbing through the page can reach the modal's "Repo" link, close button, and the PDF iframe while the modal is closed (invisible). This is an accessibility violation (WCAG 2.1 SC 4.1.3) and, in the security context, means a screen reader or assistive technology user can activate the iframe's load before the modal has been intentionally opened.

**Recommended fix:** Add `display: none` when hidden, and implement a focus trap when open:

```css
.pdf-modal[aria-hidden="true"] { display: none; }
.pdf-modal[aria-hidden="false"] { display: flex; opacity: 1; pointer-events: auto; }
```

And in the `openPdf` function, move focus to the close button after a short delay:
```js
function openPdf(repo, name) {
  ...
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.querySelector('.pdf-modal__close').focus(), 50);
}
```

---

### LOW

---

#### L-1 — `glb-test.html` and `logo-redesign.html` are internal/dev pages publicly accessible

**Files:** `glb-test.html`, `logo-redesign.html`

**Evidence:** `glb-test.html` is a development viewer for GLB/GLTF files. `logo-redesign.html` is a logo design comparison page with inline SVG markup. Neither is linked from any production page (no nav link) but both are publicly reachable at their URLs. `logo-redesign.html` contains no sensitive data. `glb-test.html` loads `model-viewer` from `ajax.googleapis.com` without SRI and fetches HDR environments from `modelviewer.dev`.

**Attack scenario:** These pages are not secret (Netlify serves all files), but they expand the CDN attack surface unnecessarily. A visitor can load the model-viewer JavaScript payload without any CSP restriction. There is no actual exploit here, but the pages are dead weight from a security-surface perspective.

**Recommended fix:** Either add a `_redirects` or `_headers` rule to deny access:

```
# _headers
/glb-test.html
  X-Robots-Tag: noindex, nofollow

/logo-redesign.html
  X-Robots-Tag: noindex, nofollow
```

Or, preferably, move them outside the publish directory before deploying to production. To block access entirely on Netlify:

```
# _redirects
/glb-test.html   /404   404
/logo-redesign.html   /404   404
```

---

#### L-2 — `window.open` in `work.html` uses `repo` from `card.dataset.repo`

**File:** `work.html:279–283`

**Evidence:**
```js
function openPdf(repo, name) {
  if (isMobileViewer) {
    window.open(pdfUrl(repo), '_blank', 'noopener');
    return;
  }
  ...
}
```

`repo` is retrieved from `card.dataset.repo` at `work.html:300`:
```js
const card = openBtn.closest('.work-card');
openPdf(card.dataset.repo, card.dataset.name);
```

The `data-repo` attribute on each card is written from `p.repo` (the PROJECTS array) during `cardHTML()`:
```js
<article class="work-card" data-cat="${p.cat}" data-repo="${p.repo}" data-name="${p.name}">
```

**Attack scenario:** The `data-repo` value originates exclusively from the hardcoded `PROJECTS` array (no user input path). The constructed URL is `https://cdn.jsdelivr.net/gh/SovIoTech/<repo>@main/CASE_STUDY.pdf`. However, because `data-repo` is written as an HTML attribute and later read back, a DOM-clobbering attack could theoretically overwrite `card.dataset.repo` if a user could inject an element with the same `id` or `name` as `card`. Since `workGrid` is populated entirely from a hardcoded array with no user input, no such injection path exists. **This is confirmed safe.**

Documented here for completeness: there is no open-redirect risk in the current implementation. The `pdfUrl()` function prepends the fixed `cdn.jsdelivr.net` base; `repo` only parameterises the path segment.

---

#### L-3 — `#toolbar=0` PDF parameter provides no download security

**File:** `work.html:156`

**Evidence:**
```js
const PDF_VIEW_PARAMS = '#toolbar=0&navpanes=0&statusbar=0&view=FitH';
const pdfUrl = repo => `https://cdn.jsdelivr.net/gh/SovIoTech/${repo}@main/${PDF_FILE}${PDF_VIEW_PARAMS}`;
```

**Attack scenario:** The comment in the code acknowledges this: "hides Chrome's PDF UI (no download)." The hash fragment `#toolbar=0` suppresses the browser's PDF toolbar in some browsers but does not prevent downloading. Any user can access the raw PDF URL by removing the fragment, using `curl`, or using browser DevTools to find the iframe `src`. The PDFs are hosted publicly on jsDelivr/GitHub and are freely downloadable.

**Recommended fix:** No code change is needed — this is a UX hint, not a security control, and the code acknowledges it. Document internally that case study PDFs should be treated as public documents. If PDFs must be access-controlled, they cannot be hosted on a public CDN; a backend with authentication would be required.

---

#### L-4 — `localStorage` theme value used in `setAttribute` without sanitization

**File:** `script.js:4–7`

**Evidence:**
```js
const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initial = stored || (prefersDark ? 'dark' : 'light');
root.setAttribute('data-theme', initial);
```

**Attack scenario:** If an attacker can write to `localStorage` (e.g., via a same-origin XSS on any page, or via developer tools), they could set `theme` to an arbitrary string. The value is then passed to `root.setAttribute('data-theme', ...)` where `root` is `document.documentElement`. Attribute injection via `setAttribute` on `<html>` is generally harmless — it cannot inject new elements or event handlers. CSS selectors like `:root[data-theme="dark"]` would simply not match an unexpected value, degrading gracefully. **This is confirmed low-risk.**

However, the pattern is worth hardening:

**Recommended fix:**
```js
const stored = localStorage.getItem('theme');
const allowed = ['dark', 'light'];
const initial = allowed.includes(stored) ? stored : (prefersDark ? 'dark' : 'light');
root.setAttribute('data-theme', initial);
```

---

#### L-5 — `glb-test.html` user-controlled `data-env` written via `setAttribute`

**File:** `glb-test.html:246–250`

**Evidence:**
```js
document.querySelectorAll('#envBtns .pill').forEach(b => {
  b.addEventListener('click', () => {
    ...
    mvs.forEach(m => m.setAttribute('environment-image', b.dataset.env));
    envLabel.textContent = b.dataset.label;
  });
});
```

The `data-env` values are hardcoded in the HTML at lines 214–216:
```html
<button class="pill active" data-env="https://modelviewer.dev/shared-assets/environments/aircraft_workshop_01_1k.hdr" ...>
<button class="pill" data-env="https://modelviewer.dev/shared-assets/environments/whipple_creek_regional_park_04_1k.hdr" ...>
<button class="pill" data-env="neutral" ...>
```

**Attack scenario:** Values are hardcoded, so no user-controlled input reaches `setAttribute`. `envLabel.textContent = b.dataset.label` correctly uses `textContent` (not `innerHTML`), so no XSS risk. If the buttons were ever dynamically populated from an external source, the `setAttribute('environment-image', ...)` pattern would need URL allow-listing. **Confirmed safe in current form.**

---

### INFO

---

#### I-1 — Third-party privacy leakage matrix

Every page load on the site triggers requests to the following external services, leaking the visitor's IP address and referring origin:

| Service | Pages | Data sent | Purpose |
|---------|-------|-----------|---------|
| `fonts.googleapis.com` | All | IP, UA, Referer origin | Font CSS |
| `fonts.gstatic.com` | All | IP, UA | Actual font files |
| `unpkg.com` | `explode-viewer.html` | IP, UA, Referer origin | Three.js modules |
| `www.gstatic.com` (DRACO) | `explode-viewer.html` | IP, UA | WASM decoder |
| `ajax.googleapis.com` | `glb-test.html` | IP, UA, Referer origin | model-viewer JS |
| `modelviewer.dev` | `glb-test.html` | IP, UA, Referer origin | HDR environment files |
| `cdn.jsdelivr.net` | `work.html` | IP, UA, Referer origin | PDF files (iframe src) |

Google Fonts, gstatic, and googleapis are all Google properties — they can correlate cross-site visits. jsDelivr logs are publicly documented as retained for CDN analytics. None of this is unusual for a marketing site, but it is worth disclosing to users in a privacy notice if the team adds one.

**Recommended mitigation:** Self-hosting fonts and Three.js (already recommended in H-5) eliminates the most impactful third-party requests. At minimum, add `crossorigin="anonymous"` to all `<link rel="preconnect">` tags to take advantage of CORS caching.

---

#### I-2 — `info@soviotech.com` is intentionally public; no accidental credential exposure found

**Files:** `index.html:399`, `work.html:79`, `about.html:106`

The email address `info@soviotech.com` appears on three pages as a `mailto:` link. This is a deliberate contact address, not accidental leakage. No API keys, access tokens, AWS credentials, or private endpoints were found anywhere in the codebase. The `.git/` directory contains no sensitive config beyond the remote URL (`github.com/SovIoTech/...`).

---

#### I-3 — `localStorage` usage confirmed limited to theme key only

**File:** `script.js:4,13`

Only `localStorage.getItem('theme')` and `localStorage.setItem('theme', next)` are used. No session identifiers, user data, or sensitive values are stored. No cookies are set anywhere in the codebase. This is the expected behaviour.

---

#### I-4 — `tokenizeHTML` / `typeTerminal` XSS analysis — confirmed safe

**File:** `script.js:109–179`

`tokenizeHTML(html)` is called on `code.innerHTML` at line 139. The `code` elements are `<code>` blocks inside `<pre>` elements that are hardcoded in `index.html`. The HTML being tokenized and re-inserted is the pre-author-written terminal animation content — it is not user-supplied. The function does not sanitize but also never processes attacker-controlled input. **No XSS risk.**

---

#### I-5 — `work.html` `cardHTML` template literal XSS analysis — confirmed safe

**File:** `work.html:160–179`

```js
function cardHTML(p) {
  const catLabel = ({ rf: 'RF / Radar', embedded: 'Embedded', iot: 'IoT & Cloud', edge: 'Edge AI' })[p.cat] || '';
  const tagsHTML = p.tags.map(t => `<span>${t}</span>`).join('');
  return `
    <article class="work-card" data-cat="${p.cat}" data-repo="${p.repo}" data-name="${p.name}">
      ...
      <h3 class="work-card__title">${p.name}</h3>
      <p class="work-card__tagline">${p.tagline}</p>
      <div class="work-card__tags">${tagsHTML}</div>
      ...
    </article>`;
}
document.getElementById('workGrid').innerHTML = PROJECTS.map(cardHTML).join('');
```

All values (`p.name`, `p.tagline`, `p.tags`, `p.cat`, `p.repo`) come exclusively from the hardcoded `PROJECTS` constant defined in the same `<script>` block (lines 121–150). There is no query-string parsing, URL hash reading, `fetch()` call, or other external input that feeds into `PROJECTS`. The string values contain only ASCII alphanumeric text and safe punctuation. **No XSS risk in current implementation.** If `PROJECTS` is ever moved to a backend API, all values must be HTML-escaped before interpolation.

---

#### I-6 — `mailto:` links are intentional and carry no security risk

**Files:** `index.html:399`, `work.html:79`, `about.html:106`

`mailto:info@soviotech.com` links open the user's local email client. No form submission, no server request, no data collection. Correct and safe.

---

#### I-7 — `_redirects` file is effectively empty

**File:** `_redirects:1`

The file contains only a comment: `# Redirect www to apex (configure your DNS accordingly)`. No actual redirect rules are defined. If the `www.` subdomain is in use, consider adding:

```
https://www.soviotech.com/*  https://soviotech.com/:splat  301!
```

---

## Executive Summary

The Soviotech static marketing site is a low-attack-surface HTML/CSS/JS codebase with no backend, no forms, no authentication, and no user-controlled data processed server-side. The most significant security gaps are infrastructure-level rather than code-level: there is **no Content Security Policy**, all six external CDN resources lack **Subresource Integrity** verification, and all `target="_blank"` links are missing `noreferrer`. The two iframes (the PDF modal and the explode-viewer embed) lack `sandbox` attributes, giving third-party content unnecessary browser privileges. The `X-Frame-Options: DENY` global rule also silently breaks the intended self-embedding of `explode-viewer.html` in `index.html`. No secrets, API keys, or credentials were found anywhere in the repository. The XSS surface has been verified: both the `cardHTML` template literal and the `tokenizeHTML`/`typeTerminal` typewriter animation operate exclusively on hardcoded author-written content and present no injection risk in their current form.

---

## Top-5 Prioritized Fix List

1. **Add a Content Security Policy** (`_headers`) — A strict CSP with explicit allow-lists for `unpkg.com`, `fonts.googleapis.com`, `gstatic.com`, `cdn.jsdelivr.net`, and `ajax.googleapis.com` is the single highest-leverage security control missing from this site. It is a one-line addition to `_headers`. Also add `Permissions-Policy`. (Finding H-1)

2. **Self-host Three.js and vendor model-viewer; add SRI to all remaining CDN resources** — The `unpkg.com` Three.js importmap and the `ajax.googleapis.com` model-viewer script are the highest-risk third-party dependencies. A CDN supply-chain compromise would deliver malicious JavaScript to every site visitor. Vendoring eliminates this risk and enables strict `script-src 'self'` in the CSP. (Finding H-5)

3. **Add `sandbox` attributes to both iframes** — The PDF modal iframe (`work.html:101`) and the explode-viewer iframe (`index.html:377`) should both have `sandbox="allow-scripts allow-same-origin"` and `referrerpolicy="no-referrer"`. Also fix the `X-Frame-Options: DENY` conflict by scoping it correctly so the explode-viewer iframe actually loads. (Findings H-3, H-4, M-1)

4. **Add `noreferrer` to every `target="_blank"` link** — Six links across `index.html` and `work.html` have `rel="noopener"` but not `noreferrer`. This is a two-word fix per link, preventing the destination site from seeing the referring page URL. (Finding H-2)

5. **Move the large inline `<script>` block in `work.html` to an external file** — This removes the requirement for `unsafe-inline` in `script-src`, which is the only thing preventing a fully locked-down CSP on the work page. It also removes `data-repo` and `data-name` attributes from the rendered HTML as a data-source for the PDF modal — those values can be kept exclusively in the JS constant instead. (Finding M-4)
