# Literature Tracker — Full Recreation Prompt

Use this prompt with Claude to recreate the Literature Tracker application from scratch.

---

## High-Level Overview

Build a **React + Vite PWA** called **Literature Tracker** for following scientific journal RSS feeds across Chemistry, Engineering, and Materials Science. The app fetches articles from publisher RSS feeds, displays them with graphical abstracts, and lets users save/export articles and set up auto-save rules. Backend is **Supabase** (auth, Postgres, Edge Function RSS proxy). Deployed on **Vercel**.

---

## Tech Stack (exact versions matter)

- **React 18** + **Vite 6** + **React Router v6** (BrowserRouter)
- **Tailwind CSS 3** with class-based dark mode + **shadcn/ui** (Radix primitives)
- **TanStack React Query v5** (5-min default staleTime, 30-min gcTime, retry: 1, no refetchOnWindowFocus)
- **Supabase JS v2** — auth (email+password), Postgres, Edge Function (RSS proxy)
- **Framer Motion** for accordion/panel animations (NOT for article card entry/exit)
- **Lucide React** icons throughout
- **date-fns** for date formatting
- **clsx + tailwind-merge** via a `cn()` utility
- Path alias: `@` → `./src`

---

## Supabase Schema

### Tables

**followed_journals**
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users)
- `journal_id` (text) — matches the static catalog ID or `custom_{timestamp}`
- `journal_name` (text)
- `rss_url` (text)
- `is_active` (boolean, default true) — soft-delete pattern
- `created_at` (timestamptz)

**saved_articles**
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `article_id` (text) — the article URL (used as unique key)
- `title`, `link`, `authors`, `pub_date`, `journal_name`, `journal_abbrev`, `journal_color` (text)
- `thumbnail` (text) — graphical abstract URL
- `abstract` (text)
- `created_at` (timestamptz)

**journal_scopes** (shared across users, read-only in client)
- `id` (uuid, PK)
- `journal_id` (text)
- `keywords` (text[]) — AI-indexed search keywords for journal discovery

**auto_save_rules**
- `id` (uuid, PK)
- `user_id` (uuid, unique constraint for upsert)
- `enabled` (boolean)
- `keywords` (text[])
- `authors` (text[])

### RLS Policies
- All tables filter by `user_id = auth.uid()` for normal users
- Admin dashboard requires cross-user read on `followed_journals` and `saved_articles`

### Edge Function: `fetch-rss`
- POST endpoint accepting `{ rss_url: string }`
- Server-side RSS fetch + parse, returns `{ status, items }` JSON
- Items include: title, link, description, content (from content:encoded), author, doi, pubDate, enclosure

---

## Application Architecture

### Routing

| Route | Page | Auth Required |
|---|---|---|
| `/` | Home (Feed + Saved + Recommended tabs) | Yes |
| `/Settings` | Journal Selector | Yes |
| `/Guide` | User guide | Yes |
| `/AdminPopulateScopes` | Admin analytics dashboard | Yes |
| `/confirm` | Email confirmation landing | No |
| `*` | 404 PageNotFound | — |

Auth wrapping: `AuthProvider` at root → `useAuth()` hook. `/confirm` route is OUTSIDE the auth gate. All other routes show LoginPage if not authenticated.

### App Shell (App.jsx)
```
AuthProvider
  QueryClientProvider
    Router
      /confirm → ConfirmPage (no auth)
      /* → AuthenticatedApp
        Loading spinner while auth initializing
        LoginPage if not authenticated
        Routes (from pages.config.js) if authenticated
    SimpleToastContainer (global)
```

### Entry Point (index.html)
Critical: includes an **inline pre-paint script** that reads `localStorage.darkMode` and applies the `dark` class + background color to `<html>` BEFORE React mounts. This prevents white flash on page load. Dark mode is the default.

---

## Journal Catalog (~413 journals)

All journals defined in a single file (`JournalList.jsx`) as static arrays. Each journal:
```js
{ id, name, abbrev, rss_url, color, category }
```

