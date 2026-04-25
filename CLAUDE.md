# Literature Tracker

React + Vite + Supabase PWA for following scientific journal RSS feeds across
Chemistry, Engineering, and Materials Science. Deployed on Vercel at
**https://literature-tracker.com**.

- **Repo:** github.com/pmjzzvs89z/ACS-journal-feed
- **Branch:** `main` (Vercel auto-deploys on push)
- **Owner:** Jerzy Klosin — `jklosin@dow.com`

---

## Tech stack

- React 18 + Vite 6 + React Router v6
- Tailwind CSS 3 (class-based dark mode) + shadcn/ui (Radix primitives)
- TanStack React Query v5 (5-minute default `staleTime`)
- Supabase — auth, Postgres, and an Edge Function used as an RSS proxy
- Framer Motion, Lucide icons, date-fns
- Path alias: `@` → `./src`

## Common commands

```bash
npm run dev        # local dev server
npm run build      # production build
npm run lint       # ESLint
npm run lint:fix   # auto-fix
npm run typecheck  # TypeScript / JSDoc type check
npm test           # Vitest unit tests (articleMeta, articleMatch)
npm run preview    # preview production build
```

Run `npm run lint && npm run typecheck` before committing.

---

## Repo layout

```
src/
  api/
    supabaseClient.js       Supabase client (publishable key, safe to commit)
    entities.js             CRUD: FollowedJournal, SavedArticle, AutoSaveRules,
                            DismissedArticle, JournalScope, Admin
  components/
    articles/               ArticleFeed, ArticleCard, SavedFeed, RecommendedFeed,
                            AutoSaveRules, ArticleFilters (with search history),
                            ExportModal, ShareButton, AuthorRenderer,
                            JournalDropdown, SkeletonCard, SmartImage
    auth/                   LoginPage, ConfirmPage
    journals/               JournalList (the data source), JournalSelector,
                            JournalSearch, AddCustomJournal, SelectedJournalsList
    ui/                     shadcn/ui primitives — DO NOT HAND-EDIT
  hooks/
    useDarkMode.js          Dark-mode toggle, localStorage-backed
    useAutoSave.js          Auto-save articles matching user rules
    useSharedObserver.js    Singleton IntersectionObserver for large lists
    useReadCubeTooltips.js  Style ReadCube extension's injected Papers/PDF tooltips
    use-mobile.jsx
  lib/
    AuthContext.jsx         Supabase auth provider + useAuth() hook
    query-client.js         React Query config
    NavigationTracker.jsx
    PageNotFound.jsx
    utils.js                cn() (clsx + twMerge), isIframe()
  pages/
    Home.jsx                Feed / Saved / Recommended tabs
    Settings.jsx            Journal Selector
    Guide.jsx               User guide
    AdminPopulateScopes.jsx Admin dashboard (usage analytics)
  utils/
    fetchRss.js             RSS fetch chain: Supabase proxy → corsproxy.io →
                            CrossRef fallback (IOP only)
    articleMeta.js          extractAbstract, extractImage, buildPdfUrl, getCachedImage
    articleMatch.js         articleMatchesRules (keyword/author OR matching)
    seenArticles.js         Read/unread article tracking (debounced localStorage)
    dismissedArticles.js    Per-user dismissed-article tracking (Supabase + cache)
                            so auto-save never re-adds a removed article
    doiResolver.js          Elsevier PII → DOI lookup via CrossRef, cached forever
    articleMeta.test.js     Vitest tests for articleMeta
    articleMatch.test.js    Vitest tests for articleMatch
  pages.config.js           Auto-generated page → route map
index.html                  Contains pre-paint theme bootstrap script + ReadCube
                            extension marker (`readcube_extension_enabled` meta)
vercel.json                 SPA rewrite rule — required for deep-link refresh
supabase-edge-function-fetch-rss.ts
                            Standalone copy of the deployed Edge Function source
                            (deploy via Supabase dashboard; not part of the build)
```

