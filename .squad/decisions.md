# Squad Decisions

## Active Decisions

### 2025-07-14: Performance optimizations applied
**By:** Gromit (Frontend Dev)
**What:**
- `App.tsx`: Replaced all eager page imports with `React.lazy` + `Suspense` (two boundaries: one for the shared-recipe chrome-free route, one wrapping the main `<Routes>`). Pages now load as separate chunks on demand.
- `components/ui/Card.tsx`: Wrapped with `React.memo` to prevent re-renders when parent re-renders but props haven't changed.
- `components/ui/SkeletonCard.tsx`: Wrapped with `React.memo` — pure stateless component, safe to memoize.
- `components/ui/Badge.tsx`: Wrapped with `React.memo` — pure stateless component, safe to memoize.
- `RecipeListPage.tsx`: Audited — no additional changes needed. Inline `style` objects per-card are acceptable; React Query caches both `useRecipes` and `useSearch` results.

**Why:** Code splitting reduces initial bundle size — each page is only downloaded when the user navigates to it. `React.memo` on Card/SkeletonCard/Badge prevents unnecessary re-renders when list data is stable, reducing work during React reconciliation on the recipe grid.

### 2025-07-14: Favorites feature implemented
**By:** Wallace (Lead Architect)
**What:** Full localStorage-based Favorites feature — replaces the stub FavoritesPage and broken API-backed useFavorites hook

**Files created:**
- `src/RecipeHub.Web/src/components/ui/FavoriteButton.tsx`
- `src/RecipeHub.Web/src/components/ui/FavoriteButton.module.css`

**Files modified:**
- `src/RecipeHub.Web/src/hooks/useFavorites.ts` — replaced broken API-backed implementation with localStorage Set-based hook (toggle, isFavorite)
- `src/RecipeHub.Web/src/hooks/index.ts` — added `useFavorites` export
- `src/RecipeHub.Web/src/components/ui/index.ts` — added `FavoriteButton` export
- `src/RecipeHub.Web/src/pages/FavoritesPage.tsx` — replaced "coming soon" stub with real filtered grid page
- `src/RecipeHub.Web/src/pages/FavoritesPage.module.css` — replaced stub CSS with grid + empty state styles
- `src/RecipeHub.Web/src/pages/RecipeDetailPage.tsx` — added FavoriteButton as first action in the actions row
- `src/RecipeHub.Web/src/pages/RecipeListPage.tsx` — added FavoriteButton in each Card footer with stopPropagation

**Why:** FavoritesPage was a stub pointing at non-existent backend endpoints. This is the highest-value missing feature. localStorage approach avoids any backend changes and survives page refresh.

### 2025-07-14: A11y audit complete
**By:** Wendolene Ramsbottom
**What:** Fixed 18 accessibility issues across the frontend
**Changes:**
- `App.tsx` — Added `aria-label="Main navigation"` to `<nav>`
- `RecipeDetailPage.tsx` — Added `role="alert" aria-live="assertive"` to error div; added `id="recipe-title"` to `<h1>` and `aria-labelledby="recipe-title"` to `<article>`
- `RecipeListPage.tsx` — Added `role="alert" aria-live="assertive"` to error state div
- `RecipeEditPage.tsx` — Added `role="alert"` to both validation error `<span>`s; added `role="alert" aria-live="assertive"` to submit error div; added `aria-label` to each step instruction and timer inputs (previously label-less, placeholder-only)
- `CookModePage.tsx` — Added `role="alert" aria-live="assertive"` to both error divs; added `id="cook-mode-heading"` to `<h1>` and `aria-labelledby="cook-mode-heading"` to `<article>`
- `SharedRecipePage.tsx` — Added `role="alert" aria-live="assertive"` to notFound and error divs; added `id="shared-recipe-title"` to `<h1>` and `aria-labelledby="shared-recipe-title"` to `<article>`
- `components/search/FilterPanel.tsx` — Added `role="alert" aria-live="assertive"` to tag-load error div
- `components/ui/Card.tsx` — Added `aria-label` prop to `CardProps` type; wired it through to the `role="button"` div (falls back to string title)
- `components/search/SearchBar.module.css` — Added `:focus-visible` outline to the clear (×) button
**Why:** WCAG 2.1 AA compliance — keyboard accessibility, screen-reader announcement of errors/loading states, labelled landmarks and interactive elements

### 2025-07-14: Visual polish + difficulty badges
**By:** Gromit (Polish run)
**What:** DifficultyBadge component added; visual consistency fixes across CSS modules
**Files created:**
- `src/RecipeHub.Web/src/components/ui/DifficultyBadge.tsx`

