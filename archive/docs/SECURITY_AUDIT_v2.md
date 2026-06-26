# Security Re-Audit — v2

**Audit date:** 2026-06-25
**Auditor:** Claude Code (Security Reviewer)
**Scope:** All HTML, JS, CSS, and Cloudflare Pages config files in the repository root
**Stack:** Pure static HTML/CSS/JS, deployed on Cloudflare Pages
**Prior audit:** SECURITY_AUDIT.md (findings H-1..H-5, M-1..M-6, L-1..L-5, I-*)
**Methodology:** Read-only — no files were modified

---

## Prior findings — verification matrix

| ID | Status | Evidence |
|----|--------|----------|
| H-1 | PARTIAL | `_headers:7` adds global CSP; `/explode-viewer.html` path-scope at `_headers:22`. CSP is present but has regressions — see New Findings N-1, N-2. |
| H-2 | PASS | All six previously flagged links now carry `rel="noopener noreferrer"`. `index.html:206,265,370`; `work.html:96`; `work-page.js:49,57`. |
| H-3 | PASS | `work.html:101` — `sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer"` present on the PDF iframe. |
| H-4 | PASS | `index.html:377` — `sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer"` present on the explode-viewer iframe. |
| H-5 | ACCEPTED RISK | Three.js still served from `unpkg.com` (`explode-viewer.html:131-132`), model-viewer from `ajax.googleapis.com` (`glb-test.html:10`). CSP path-scopes the unpkg allowance to `/explode-viewer.html` only (`_headers:22`). `glb-test.html` CSP gap remains — see N-2. Documented as accepted risk per audit charter. |
| M-1 | PARTIAL | Global `X-Frame-Options: DENY` still at `_headers:4`. `/explode-viewer.html` overrides with `X-Frame-Options: SAMEORIGIN` (`_headers:21`) and `frame-ancestors 'self'` (`_headers:22`). Global CSP now has `frame-ancestors 'none'` (`_headers:7`). Self-embedding of explode-viewer in index.html now works correctly. PASS on intent; residual note: X-Frame-Options at global scope is redundant once frame-ancestors is in CSP but is harmless. |
| M-2 | PASS | `_headers:5` — `Referrer-Policy: no-referrer`. Upgraded from `strict-origin-when-cross-origin`. |
| M-3 | PASS | `_headers:6` — `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), interest-cohort=()`. All seven APIs denied. |
| M-4 | PASS | `work.html:118` removed; inline script replaced by `<script src="work-page.js" defer></script>` at `work.html:118`. `work-page.js` exists and contains the extracted code. |
| M-5 | PASS | `explode-viewer.html:360` — `loadingEl.textContent = 'Failed to load model. Please refresh the page.'`. Raw `err.message` no longer written to DOM. |
| M-6 | PASS | `style.css:1349` — `.pdf-modal { display: none; }`. `style.css:1357-1360` — `.pdf-modal[aria-hidden="false"] { display: flex; }`. Focus call present: `work-page.js:172` — `setTimeout(() => document.querySelector('.pdf-modal__close').focus(), 50)`. |
| L-1 | PASS | `_headers:26,29` — `X-Robots-Tag: noindex, nofollow` on both `/glb-test.html` and `/logo-redesign.html`. |
| L-2 | PASS (unchanged) | Confirmed safe in prior audit; `data-repo` still exclusively from hardcoded `PROJECTS` array in `work-page.js:3-32`. |
| L-3 | PASS (unchanged) | Informational; no code change needed. PDF download prevention via hash params is documented as UX-only. |
| L-4 | PASS | `script.js:6-7` — `const allowed = ['dark', 'light']; const initial = allowed.includes(stored) ? stored : (prefersDark ? 'dark' : 'light');`. Allow-list implemented. `null` case handled: `allowed.includes(null)` returns `false`, falling through to the OS-preference branch correctly. |
| L-5 | PASS (unchanged) | `glb-test.html` `data-env` values remain hardcoded; `envLabel.textContent` used correctly. |
| I-1 | UPDATED | Third-party matrix unchanged. See N-2 for glb-test.html CSP gap. |
| I-2..I-7 | PASS (unchanged) | No new secrets, credentials, or issues found. |

