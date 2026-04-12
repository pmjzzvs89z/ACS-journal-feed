# Literature Tracker

React + Vite + Supabase PWA for following scientific journal RSS feeds across
Chemistry, Engineering, and Materials Science. Deployed on Vercel at
**https://literature-tracker.app**.

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
npm run preview    # preview production build
```

Run `npm run lint && npm run typecheck` before committing.

---

## Repo layout

```
src/
  api/
    supabaseClient.js       Supabase client (publishable key, safe to commit)
    entities.js             CRUD: FollowedJournal, SavedArticle, JournalScope, Admin
  components/
    articles/               ArticleFeed, ArticleCard, SavedFeed, RecommendedFeed,
                            AutoSaveRules, ArticleFilters, ExportModal, ShareButton,
                            AuthorRenderer
    auth/                   LoginPage, ConfirmPage
    journals/               JournalList (the data source), JournalSelector,
                            JournalSearch, AddCustomJournal
    ui/                     shadcn/ui primitives — DO NOT HAND-EDIT
  hooks/
    useDarkMode.js          Dark-mode toggle, localStorage-backed
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
    fetchRss.js             RSS fetch with timeout + Supabase proxy fallback
  pages.config.js           Auto-generated page → route map
index.html                  Contains pre-paint theme bootstrap script
vercel.json                 SPA rewrite rule — required for deep-link refresh
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
- **Publisher colors / dropdown grouping** →
  `src/components/articles/ArticleFeed.jsx`
  (`PUBLISHER_COLORS`, `PUBLISHER_ID_MAP`, `publisherColorForJournalId`,
  `PUBLISHER_ORDER`)
- **Supabase CRUD** → `src/api/entities.js`
- **Auth state** → `src/lib/AuthContext.jsx` (`useAuth()`)
- **RSS fetching** → `src/utils/fetchRss.js`
- **Article metadata helpers** (extractAbstract, extractImage, etc.) →
  `src/utils/articleMeta.js`
- **Seen/unread article tracking** → `src/utils/seenArticles.js`
- **Auto-save rule matching** → `src/utils/articleMatch.js`
- **Auto-save hook** → `src/hooks/useAutoSave.js`
- **Dark-mode toggle** → `src/hooks/useDarkMode.js`

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

### Publisher colors (used in Feed journal dropdown)

| Publisher          | Hex        | Tailwind        |
|--------------------|------------|-----------------|
| ACS                | `#60a5fa`  | blue-400        |
| RSC                | `#e879f9`  | fuchsia-400     |
| Wiley              | `#a3e635`  | lime-400        |
| Elsevier           | `#ff6c00`  | orange          |
| MDPI               | `#22d3ee`  | cyan-400        |
| Springer Nature    | `#10b981`  | emerald-500     |
| Taylor & Francis   | `#eab308`  | yellow-500      |
| AAAS               | `#ec4899`  | pink-500        |
| ASME/IChemE/IOP    | `#64748b`  | slate-500       |

**Dropdown order** (grouped, not alphabetical):
ACS → Elsevier → RSC → Wiley → MDPI → Springer → Taylor → AAAS → ASME →
IChemE → IOP → Other, with thin gray separators between groups.

### Typography & layout
- Journal names render **inline** as `<abbrev> (<full name>)`, with the full
  name at 80% opacity (`text-muted-foreground/80`).
- Settings and Guide content cards are **max-width 620 px**, centered, and
  responsive on mobile (`maxWidth: '620px'` + `w-full`).
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
| `seenArticles:<userId>` | Read/unread article history | ArticleCard.jsx, Home.jsx |
| `darkMode` | Theme preference (per-browser, not per-user — intentional) | useDarkMode.js |

**Never add a new un-namespaced localStorage key for per-user data.** The
legacy un-namespaced `cjf_autosave_rules` and `seenArticles` keys are
purged on mount in SavedFeed.jsx / ArticleCard.jsx — do not reintroduce.

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
  A "refresh reminder" banner appears after 30 min.
- **URL-based filters:** the Feed stores its search term and journal
  selection in the URL so that refresh, bookmark, and browser back/forward
  all work. Preserve this behavior when touching feed filters.
- **Never force-push `main`.**

---

## Commit & deploy

- **Commit messages:** short imperative subject, no emoji, optional body.
- **Branch:** `main`. Vercel auto-deploys on every push.
- **Pre-commit:** `npm run lint && npm run typecheck`. Note: `typecheck`
  has pre-existing errors in `Settings.jsx` (Supabase return types aren't
  inferrable in `.jsx`) — these are known and accepted. Verify that your
  changes don't introduce *new* errors beyond that baseline.
- **Deploy target:** https://literature-tracker.app (Vercel).
