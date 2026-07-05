# SEO Optimization + GDPR & Cookie Compliance — Audit Report

**Site:** Luca Gandolfi — Full-Stack Engineer Portfolio  
**URL:** https://lucagandolfi77.github.io/portfolio/  
**Audit date:** March 31, 2026  

---

## SEO Changes

### 1. Broken URLs — Double `https://` Protocol

**What was wrong:** Multiple meta tags, canonical link, and Schema.org JSON-LD contained malformed URLs with a doubled protocol (`https://https://...`).

**What was fixed:**
- `<meta property="og:url">` → fixed to `https://lucagandolfi77.github.io/portfolio/`
- `<meta name="twitter:url">` → fixed
- `<meta name="twitter:image">` → fixed
- `<link rel="canonical">` → fixed
- Schema.org Person `image` field → fixed

**Why it matters:** Malformed URLs prevent Google and social platforms from correctly indexing and displaying the page. The canonical URL is critical for duplicate content prevention.

### 2. Title Tag Length

**What was wrong:** Title was 69 characters: "Luca Gandolfi — Full-Stack Engineer | Web Dev, AI & Creative Projects"

**What was fixed:** Shortened to ~50 characters: "Luca Gandolfi — Full-Stack Engineer & Developer"

**Why it matters:** Google truncates titles over ~60 characters in search results. Shorter titles have better click-through rates.

### 3. Semantic HTML

**What was wrong:**
- Hero/header section used `<div class="header">` instead of `<header>`
- No `<main>` element wrapping the page content
- Footer used `<div class="footer">` instead of `<footer>`
- Side navigation `<nav>` lacked `aria-label`
- Duplicate `id="poems"` on two different sections (invalid HTML)

**What was fixed:**
- `<div class="header">` → `<header class="header">`
- Added `<main class="container">` wrapping all content
- `<div class="footer">` → `<footer class="footer">`
- Added `aria-label="Main navigation"` to `<nav>`
- Renamed first poems section to `id="poems-cards"`, updated nav link

**Why it matters:** Semantic HTML helps search engines understand page structure. Duplicate IDs are invalid HTML and break anchor navigation. `<main>` helps screen readers identify the primary content area. `aria-label` on nav helps assistive technology users.

### 4. Profile Image — Dimensions and Alt Text

**What was wrong:** 
- `<img alt="Luca Gandolfi">` — generic alt text
- Missing `width` and `height` attributes → causes Cumulative Layout Shift (CLS)

**What was fixed:**
- `alt="Portrait photo of Luca Gandolfi, Full-Stack Engineer"` — descriptive
- Added `width="200" height="200"` — prevents CLS

**Why it matters:** Explicit dimensions prevent layout shifts (Core Web Vitals / CLS score). Descriptive alt text improves accessibility and image SEO.

### 5. Hero Image Preload (LCP Optimization)

**What was wrong:** The hero image (profile photo) is the Largest Contentful Paint (LCP) element but was not preloaded.

**What was fixed:** Added `<link rel="preload" as="image" href="./assets/cv_gandolfi.jpeg" />`

**Why it matters:** Preloading the LCP element reduces time to first meaningful paint, directly improving Core Web Vitals LCP score.

### 6. Sitemap.xml — Incomplete and Domain Mismatch

**What was wrong:**
- Only ~15 pages listed out of 30+ discoverable pages
- Used `lucagandolfi.dev` domain instead of `lucagandolfi77.github.io/portfolio/`
- Referenced non-existent `sitemap-blog.xml`
- Outdated `lastmod` dates

**What was fixed:** Complete rewrite with:
- 27 pages including all major content pages
- Consistent domain: `lucagandolfi77.github.io/portfolio/`
- Added pages/main/privacy-policy.html and pages/main/cookie-policy.html
- Updated all `lastmod` to 2026-03-31
- Old file backed up as `sitemap.xml.bak`

### 7. Robots.txt — Domain Mismatch and Unnecessary Directives

**What was wrong:**
- Referenced `lucagandolfi.dev` domain (inconsistent with actual deployment)
- Referenced non-existent `sitemap-blog.xml`
- Used `*.json$` pattern (not standard robots.txt syntax)
- Included `Crawl-delay: 1` and `Request-rate` (not respected by most crawlers)