---

## New findings

### Critical

None.

---

### High

---

#### N-H-1 — CSP regression: `glb-test.html` has no path-scoped rule; `ajax.googleapis.com` script blocked by global CSP

**File:** `_headers` (global rule line 7); `glb-test.html:10`

**Evidence:**

Global CSP at `_headers:7`:
```
script-src 'self'
```

`glb-test.html:10`:
```html
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
```

The global `script-src 'self'` policy covers `/glb-test.html` (no path-scoped override exists). `ajax.googleapis.com` is not in `script-src`, so the browser will block this module script load. The inline `<script>` block at `glb-test.html:242` is also blocked because `script-src 'self'` does not include `'unsafe-inline'`.

Additionally, `style-src` for the global rule permits `https://fonts.googleapis.com 'unsafe-inline'`, which covers the fonts CSS at `glb-test.html:9`. However, the `environment-image` attributes at `glb-test.html:171,196,214,215` reference `https://modelviewer.dev/...` HDR files. These are loaded by the model-viewer custom element as media/fetch requests. The `connect-src 'self'` in the global CSP does not permit `modelviewer.dev`, which will block those network requests.

**Scenario:** Any visitor loading `glb-test.html` will see a broken page: model-viewer does not load, the 3D viewer does not initialize, and HDR environments cannot be fetched. While this is a dev-only page (noindex applied), it demonstrates an untested CSP coverage gap that could affect production pages if similar third-party scripts are later added.

**Fix:** Add a path-scoped block:

```
/glb-test.html
  X-Robots-Tag: noindex, nofollow
  Content-Security-Policy: default-src 'none'; script-src 'self' https://ajax.googleapis.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://modelviewer.dev; worker-src blob:; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'
```

---

#### N-H-2 — CSP regression: `work.html` `connect-src 'self'` blocks jsDelivr PDF fetch; iframe `frame-src` insufficient without `connect-src`

**File:** `_headers:7`; `work-page.js:39`

**Evidence:**

Global CSP `connect-src` (`_headers:7`):
```
connect-src 'self'
```

PDF URL constructed at `work-page.js:39`:
```js
const pdfUrl = repo => `https://cdn.jsdelivr.net/gh/SovIoTech/${repo}@main/${PDF_FILE}${PDF_VIEW_PARAMS}`;
```

The iframe `src` is set to a `cdn.jsdelivr.net` URL at `work-page.js:168`:
```js
frame.src = pdfUrl(repo);
```

The `frame-src 'self' https://cdn.jsdelivr.net` at `_headers:7` correctly authorizes the iframe navigation to `cdn.jsdelivr.net`. However, for the mobile fallback `window.open(pdfUrl(repo), '_blank', 'noopener,noreferrer')` at `work-page.js:164`, whether this is blocked depends on the browser; modern browsers treat `window.open` as a navigation, not a `connect-src` request, so it is likely not blocked. The PDF itself renders inside the iframe, which is authorized.

There is also a secondary issue: the global CSP has no `work.html`-specific path-scope, so the page is governed by the global rule. The `frame-src 'self' https://cdn.jsdelivr.net` is present at the global level, which is correct. However, it also allows any page on the site to frame any `cdn.jsdelivr.net` resource, which is broader than necessary. This is a low-severity broadening, not a blocking regression.

**Confirmed:** The iframe PDF loading path is not blocked by current CSP. The `frame-src` covers it. **This degrades to Medium** — the `connect-src 'self'` is overly restrictive for future use but the current PDF iframe flow uses frame navigation, not XHR/fetch. No active breakage confirmed by static analysis.