### 3 Fields of Science
1. **Chemistry & Molecular Science** (~217 journals, 9 categories)
   - Categories: Analytical, Applied/Industrial, Biological/Medicinal, Catalysis, General, Inorganic/Materials, Organic, Physical/Theoretical, Polymers/Macromolecules
   - Note: Catalysis is its own category; Organometallics belongs in Catalysis, not Inorganic

2. **Engineering & Process Science** (~60 journals, 6 categories)
   - Categories: Chemical Engineering, General, Reaction Engineering, Scale-up & Manufacturing, Separations, Process Modeling & Simulation

3. **Materials, Analytics & Sustainability** (~136 journals, 5 categories)
   - Categories: Analytical & Measurement Science, Materials Science & Nanotechnology, Polymers & Soft Matter, Sustainability & Green Chemistry

### Publishers & Colors

| Publisher | Hex | Tailwind | Approx journal count |
|---|---|---|---|
| ACS | #2563eb | blue-600 | ~62 |
| Elsevier | #ea580c | orange-600 | ~33 |
| RSC | #c026d3 | fuchsia-600 | ~55 |
| Wiley | #16a34a | green-600 | ~30 |
| AAAS | #dc2626 | red-600 | ~9 |
| MDPI | #0891b2 | cyan-600 | ~28 |
| Springer Nature | #ca8a04 | yellow-600 | ~24 |
| Taylor & Francis | #7c3aed | violet-600 | ~17 |
| ASME | #475569 | slate-600 | ~5 |
| IChemE | #475569 | slate-600 | ~5 |
| IOP Publishing | #475569 | slate-600 | ~9 |

Canonical exports from JournalList: `ALL_JOURNALS`, per-publisher arrays (ACS_JOURNALS, RSC_JOURNALS, etc.), per-field arrays, `PUBLISHER_COLORS`, `PUBLISHER_LABELS`, `PUBLISHER_ORDER`, category arrays.

**Dropdown ordering** (Feed journal filter): ACS → Elsevier → RSC → Wiley → MDPI → Springer → Taylor → AAAS → ASME → IChemE → IOP → Other, with thin gray separators between publisher groups.

### RSS URL Patterns by Publisher
- **ACS**: `https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc={code}`
- **RSC**: `https://pubs.rsc.org/rss/{id}`
- **Wiley**: `https://onlinelibrary.wiley.com/feed/{ISSN}/most-recent` (some use `chemistry-europe.onlinelibrary.wiley.com` or `advanced.onlinelibrary.wiley.com`)
- **Elsevier**: `https://rss.sciencedirect.com/publication/science/{ISSN}`
- **Springer**: `https://link.springer.com/search.rss?search-within=Journal&facet-journal-id={id}&query=`
- **MDPI**: `https://www.mdpi.com/rss/journal/{name}`
- **Taylor & Francis**: `https://www.tandfonline.com/feed/rss/{code}`
- **AAAS**: `https://www.science.org/action/showFeed?type=axatoc&feed=rss&jc={code}`
- **Nature journals**: `https://www.nature.com/{name}.rss`

---

## RSS Fetching Strategy (`fetchRss.js`)

Two-tier fallback:
1. **Supabase Edge Function proxy** (POST to `/functions/v1/fetch-rss`) — server-side fetch, returns parsed JSON
2. **corsproxy.io** fallback (`https://corsproxy.io/?{encodedUrl}`) + client-side XML parsing via DOMParser

Both use a 12-second timeout. Return `{ status: 'ok'|'error', items: [] }`.

### Client-Side XML Parsing
- Handles RSS `<item>` and Atom `<entry>` formats
- Namespace-aware extraction for `dc:creator`, `content:encoded`, `dc:identifier`, `a10:updated`
- Collects ALL `dc:creator` elements (multi-author support)
- DOI extraction chain: dc:identifier → link regex → guid regex → description HTML regex
- Elsevier fallback: parses Author(s) and Publication date from description HTML
- RSC date patch: fills missing pubDate with today's date

### Feed Fetching in Home.jsx
- Fetches followed journals via React Query (10-min staleTime)
- Deduplicates journals by RSS URL before fetching
- Batches RSS fetches: 6 concurrent, 400ms delay between batches
- Articles cached with React Query (20-min staleTime, 30-min gcTime)
- Tracks failed journals for retry banner
- 90-minute refresh reminder banner