## Routing

| Route                   | Page                  | Notes                            |
|-------------------------|-----------------------|----------------------------------|
| `/`                     | Home                  | Feed + Saved + Recommended tabs  |
| `/Settings`             | Settings              | Journal Selector                 |
| `/Guide`                | Guide                 | User guide                       |
| `/AdminPopulateScopes`  | AdminPopulateScopes   | Admin analytics                  |
| `/confirm`              | ConfirmPage           | Pre-auth email confirmation      |

All routes except `/confirm` are gated by `AuthProvider` / `useAuth()`.
404 fallback: `src/lib/PageNotFound.jsx`.

---

## Where things live (landmarks)

When you need to change…

- **The journal catalog, categories, or publishers** →
  `src/components/journals/JournalList.jsx`
  (exports `ALL_JOURNALS` and `CHEMISTRY_CATEGORIES`; all publishers are
  defined inline in this one file — there are no separate publisher files)
- **Publisher colors / labels / order** →
  `src/components/journals/JournalList.jsx`
  (canonical exports: `PUBLISHER_COLORS`, `PUBLISHER_LABELS`, `PUBLISHER_ORDER`,
  helpers `publisherKeyForJournalId`, `publisherColorForJournalId`,
  `publisherColorForJournalNameOrAbbrev`)
- **Publisher → journal ID mapping** →
  `src/components/articles/ArticleFeed.jsx` (`PUBLISHER_ID_MAP`)
- **Supabase CRUD** → `src/api/entities.js`
- **Auth state** → `src/lib/AuthContext.jsx` (`useAuth()`)
- **RSS fetching** → `src/utils/fetchRss.js`
- **Article metadata helpers** (extractAbstract, extractImage, etc.) →
  `src/utils/articleMeta.js`
- **Seen/unread article tracking** → `src/utils/seenArticles.js`
- **Dismissed articles** (auto-save protection) → `src/utils/dismissedArticles.js`
  (Supabase-backed via `entities.DismissedArticle`, with localStorage cache)
- **Elsevier PII → DOI resolver** → `src/utils/doiResolver.js`
  (CrossRef lookup, used by ArticleCard for Elsevier articles missing a DOI)
- **Auto-save rule matching** → `src/utils/articleMatch.js`
- **Auto-save hook** → `src/hooks/useAutoSave.js`
- **Dark-mode toggle** → `src/hooks/useDarkMode.js`
- **Shared IntersectionObserver** → `src/hooks/useSharedObserver.js`
  (singleton observer for large article lists — avoids 500+ individual observers)
- **ReadCube extension integration** → marker `<span class="__readcube-library-button"
  data-doi="...">` in `ArticleCard`, `SavedFeed`, `RecommendedFeed`; tooltip styling
  via `src/hooks/useReadCubeTooltips.js` and CSS in `src/index.css`
- **Welcome-screen flash prevention** → `src/pages/Home.jsx` writes a
  `cjf_has_journals_hint:<userId>` flag; `ArticleFeed` reads it to render the
  Welcome screen optimistically on refresh

---

## Design choices & preferences

### Dark mode
- **Dark mode is the default.** Light mode must remain fully legible —
  every `dark:` class needs a light-mode equivalent. Never use bare
  `text-white` or `bg-[rgb(...)]` without a light-mode pair.
- `index.html` contains an **inline pre-paint script** that reads
  `localStorage.darkMode` and applies the `dark` class + background color
  *before* React mounts. This eliminates the white flash on refresh.
  **Do not remove it.**
- Theme toggle icons: **Sun is `text-orange-400`**, **Moon is `text-blue-500`**.

### Publisher colors (used in Feed dropdown and Journal Selector)