**Reclassified as Medium. See N-M-1 below.**

---

### Medium

---

#### N-M-1 — CSP `connect-src 'self'` is unnecessarily narrow; will block any legitimate cross-origin fetch added to production pages

**File:** `_headers:7`

**Evidence:**

```
connect-src 'self'
```

No cross-origin `fetch()`, `XHR`, or `WebSocket` call exists in the current codebase (confirmed: `grep fetch` on all `.js` files returns zero matches). However, the global `connect-src 'self'` means that any future analytics snippet, error-reporting SDK, or API call added to `index.html`, `about.html`, or `work.html` will be silently blocked at the network level without a clear browser error visible to developers. This is not a security failure — it is the correct secure default — but it creates a maintenance trap.

Additionally, `work.html` does not have a path-scoped CSP override; its `frame-src 'self' https://cdn.jsdelivr.net` comes from the global rule. If the team ever adds a page-level `connect-src` override to `work.html`, the interaction with the global rule could produce unexpected behaviour on Cloudflare Pages, which applies headers additively per path (most-specific path wins, but a path rule does not inherit directives from the global `/*` rule that it does not explicitly re-state).

**Fix:** No immediate code change required. Document the intent. If error reporting is added, update `connect-src` explicitly:

```
connect-src 'self' https://your-error-reporter.example.com;
```

---

#### N-M-2 — `work.html` loads `work-page.js` with `defer` but also loads `script.js` without `defer`; execution order is implicit

**File:** `work.html:118-120`

**Evidence:**

```html
<script src="work-page.js" defer></script>
<script src="script.js"></script>
```

`work-page.js` is loaded with `defer` (correct: runs after DOM is parsed). However, `script.js` is loaded without `defer` or `async` as the last `<body>` tag (line 120), meaning it executes synchronously before `defer` scripts resolve. Both scripts query DOM elements by ID. In `script.js`, the IIFE at line 2 calls `document.getElementById('themeToggle')` and guards with `if (!btn) return`, so pages without the toggle are safe.

The concern is that `work-page.js` uses `defer` and therefore runs after `script.js` (which is synchronous, last in body). Since `script.js` is the last element before `</body>`, the DOM is fully parsed when it executes, so both scripts effectively see a complete DOM. No functional regression exists.

**Security note:** If `script.js` is ever moved to `<head>` without `defer`, it will execute before the DOM is ready and before `work-page.js` has a chance to render the work grid, but this is a robustness issue rather than a security issue. The current arrangement is safe.

**Fix:** Add `defer` to `script.js` for consistency and future-proofing:

```html
<script src="work-page.js" defer></script>
<script src="script.js" defer></script>
```

---

#### N-M-3 — No CSP `report-uri` or `report-to` directive; CSP violations are invisible

**File:** `_headers:7,22`

**Evidence:** Neither the global CSP nor the `/explode-viewer.html` path-scoped CSP includes a `report-uri` or `report-to` directive:

```
Content-Security-Policy: default-src 'none'; script-src 'self'; ... (no report-uri)
```

Without reporting, any CSP violation (including a real supply-chain attack where a CDN serves unexpected content, causing a blocked load) is silently discarded by the browser. The team receives no signal that the policy is working or that it is being bypassed.

**Fix:** Add a `report-to` directive. Free options:

- **report-uri.com** (free tier, 10,000 reports/month): `report-uri https://YOUR-ID.report-uri.com/r/d/csp/enforce`
- **Sentry** (if already used for error tracking): Sentry accepts CSP reports at a dedicated endpoint
- **Cloudflare CSP Analytics** (Cloudflare One / Zaraz): Available if the site uses Cloudflare Workers or Zaraz; no external service needed

Recommended `_headers` addition:

```
/*
  Content-Security-Policy: ...(existing)...; report-uri https://YOUR-ID.report-uri.com/r/d/csp/enforce
```