**Files modified:**
- `src/RecipeHub.Web/src/components/ui/Badge.tsx` — added `'danger'` to BadgeVariant type
- `src/RecipeHub.Web/src/components/ui/Badge.module.css` — added `.danger` variant style using error tokens
- `src/RecipeHub.Web/src/components/ui/index.ts` — exported DifficultyBadge
- `src/RecipeHub.Web/src/pages/RecipeListPage.tsx` — replaced `<span>{r.difficulty}</span>` with `<DifficultyBadge>`
- `src/RecipeHub.Web/src/pages/RecipeDetailPage.tsx` — replaced `<span>{data.difficulty}</span>` with `<DifficultyBadge>`
- `src/RecipeHub.Web/src/pages/HomePage.tsx` — refactored `.meta` to use `<DifficultyBadge>` + time span
- `src/RecipeHub.Web/src/pages/HomePage.module.css` — `.cta` flex-wrap added; `.meta` converted to flex row
- `src/RecipeHub.Web/src/pages/RecipeDetailPage.module.css` — `.error` styled as error card; `.step` padding added; `.timer` styled as inline badge
- `src/RecipeHub.Web/src/App.module.css` — max-width bumped to 1200px; `.nav` made sticky with background-color
- `src/RecipeHub.Web/src/pages/RecipeEditPage.module.css` — form input border-radius unified to 6px
- `src/RecipeHub.Web/src/components/ui/Spinner.module.css` — replaced hardcoded hex colors with `--color-border` and `--color-primary` tokens
- `src/RecipeHub.Web/src/components/search/SearchBar.module.css` — input border-radius unified to 6px

**Why:** Difficulty field was unstyled text; CSS modules had spacing/style inconsistencies including hardcoded spinner colors, sticky nav missing, error state missing visual card treatment, and border-radius mismatches between form inputs.

### 2026-05-28: Backend improvements — favorites API and ingredients table
**By:** Feathers McGraw (Backend Dev)
**What:** Implemented headless favorites API using X-User-Id header; refactored ingredients from embedded text to first-class table
**Decisions:**
1. **Favorites API via X-User-Id Header** — App has no authentication; frontend generates UUID (stored in localStorage) and passes as `X-User-Id` header. All favorites endpoints read this header, return 400 if missing. Idempotent POST for duplicates.
2. **RecipeIngredient as First-Class Table** — Ingredients moved from `Description` raw text to dedicated `RecipeIngredients` table (Order, Name, Amount?, Unit?) with cascade-delete FK to Recipes.
3. **Ingredients Optional on Create/Update** — `CreateRecipeRequest.Ingredients` and `UpdateRecipeRequest.Ingredients` are nullable. Existing calls without the field continue to work.
4. **RecipeDetailDto Extended** — `RecipeDetailDto` gains `Ingredients` array; `RecipeDto` (used in lists) remains unchanged to avoid breaking frontend.

### 2026-05-28: Frontend improvements — API-backed favorites and UX enhancements
**By:** Gromit (Frontend Dev)
**What:** Switched favorites from localStorage to API-backed; added skeleton loaders, page title hook, ingredients UI, NotFound route, cook mode progress dots
**Decisions:**
1. **Favorites: API-backed with X-User-Id** — Use `GET/POST/DELETE /api/favorites` with `X-User-Id` header (UUID persisted in localStorage). Replaces previous client-only approach.
2. **Skeleton over Spinner in RecipeDetailPage** — Replace `<Spinner>` with `<RecipeDetailSkeleton>` to reduce layout shift and better communicate content structure.
3. **usePageTitle Hook** — Centralize document title management across all pages. Format: `"${title} — RecipeHub"` or `"RecipeHub"` if empty.
4. **Ingredients in Types and Forms** — Added `RecipeIngredient { order, name, amount, unit }` to types and form with grid layout (amount 90px / unit 80px / name flex).
5. **404 Route with NotFoundPage** — Add `<Route path="*" element={<NotFoundPage />} />` using lazy import pattern.
6. **CookMode Step Dots** — Add visual step progress dots above instructions. Active dot uses `--color-primary` with `scale(1.4)`; done dots use `--color-text-muted`.

### 2026-05-28: Test coverage and bug fixes — Wendolene Ramsbottom
**By:** Wendolene Ramsbottom (QA/Testing)
**What:** Created comprehensive test suites for hooks and API endpoints; fixed silent API break in ShareEndpoints
**Files created:**
- `src/RecipeHub.Web/src/hooks/__tests__/useTimer.test.ts` (10 tests, all passing)
- `src/RecipeHub.Web/src/hooks/__tests__/useSearch.test.tsx` (7 tests, all passing)
- `tests/RecipeHub.Api.Tests/RecipeEndpointTests.cs` (7 tests, all passing)

**Bugs fixed:**
- `ShareEndpoints.cs:ToDetailDto` — Missing `.Include(r => r.Ingredients)` in EF query; added mapping to prevent empty ingredients array in shared recipes.

**Observations:**
1. `Results.ValidationProblem` returns HTTP 400 (not 422) in .NET 10 minimal APIs.
2. Running Aspire locks `bin/Debug` binaries; backend tests must use `-c Release` or stop dev server.
3. No new npm packages required; all test utilities already in `devDependencies`.
4. `useTimer` fake timer tests require wrapping both `vi.advanceTimersByTime` and state callbacks in `act()` for determinism.

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