| Publisher          | Hex        | Tailwind        |
|--------------------|------------|-----------------|
| ACS                | `#2563eb`  | blue-600        |
| Elsevier           | `#ea580c`  | orange-600      |
| RSC                | `#c026d3`  | fuchsia-600     |
| Wiley              | `#16a34a`  | green-600       |
| AAAS               | `#dc2626`  | red-600         |
| MDPI               | `#0891b2`  | cyan-600        |
| Springer Nature    | `#ca8a04`  | yellow-600      |
| Taylor & Francis   | `#7c3aed`  | violet-600      |
| ASME/IChemE/IOP    | `#475569`  | slate-600       |

**Dropdown order** (grouped, not alphabetical):
ACS → Elsevier → RSC → Wiley → MDPI → Springer → Taylor → AAAS → ASME →
IChemE → IOP → Other, with thin gray separators between groups.

### Typography & layout
- Journal names render **inline** as `<abbrev> (<full name>)`, with the full
  name at 80% opacity (`text-muted-foreground/80`).
- Settings content cards are **max-width 620 px**, centered and responsive
  on mobile (`maxWidth: '620px'` + `w-full`).
- Guide content card is **620 px on mobile, 806 px on sm+**
  (`max-w-[620px] sm:max-w-[806px]`).
- Category rows in the Journal Selector use tight vertical padding
  (`py-[0.4rem]`); the Feed dropdown uses `py-[0.228rem]` with a small
  negative `marginTop` on non-first-in-group items to tighten intra-group
  spacing without touching separator distance.

### Card borders

Two intentional border styles:

| Context | Token class | Raw value | Where |
|---------|-------------|-----------|-------|
| **Article cards** (Feed, Saved, skeleton loader, search box) | `border-card border-slate-400/80 dark:border-slate-600` | 1.125px | ArticleCard, SavedCard, SkeletonCard, ArticleFilters |
| **Container cards** (Settings, Guide, Admin, Auto-Save Rules) | `border-container border-border` | 1.5px | Settings.jsx, Guide.jsx, AdminPopulateScopes, AutoSaveRules |

Tokens `border-card` and `border-container` are defined in `tailwind.config.js`
under `theme.extend.borderWidth`. New article-like cards should use
`border-card`. New container/section cards should use `border-container`.

### Per-user localStorage keys

All user-specific localStorage state is namespaced by Supabase user id so
it cannot bleed between accounts on the same browser:

| Key pattern | Purpose | Managed in |
|-------------|---------|------------|
| `cjf_autosave_rules:<userId>` | Auto-save keywords & authors | SavedFeed.jsx, Home.jsx |
| `cjf_dismissed_articles:<userId>` | Articles user explicitly unsaved (auto-save block-list) | dismissedArticles.js |
| `cjf_has_journals_hint:<userId>` | Boolean cache of "user has followed journals?" — used to render Welcome instantly on refresh | Home.jsx |
| `seenArticles:<userId>` | Read/unread article history | ArticleCard.jsx, Home.jsx |
| `cjf_feed_filters:<userId>` | Feed journal filter selection | ArticleFeed.jsx |
| `cjf_search_history:<userId>` | Search bar recent terms (max 10) | ArticleFilters.jsx |
| `cjf_pii_doi_cache` | Elsevier PII → DOI map (immutable; not per-user) | doiResolver.js |
| `darkMode` | Theme preference (per-browser, not per-user — intentional) | useDarkMode.js |

**Never add a new un-namespaced localStorage key for per-user data.** The
legacy un-namespaced `cjf_autosave_rules` and `seenArticles` keys are
purged on mount in SavedFeed.jsx / ArticleCard.jsx — do not reintroduce.

### Supabase tables

Per-user data lives in 4 tables (RLS enforced for all):

| Table | Purpose |
|-------|---------|
| `followed_journals` | Which journals each user follows |
| `saved_articles` | Bookmarked articles |
| `auto_save_rules` | Single row per user — keywords + authors + enabled flag |
| `dismissed_articles` | (user_id, article_id) — articles the user explicitly unsaved; auto-save will never re-add these. Created via the `dismissed-articles` migration documented in the conversation history. |