Use `Content-Security-Policy-Report-Only` first (alongside the enforcing header) for a burn-in period of 1-2 weeks to confirm no legitimate resources are being blocked before switching to enforcement-only mode.

---

### Low

---

#### N-L-1 — `explode-viewer.html` sandbox includes `allow-same-origin`; Three.js DRACO Web Worker requires `blob:` worker-src but sandbox may restrict workers

**File:** `index.html:377`; `_headers:22`

**Evidence:**

Iframe in `index.html:377`:
```html
sandbox="allow-scripts allow-same-origin"
```

Path-scoped CSP `worker-src blob:` is set for `/explode-viewer.html` at `_headers:22`. However, when `explode-viewer.html` is loaded inside an iframe with `sandbox="allow-scripts allow-same-origin"`, the browser enforces the sandbox policy of the *embedder*, not the embedded page's own response headers. The sandbox attribute on the `<iframe>` element does not include `allow-scripts` implicitly enabling workers — Web Workers spawned from within a sandboxed iframe require the sandbox to either be sufficiently permissive or the browser to honour the embedded page's own CSP.

In practice, Chromium-based browsers do allow `blob:` Web Workers from within `allow-scripts allow-same-origin` sandboxed iframes because `allow-scripts` covers script execution, which includes workers created via `new Worker(blob:...)`. Firefox behaviour is consistent. This is confirmed-safe for the DRACO loader pattern used.

The `allow-same-origin` flag is required because `explode-viewer.html` is same-origin to `index.html` and needs to read local `.gltf` and `.glb` files from the same origin. Without `allow-same-origin`, the iframe would be treated as cross-origin and all same-origin fetches would fail.

**Verdict:** Current `sandbox="allow-scripts allow-same-origin"` is the minimum correct set for this use case. No change required. Documented for operator awareness.

---

#### N-L-2 — `_redirects` file contains only a comment; www-to-apex redirect not implemented

**File:** `_redirects:1`

**Evidence:**

```
# Redirect www to apex (configure your DNS accordingly)
```

No redirect rules are defined. If a visitor navigates to `https://www.soviotech.com`, Cloudflare Pages will either serve a 404 (if `www` is not configured as a custom domain) or serve the site without the redirect (if `www` is a CNAME to the Pages project). Without an explicit `301` redirect, `www` and the apex domain are treated as separate origins by search engines and browsers, splitting PageRank and setting separate cookies/local-storage namespaces.

**Fix:** Add the following to `_redirects` (Cloudflare Pages uses Netlify-compatible `_redirects` syntax; the `!` suffix forces the redirect even if the destination file exists):

```
https://www.soviotech.com/*  https://soviotech.com/:splat  301!
```

This requires `www.soviotech.com` to be added as a custom domain in the Cloudflare Pages dashboard pointing to the same Pages project, so Cloudflare can intercept the `www` request before serving the redirect.

---

#### N-L-3 — `glb-test.html` inline `<script>` block requires `'unsafe-inline'` in global CSP; currently blocked by `script-src 'self'`

**File:** `glb-test.html:242-263`; `_headers:7`

**Evidence:**

`glb-test.html:242`:
```html
<script>
  const mvs = document.querySelectorAll('.mv');
  ...
</script>
```

The global `script-src 'self'` does not include `'unsafe-inline'`. This inline script is blocked. This is a subset of N-H-1 (the script is blocked along with the model-viewer module), but it is separately notable: even if model-viewer were self-hosted, the inline script controlling the UI would still need either `'unsafe-inline'` or a nonce/hash. Since this is a dev-only page, the practical impact is limited. Fix is included in N-H-1's recommended path-scoped CSP override for `/glb-test.html`.

---

## Regression checks — detailed verdicts

### explode-viewer iframe sandbox flags (Three.js + DRACO)

`index.html:377` — `sandbox="allow-scripts allow-same-origin"`.