---

## Graphical Abstract Extraction (`articleMeta.js`)

`extractImage(article)` — multi-strategy pipeline:

1. **Direct enclosure/thumbnail** from feed metadata
2. **ACS**: regex for `pubs.acs.org/cms/.../asset/images/medium/...` in content/description HTML (always .gif)
3. **Elsevier**: construct from PII in link → `https://ars.els-cdn.com/content/image/1-s2.0-{PII}-ga1_lrg.jpg`
4. **RSC**: construct from article ID IF description contains `GA?id=` indicator → `pubs.rsc.org/.../ImageService/image/GA?id={id}`. Return null if no GA indicator (hides article)
5. **Springer Nature**: construct from DOI → `media.springernature.com/lw685/springer-static/image/art%3A{encodedDoi}/MediaObjects/{journalId}_{year}_{articleNum}_Figa_HTML.png`
6. **Generic fallback**: search HTML for `src="..."` with image extensions, then `href`, then bare URLs

### Image URL Blocklist
Skip: spacer, pixel, blank, icon, logo, arrow, button, badge, 1x1, tracking, beacon, stat, rsc-cdn.org, orcid.org/assets, creativecommons.org, licens

### Image Cache
- Map-based LRU cache (max 5000 entries) keyed by article link
- `getCachedImage(article)` wraps `extractImage` with cache

### Other Extractors
- `extractAbstract(article)`: first `<p>` tag with >60 chars from content/description
- `buildPdfUrl(article)`: publisher-specific URL transforms for direct PDF links
- `decodeHtmlEntities(str)`: browser textarea trick with regex fallback

---

## GA Filtering in Feed

Two publisher sets control graphical abstract behavior:

**GA_REQUIRED_IDS** (ACS, RSC, Wiley, Elsevier, Springer): Articles without a detected GA image are filtered out of the feed (corrections, errata, papers without GA).