The `fetch-rss` Edge Function source is in `supabase-edge-function-fetch-rss.ts`
at the project root (deploy via Supabase dashboard → Edge Functions; the file
is not bundled into the React app).

### Categories
Chemistry has 9 subfields. **Catalysis is its own category** — it includes
ACS Catalysis, Catalysis Sci & Tech, EES Catalysis, Catalysis Communications,
J. Catalysis, Catalysts (MDPI), Nature Catalysis, and **Organometallics**
(which belongs in Catalysis, not Inorganic).

---

## Hard rules / gotchas

- **Never add entry animations** (`initial` / `animate` / `exit`) to
  `ArticleCard` or `SavedCard`. They cause a visible "blink" on tab switch
  and on hard refresh. Both components intentionally use
  `initial={false} animate={false}`.
- **Never hand-edit `src/components/ui/`** — those are shadcn primitives.
  Regenerate instead. Exception: `Tooltip.jsx` and `ToggleSwitch.jsx` are
  custom (non-shadcn) components that live in `ui/` for convenience.
- **`vercel.json` is required.** It contains the SPA rewrite that lets
  `/Settings`, `/Guide`, etc. survive a browser refresh. Don't delete it.
- **Supabase RLS matters for the Admin dashboard.** Cross-user reads need
  RLS policies enabled on `followed_journals` and `saved_articles`;
  otherwise the dashboard shows only the current user's data.
- **Never commit `.env*` or Supabase service-role keys.** The *publishable*
  key in `supabaseClient.js` is safe to commit; the service-role key is not.
- **Caches:** React Query `staleTime` = 5 min globally. Feed cache ≈ 20 min.
  A "refresh reminder" banner appears after 90 min.
- **URL-based filters:** the Feed stores its search term and journal
  selection in the URL so that refresh, bookmark, and browser back/forward
  all work. Preserve this behavior when touching feed filters.
- **JSX `&&` with numeric values** — never write `{count && <X/>}` or
  `{dataUpdatedAt && <X/>}`. When the value is `0` (a falsy number), JSX
  renders the literal `"0"` as a text node. Always use an explicit
  comparison: `{count > 0 && <X/>}`, `{dataUpdatedAt > 0 && <X/>}`. We
  hit this with React Query's `dataUpdatedAt` (which defaults to `0`).
- **Auto-save guarantees** — once a user unsaves an article, auto-save
  rules must never re-add it. Every unsave path (ArticleCard, SavedFeed
  single, SavedFeed bulk, RecommendedFeed) calls `dismissArticle()` /
  `dismissArticles()`. `useAutoSave.js` filters candidates against the
  Supabase-synced dismissed set right before each `create()`.
- **CrossRef API for Elsevier DOIs** — Elsevier RSS feeds contain a PII
  (`/pii/S...`) but no DOI. `ArticleCard` calls `resolveDoiFromPii()`
  which queries `api.crossref.org` and caches the mapping forever in
  localStorage (`cjf_pii_doi_cache`). The resolved DOI flows through to
  the visible DOI row, the Share→RIS download, and the ReadCube marker.
- **Welcome screen on refresh** — `Home.jsx` writes
  `cjf_has_journals_hint:<userId>` on every successful followed-journals
  load. On the next page load, `ArticleFeed` reads it synchronously
  (before Supabase responds) to decide between the Welcome screen and
  skeleton cards. Don't break this hint mechanism — it eliminates the
  ~1s "Latest Articles" flash that returning users used to see.
- **Never force-push `main`.**

---

## Commit & deploy

- **Commit messages:** short imperative subject, no emoji, optional body.
- **Branch:** `main`. Vercel auto-deploys on every push.
- **Pre-commit:** `npm run lint && npm run typecheck`. Note: `typecheck`
  has pre-existing errors in `Settings.jsx` (Supabase return types aren't
  inferrable in `.jsx`) — these are known and accepted. Verify that your
  changes don't introduce *new* errors beyond that baseline.
- **Deploy target:** https://literature-tracker.com (Vercel).