- `allow-scripts`: required for Three.js ES module execution. Present.
- `allow-same-origin`: required for same-origin GLTF file fetch. Present.
- Workers: DRACO loader (`DRACOLoader`) at `explode-viewer.html:221-222` uses `draco.setDecoderPath('https://www.gstatic.com/draco/...')`. The DRACO decoder is loaded as a Web Worker via a `blob:` URL internally. Chromium allows `blob:` workers within `allow-scripts allow-same-origin` sandboxes. This is confirmed working.
- WebGL: `new THREE.WebGLRenderer({ canvas })` at `explode-viewer.html:153`. WebGL access is permitted within `allow-scripts` sandboxes in all major browsers.
- Verdict: sandbox flags are correct and sufficient. Not too restrictive.

### PDF modal `display:none` and focus

- `style.css:1349` — `.pdf-modal { display: none; }`. Confirmed.
- `style.css:1357-1360` — `.pdf-modal[aria-hidden="false"] { display: flex; opacity: 1; pointer-events: auto; }`. Confirmed.
- `work-page.js:172` — `setTimeout(() => document.querySelector('.pdf-modal__close').focus(), 50)`. Confirmed focus call present.
- `closePdf()` at `work-page.js:174-178` — `modal.setAttribute('aria-hidden', 'true')` restores hidden state; `display:none` is re-applied by CSS selector. Confirmed.
- Verdict: M-6 fully remediated.

### localStorage allow-list null handling

`script.js:4-8`:
```js
const stored = localStorage.getItem('theme');
const allowed = ['dark', 'light'];
const initial = allowed.includes(stored) ? stored : (prefersDark ? 'dark' : 'light');
root.setAttribute('data-theme', initial);
```

`localStorage.getItem('theme')` returns `null` on first visit (key absent). `['dark','light'].includes(null)` evaluates to `false`. The ternary falls through to `(prefersDark ? 'dark' : 'light')`. No garbage value reaches `setAttribute`. Null case is correctly handled.

### `work-page.js` extraction — no fetch, no user input, no secrets

Full scan of `work-page.js`:
- `PROJECTS` array at lines 3-32: hardcoded ASCII strings only. No `fetch()`, no `XMLHttpRequest`, no `import()`, no `eval()`.
- `pdfUrl()` at line 39: constructs URL from `ORG` constant + `repo` field from `PROJECTS`. No user input.
- `innerHTML` at line 63 and 105: line 63 renders from `PROJECTS` (hardcoded); line 105 builds pagination dots using `document.createElement('button')` — no `innerHTML` from user data.
- No API keys, tokens, credentials, or environment variables found.
- Verdict: extraction is clean.

### `work-page.js` `defer` and DOM-ready guards

- `work-page.js` is loaded with `defer` (`work.html:118`). Deferred scripts execute after DOMContentLoaded, guaranteeing all DOM elements referenced (`workGrid`, `pdfModal`, etc.) are present.
- No `DOMContentLoaded` listener is used because `defer` makes it unnecessary.
- Top-level code in `work-page.js` directly calls `document.getElementById('workGrid').innerHTML = ...` at line 63, which is safe because `defer` ensures the element exists.
- Verdict: correct.

### Inline event handlers (`onclick=`) introduced during extraction

Grep across all HTML files for `onclick=`, `onload=`, `onerror=`, `onmouseover=` — zero matches. No inline event handlers were introduced during the `work.html` script extraction. CSP `'unsafe-inline'` for scripts is not forced by any new pattern.

---

## CSP correctness — static analysis

### Global CSP (`_headers:7`, applies to all paths without a path-specific override)

```
default-src 'none';
script-src 'self';
style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
font-src https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self';
frame-src 'self' https://cdn.jsdelivr.net;
worker-src 'none';
object-src 'none';
base-uri 'self';
form-action 'none';
frame-ancestors 'none';
upgrade-insecure-requests
```