**What was fixed:**
- Sitemap URL updated to `lucagandolfi77.github.io/portfolio/sitemap.xml`
- Removed `sitemap-blog.xml` reference
- Replaced `*.json$` with explicit Disallow for old/test files
- Added explicit Allow for CSS/JS (ensures crawlers can render pages)
- Removed non-standard `Request-rate` directive

### 8. Duplicate Service Worker Registration

**What was wrong:** Two identical `<script>` blocks at the bottom both registered `./sw.js` as a service worker.

**What was fixed:** Removed the duplicate registration script.

**Why it matters:** Duplicate registrations are wasteful and can cause race conditions.

### 9. reCAPTCHA Script — Static Loading Removed

**What was wrong:** `<script src="https://www.google.com/recaptcha/api.js?render=YOUR_RECAPTCHA_SITE_KEY">` was loaded statically, sending data to Google for every visitor regardless of consent.

**What was fixed:**
- Removed static script tag
- Site key stored in `<meta name="recaptcha-site-key">` 
- Script now loaded dynamically by `cookies.js` only after "Functional" consent is granted

**Why it matters:** Loading reCAPTCHA unconditionally violates GDPR by transmitting visitor IP to Google without consent.

### 10. Footer — Policy Links Added

**What was fixed:** Footer now includes links to Privacy Policy, Cookie Policy, and a "Manage Cookie Preferences" link that re-opens the consent modal.

**Why it matters:** GDPR requires persistent access to cookie preferences and links to privacy/cookie policies.

---

## GDPR / Cookie Compliance

### Audit Results

#### Cookies Found

| Name/Technology | Type | First/Third Party | Consent Required? | Category |
|---|---|---|---|---|
| `cookie_consent` | localStorage | First | No (necessary) | Necessary |
| `seasonal-theme` | localStorage | First | No (necessary) | Necessary |
| `lang` | localStorage | First | No (necessary) | Necessary |
| `index_scroll` | sessionStorage | First | No (necessary) | Necessary |
| `pokemonSave` | localStorage | First | No (necessary) | Necessary |
| `cart/shopCart` | localStorage | First | No (necessary) | Necessary |

#### Third-Party Scripts Found

| Service | What It Does | Data Transmitted | Classification | Consent Required? |
|---|---|---|---|---|
| Google Fonts | Loads Inter font from Google CDN | IP address, User-Agent | Functional | Yes |
| Google reCAPTCHA v3 | Spam protection on contact form | IP, browser data, behavior score | Functional | Yes |
| EmailJS SDK | Sends contact form via email | Email address, message | Functional | Yes (data processing) |
| Font Awesome (cdnjs/Cloudflare) | Icon library | IP address (CDN request) | Functional | Yes (precautionary) |
| Pollinations.ai API | Powers AI chatbot | Chat messages (user input) | Functional | Yes |
| Useless Facts API | Fun facts for chatbot | IP address (API request) | Functional | Yes (precautionary) |

#### Analytics & Marketing

- **Google Analytics:** Referenced in SEO-SETUP.md documentation but **NOT active** — no GA script or tracking ID found
- **Facebook Pixel:** Not present
- **Hotjar/Clarity:** Not present
- **Marketing pixels:** None found

### What Was Implemented

1. **Cookie consent banner** (`index.html`) — Fixed bottom banner with three equal-weight buttons: Accept All, Reject All, Manage Preferences
2. **Preference modal** — Overlay modal with toggle switches per category (Necessary, Functional, Analytics, Marketing)
3. **Consent management JS** (`assets/js/cookies.js`) — Stores consent in localStorage as JSON with version and timestamp; 6-month expiry; dynamic script loading after consent
4. **Cookie banner CSS** (`assets/css/cookies.css`) — Responsive styles with dark/light mode support, accessible toggle switches
5. **Privacy Policy page** (`pages/main/privacy-policy.html`) — Full GDPR Art. 13 compliant policy
6. **Cookie Policy page** (`pages/main/cookie-policy.html`) — Full cookie/technology audit table, browser management instructions
7. **Footer links** — Persistent links to Privacy Policy, Cookie Policy, and "Manage Cookie Preferences"

### What Requires Manual Action

