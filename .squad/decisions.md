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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