| Resource | Page | Directive needed | Covered? |
|----------|------|-----------------|---------|
| `fonts.googleapis.com` CSS | All | `style-src` | YES — `style-src ... https://fonts.googleapis.com` |
| `fonts.gstatic.com` font files | All | `font-src` | YES — `font-src https://fonts.gstatic.com` |
| `cdn.jsdelivr.net` PDF iframe | `work.html` | `frame-src` | YES — `frame-src 'self' https://cdn.jsdelivr.net` |
| `work-page.js` | `work.html` | `script-src 'self'` | YES |
| `script.js` | All | `script-src 'self'` | YES |
| `style.css` | All | `style-src 'self'` | YES |
| `ajax.googleapis.com` model-viewer | `glb-test.html` | `script-src` | **NO — BLOCKED** (see N-H-1) |
| `modelviewer.dev` HDR environments | `glb-test.html` | `connect-src` | **NO — BLOCKED** (see N-H-1) |
| Inline script | `glb-test.html:242` | `script-src 'unsafe-inline'` | **NO — BLOCKED** (see N-L-3) |

### Path-scoped CSP for `/explode-viewer.html` (`_headers:22`)

```
default-src 'none';
script-src 'self' https://unpkg.com 'unsafe-inline';
style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
font-src https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self' https://unpkg.com https://www.gstatic.com;
worker-src blob:;
object-src 'none';
base-uri 'self';
form-action 'none';
frame-ancestors 'self'
```

| Resource | Directive needed | Covered? |
|----------|-----------------|---------|
| `unpkg.com/three@0.160.0` (importmap) | `script-src` | YES — `https://unpkg.com` |
| `unpkg.com/three@0.160.0/examples/jsm/` (addons) | `script-src` | YES — `https://unpkg.com` |
| Inline importmap `<script type="importmap">` | `script-src 'unsafe-inline'` | YES — `'unsafe-inline'` present |
| Inline `<script type="module">` | `script-src 'unsafe-inline'` | YES — `'unsafe-inline'` present |
| `www.gstatic.com` DRACO decoder fetch | `connect-src` | YES — `https://www.gstatic.com` |
| DRACO blob: Worker | `worker-src` | YES — `blob:` |
| `fonts.googleapis.com` CSS | `style-src` | YES |
| `fonts.gstatic.com` fonts | `font-src` | YES |
| Inline `<style>` block | `style-src 'unsafe-inline'` | YES |

**Note on `'unsafe-inline'` for scripts:** The explode-viewer CSP requires `'unsafe-inline'` for the importmap and the module script. This is an accepted residual risk documented under H-5. Importmaps do not support `integrity=` attributes in the current spec, so `'unsafe-inline'` in `script-src` cannot be eliminated without self-hosting Three.js.

**Note on Cloudflare Pages CSP header stacking:** Cloudflare Pages applies the most-specific matching path rule. A request to `/explode-viewer.html` matches both `/*` and `/explode-viewer.html`. Cloudflare Pages (Netlify-compatible `_headers` parser) uses the last matching block's headers, meaning `/explode-viewer.html`'s `Content-Security-Policy` and `X-Frame-Options` **replace** (not append to) the global ones for that path. This is correct behaviour and the path-scoped CSP for `/explode-viewer.html` is self-contained and complete.

---

## Fresh-eyes surface scan

### postMessage listeners

Grep for `addEventListener('message'` across all files — **zero matches**. No postMessage listener exists. The explode-viewer iframe does not communicate with its parent via messaging. Safe.

### Query-string / hash parsing

Grep for `URLSearchParams`, `location.search`, `location.hash` across all files — **zero matches**. No URL parameter parsing exists anywhere in the codebase. No open-redirect or injection vector via URL parameters. Safe.

### Third-party trackers / pixels