**GA_HIDE_ON_FAIL_IDS** (Elsevier, Springer only): Articles where the image 404s are hidden (URL is constructed from DOI — 404 means GA doesn't exist). For ACS/RSC/Wiley, image failure = network issue, not missing GA, so articles stay visible with BookOpen placeholder.

Fallback: if GA filtering hides ALL articles, the filter is disabled entirely so the feed isn't empty.

---

## Pages & Features

### Home Page — Feed Tab
- Sticky header: logo + "Literature Tracker" title, 3 tabs (Feed / Saved / Recommended), action buttons (Settings, Guide, theme toggle, logout)
- Tab badges: unread count on Feed, saved count on Saved (with green dot if auto-save enabled)
- Feed controls: journal dropdown (grouped by publisher with colored dots/labels/separators), keyword search input with search history dropdown (max 10 per user, stored per-user in localStorage)
- Article cards with infinite scroll (30 per page, IntersectionObserver sentinel)
- "Collapse old articles" — articles >7 days old hidden behind expandable button
- Sort: journal name A→Z, then newest first within each journal
- Filter state persisted to URL params (journal) + localStorage (journal) + local state (keyword)
- Failed feeds: red alert banner with retry button
- Empty state: welcome screen with link to Journal Selector
- Back-to-top button after scrolling 400px
- Keyboard shortcuts: j/k (prev/next), s (save), o (open), ? (help modal)
- Offline banner (navigator.onLine detection)

### Home Page — Saved Tab
- Lists all saved articles with selection checkboxes
- Bulk actions: Remove (with confirmation), Export
- Auto-save rules panel (collapsible): keyword + author inputs (max 20 each, 100 chars), enable/disable toggle, live preview count
- Match reason badges on auto-saved articles (emerald for keyword match, blue for author match)
- Export modal: RIS, CSV, or plain text formats with download
- Share button per article: Email, Teams, ReadCube Papers (RIS), BibTeX
- Optimistic removal (cards vanish instantly, API call in background)
- Rules synced to Supabase + cached in localStorage per user

### Home Page — Recommended Tab
- Scoring algorithm: fetches from 4 random followed + 6 random unfollowed journals
- Scoring: +2 keyword match, +2 author match, +1 if journal is followed; excludes already-saved
- Filter panel: keyword tags + author tags with add/remove, enable/disable toggle
- "Strong match" badge for score >= 4
- Articles sorted by score descending

### Settings Page — Journal Selector
- 3-field tab switcher: Chemistry / Engineering / Materials (with colored icons)
- Keyword search with fuzzy matching against journal names + AI-indexed scopes + category keyword fallback
- Two filter dropdowns: Publisher, Category
- Accordion navigation: Publisher → Category → Individual journals
- Journal row: colored toggle circle, publisher-colored BookOpen icon, abbrev (bold) + full name (80% opacity)
- Hover states: green border (add) / red border (remove)
- Selection badges per publisher/category
- "Selected Journals" panel: grouped by publisher, toggle/delete actions, "Unselect All"
- Custom RSS journal form: name + URL inputs, creates journal with `custom_{timestamp}` ID
- Cross-field sibling detection by RSS URL
- Content card: max-width 620px, centered, responsive

### Guide Page
- Static documentation with sections: Feed, Saved Articles, Search & Filter, Journal Selector, Tips
- Content card: 620px mobile, 806px on sm+ breakpoint

### Admin Dashboard
- 4 stat cards: Users, Active Follows, Saved Articles, Total Journals
- "Most Followed" and "Most Saved" top-10 lists with mini bar charts
- "Saves per Day" (14-day history) bar chart
- "Recent Saves" list (last 10)
- RLS notice banner

### Login Page
- 3 modes: sign in, sign up, forgot password
- Email + password form with Supabase auth
- Rate limiting detection
- Centered card with logo, gradient background

### Confirm Page
- Email verification with Supabase OTP + hash fallback
- 3 states: verifying (spinner), success (redirect to login), error (expired link message)
- 8-second timeout

---

## Article Card Component

**Desktop layout**: horizontal flex — graphical abstract image (405px fixed width, 160-220px height, object-contain) on left, content on right.
**Mobile layout**: full-width image on top (max 160px height), content below.

Content area:
- Journal badge (publisher-colored tint background) + date + unread dot (blue)
- Title (blue if unread, gray if read; 2-line clamp)
- Authors (with blue star for corresponding author marked with *)
- DOI with link to doi.org
- Save button (amber when saved) + Share dropdown

Unread tracking:
- Blue vertical bar on left edge if unread
- Article marked "seen" when it scrolls OUT of viewport (via shared IntersectionObserver)
- Also marked on unmount if it was ever visible
- Uses per-user localStorage (`seenArticles:{userId}`)

Image error handling:
- Springer: try .jpg fallback when .png fails
- Show BookOpen placeholder icon on final failure
- Report failure to parent via `onImageFail` callback

Save: optimistic (UI flips instantly, reconciles on server response) with toast notifications.

All `<img>` tags use `referrerPolicy="no-referrer"` for publisher CDN compatibility.

**IMPORTANT**: No entry/exit animations on ArticleCard or SavedCard. They cause visible blink on tab switch and refresh.

---

## Auto-Save System

### Hook (`useAutoSave`)
- Fetches rules from Supabase, caches in localStorage per user
- On new articles: filters unprocessed, checks `articleMatchesRules()`, saves matches
- Tracks processed articles in per-session Set (prevents re-saving)
- Resets on rule changes (listens to `autosave-rules-changed` custom event)
- Extracts abstract + image for saved record

### Matching (`articleMatch.js`)
- OR logic: ANY keyword match in title+content+description OR ANY author match
- Case-insensitive
- Returns true/false

---

## Dark Mode

- **Dark mode is the default**
- Class-based (`html.dark`) with Tailwind `dark:` variants
- `useDarkMode()` hook returns `[isDark, toggle]`
- localStorage key: `darkMode` (per-browser, NOT per-user — intentional)
- Pre-paint script in index.html syncs before React mount
- Theme toggle icons: Sun (`text-orange-400`), Moon (`text-blue-500`)
- Every `dark:` class needs a light-mode pair. Never use bare `text-white` without light-mode equivalent.

---

## Per-User localStorage Keys

All user-specific state namespaced by Supabase user ID:

| Key | Purpose |
|---|---|
| `cjf_autosave_rules:{userId}` | Auto-save keywords & authors cache |
| `seenArticles:{userId}` | Read/unread article history |
| `cjf_feed_filters:{userId}` | Feed journal filter selection |
| `cjf_search_history:{userId}` | Search bar recent terms (max 10) |
| `darkMode` | Theme (per-browser, not per-user) |

Legacy un-namespaced keys are purged on mount.

---

## Card Border Tokens

Two distinct border styles defined in tailwind.config.js:

| Context | Token | Width | Where |
|---|---|---|---|
| Article cards | `border-card` | 1.125px | ArticleCard, SavedCard, SkeletonCard, search box |
| Container cards | `border-container` | 1.5px | Settings, Guide, Admin, AutoSaveRules, Login |

Colors: Article cards use `border-slate-400/80 dark:border-slate-600`. Container cards use `border-border`.

---

## CSS Theme Variables (index.css)

HSL-based CSS variables for light/dark:
- Light: warm blue-gray tones (background ~94% lightness)
- Dark: near-black (background ~3.9% lightness)
- Applied via `@layer base` rules on `:root` and `.dark`

Custom CSS:
- `.journal-scroll` — thin scrollbar for journal selector
- `.feed-pulse` / `.feed-pulse-strong` — gentle blue halo pulsing animation for feed tab
- `.app-tooltip` / `.app-tooltip-lg` — small tooltip styling
- Global `focus-visible` ring (blue-500/70) for keyboard accessibility

---

## Performance Optimizations

- **Shared IntersectionObserver**: one singleton observer for all article cards (avoids 500+ individual observers)
- **Image cache**: LRU Map (5000 entries) prevents re-running regex extraction
- **Batched RSS fetches**: 6 concurrent with 400ms between batches
- **Infinite scroll**: only 30 articles rendered initially, loads more on scroll
- **React.memo + forwardRef**: ArticleCard is memoized
- **Vendor chunking** in Vite: separate chunks for react, react-query, supabase, framer-motion, radix/clsx, lucide, date-fns
- **Deduplication by RSS URL**: prevents fetching same feed twice for sibling journals
- **O(1) saved lookup**: Map instead of .find() per card

---

## shadcn/ui Components Used

In `src/components/ui/` (DO NOT hand-edit, regenerate via CLI):
- badge.jsx, button.jsx, dialog.jsx, input.jsx, Skeleton.jsx

Custom components that live in ui/ for convenience:
- Tooltip.jsx — lightweight hover tooltip with configurable delay/position
- ToggleSwitch.jsx — accessible on/off switch (green ON, red OFF)
- SimpleToast.jsx — auto-dismissing notification (global `showToast()` function, 2.2s duration)

---

## PWA Setup

- Minimal service worker (`sw.js`) for installability only (no asset caching)
- `manifest.json` with app name, icons, standalone display mode
- Registered in main.jsx on window load

---

## Build & Deploy

- `npm run build` — Vite production build
- `npm run lint && npm run typecheck` before committing
- Vercel auto-deploys from `main` branch
- `vercel.json`: SPA rewrite `/(.*) → /index.html` (required for deep-link refresh)
- Never force-push main

---

## Key Constraints & Hard Rules

1. **No entry animations on ArticleCard/SavedCard** — causes visible blink on tab switch/refresh
2. **Don't hand-edit `src/components/ui/`** — shadcn primitives (except Tooltip.jsx, ToggleSwitch.jsx, SimpleToast.jsx)
3. **`vercel.json` is required** — SPA rewrite for deep links
4. **Never commit `.env*` or service-role keys** — publishable key in supabaseClient.js is safe
5. **All per-user localStorage must be namespaced by userId** — prevents cross-account bleed
6. **URL-based feed filters** — journal selection persisted to URL params so refresh/bookmark/back work
7. **Every `dark:` class needs a light-mode pair** — no bare text-white or bg-[rgb()] without counterpart
8. **Catalysis is its own category** — Organometallics belongs in Catalysis, not Inorganic