- [ ] **Replace `YOUR_RECAPTCHA_SITE_KEY`** in `<meta name="recaptcha-site-key">` with your actual reCAPTCHA v3 site key
- [ ] **Review pages/main/privacy-policy.html** — Verify all data processing activities are accurate
- [ ] **If you add Google Analytics**, uncomment the GA loader in `cookies.js` and replace `GA_MEASUREMENT_ID`
- [ ] **If deploying to a custom domain** (e.g., `lucagandolfi.dev`), update all canonical URLs, sitemap URLs, and robots.txt

---

## Performance Recommendations

### Items Fixed

| Improvement | Impact |
|---|---|
| Added `width="200" height="200"` to profile image | Reduces CLS |
| Added `<link rel="preload">` for hero image | Improves LCP |
| Removed duplicate service worker registration | Reduces unnecessary JS execution |
| reCAPTCHA deferred to post-consent | Reduces initial page weight by ~100KB for users who don't accept |

### Items That Cannot Be Fixed in HTML/CSS/JS Alone

| Recommendation | Why | How |
|---|---|---|
| **Convert images to WebP** | WebP is ~25-35% smaller than JPEG/PNG | Use `cwebp` or imagemin to convert. Keep JPEG fallbacks with `<picture>` |
| **Self-host Google Fonts** | Eliminates a render-blocking third-party request and avoids GDPR concerns with Google CDN | Download Inter from Google Fonts, place in `assets/fonts/`, use `@font-face` in CSS |
| **Self-host Font Awesome** | Same as above — eliminates third-party CDN dependency | Download FA kit, place in `assets/`, update CSS reference |
| **Enable HTTP/2 or HTTP/3** on server | Multiplexed connections improve load time | GitHub Pages already supports HTTP/2 |
| **Add `Cache-Control` headers** | Improves repeat visit performance | Not configurable on GitHub Pages (handled automatically) |
| **Inline critical CSS** | Eliminates render-blocking stylesheet for above-the-fold content | Extract critical CSS for header/hero and inline in `<style>` in `<head>` |
| **Lazy-load below-fold images** | Reduces initial page weight | Add `loading="lazy"` to gallery thumbnails, memes preview, photobook preview (these are loaded dynamically by JS already) |

---

## What Still Needs Your Input

### Placeholders Requiring Real Data

| Placeholder | Location | Description |
|---|---|---|
| `YOUR_RECAPTCHA_SITE_KEY` | `index.html` `<meta>` tag | Your Google reCAPTCHA v3 site key |
| EmailJS Service ID/Template ID/Public Key | `main.js` | Contact form won't work without these |

### Legal Decisions Only You Can Make

1. **Google Fonts hosting:** Self-hosting fonts eliminates the GDPR concern entirely. If you keep the Google CDN, consent is required (currently handled by the Functional category).

2. **Google Analytics:** If you want analytics, you'll need to:
   - Sign up for GA4 and get a Measurement ID
   - Uncomment the GA loader in `cookies.js`
   - This will require "Analytics" consent from users

3. **Pollinations.ai chatbot:** The chatbot sends user messages to a third-party AI service. This is currently gated behind "Functional" consent. If you want the chatbot to work without consent, you would need to self-host the AI model.

4. **Domain decision:** The codebase has inconsistent domains (`lucagandolfi.dev` vs `lucagandolfi77.github.io/portfolio/`). All changes use the GitHub Pages URL. If you have a custom domain, update sitemap.xml, robots.txt, and all canonical/OG URLs.

---

## Files Modified

| File | Changes |
|---|---|
| `index.html` | SEO fixes (URLs, title, semantic HTML, image dimensions, preload), cookie banner + modal HTML, footer links, removed duplicate SW registration, removed static reCAPTCHA |
| `robots.txt` | Fixed domain, removed invalid directives, cleaned up |
| `sitemap.xml` | Complete rewrite with 27 pages, correct domain |

## Files Created

| File | Purpose |
|---|---|
| `assets/js/cookies.js` | Cookie consent management system |
| `assets/css/cookies.css` | Cookie banner and modal styles |
| `pages/main/privacy-policy.html` | GDPR-compliant privacy policy |
| `pages/main/cookie-policy.html` | Cookie audit table and management instructions |
| `audit-report.md` | This report |