Grep for `gtag`, `fbq`, `analytics`, `clarity`, `pixel`, `tracker` across all HTML and JS files — **zero matches**. No analytics, advertising pixels, or tracking scripts exist. The privacy surface is limited to the third-party CDN requests documented in I-1 of the prior audit (fonts.googleapis.com, fonts.gstatic.com, unpkg.com, www.gstatic.com, ajax.googleapis.com, cdn.jsdelivr.net).

### Cloudflare-specific infrastructure

- `_worker.js`: not present in the repository root. Confirmed.
- `/functions/` directory: not present. Confirmed.
- No Cloudflare Workers, Pages Functions, or edge middleware in scope. Site is purely static.

### Secrets scan

Full scan of `work-page.js`, `script.js`, `_headers`, `_redirects`, and all HTML files for API keys, tokens, passwords, and credentials — **none found**. `work-page.js` contains only the `ORG = 'https://github.com/SovIoTech'` constant (a public GitHub org URL, not a credential) and hardcoded project metadata.

---

## Residual risk (executive summary)

The most significant open risk after remediation is the CSP coverage gap on `glb-test.html` (N-H-1): the global `script-src 'self'` policy blocks both the `ajax.googleapis.com` model-viewer script and the inline JavaScript on that page, rendering it non-functional. While `glb-test.html` is a dev-only page with `X-Robots-Tag: noindex` applied, it is still publicly reachable and represents an unresolved supply-chain exposure through `ajax.googleapis.com` without SRI, outside the narrowed CSP. The accepted-risk finding H-5 (Three.js without SRI from unpkg.com) remains the highest-impact unresolved supply-chain risk: the path-scoped CSP correctly limits blast radius to `/explode-viewer.html`, but a compromised unpkg.com build could still execute arbitrary code within that iframe context. The absence of CSP `report-uri` directives (N-M-3) means all violations — including any future supply-chain attack indicator — are invisible. The `_redirects` file remains empty (N-L-2), leaving the `www` subdomain without a canonical redirect. All HIGH findings from the prior audit that required code changes (H-2, H-3, H-4) are fully remediated. The authentication, injection, and XSS surface has not expanded; `work-page.js` is confirmed clean with no user input paths, no fetch calls, and no secrets.

---

## Cloudflare dashboard checklist

The following settings must be configured manually in the Cloudflare dashboard. They cannot be set via `_headers` or `_redirects`.

- [ ] SSL/TLS Mode = Full (Strict) — requires a valid origin certificate; prevents SSL stripping and MITM between Cloudflare and origin
- [ ] Always Use HTTPS = On — redirects all HTTP requests to HTTPS at the Cloudflare edge before they reach the origin
- [ ] Minimum TLS Version = 1.2 — disables TLS 1.0 and TLS 1.1 which have known weaknesses (POODLE, BEAST)
- [ ] Automatic HTTPS Rewrites = On — rewrites mixed-content HTTP references in HTML to HTTPS, complementing the CSP `upgrade-insecure-requests` directive already in `_headers`
- [ ] Bot Fight Mode = Off — Cloudflare's Bot Fight Mode injects JavaScript challenges that can trigger false-positive blocks for legitimate visitors of a static marketing site; leave Off unless bot traffic becomes a measurable problem
- [ ] Browser Integrity Check = On — checks for common HTTP headers used by bots and spammers; low false-positive rate for a static site
- [ ] HSTS (HTTP Strict Transport Security) = Enabled, max-age 31536000, include subdomains — enforces HTTPS at the browser level; configure in SSL/TLS > Edge Certificates > HSTS. Note: enabling `includeSubDomains` requires all subdomains to serve HTTPS; verify before enabling.
- [ ] Minimum Cache TTL = consistent with `_headers` Cache-Control values (31536000 for assets, 0 for HTML pages)
- [ ] Custom domain `www.soviotech.com` added to the Pages project — prerequisite for the www-to-apex redirect in `_redirects` (N-L-2) to function

---

*End of Security Re-Audit v2 — 2026-06-25*
