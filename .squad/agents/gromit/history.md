# Gromit History

- Project: copilot-squad-recipe-app
- User: Benjamin Thom
- Focus: RecipeHub frontend initialization and UI flow
- Current role: Frontend Dev

## Learnings

### 2026-05-28 — Multi-task frontend improvements pass

- **Card style prop**: Added `style?: CSSProperties` to `CardProps` and forwarded it on the root `<div>` to support animation delay in `RecipeListPage`.
- **usePageTitle hook**: Created `hooks/usePageTitle.ts` that sets `document.title = "${title} — RecipeHub"` and restores on cleanup. Wired into all 6 pages.
- **NotFoundPage + 404 route**: Added `NotFoundPage.tsx`/`NotFoundPage.module.css`, exported from `pages/index.ts`, and added `<Route path="*">` to `App.tsx` (which uses lazy imports).
- **RecipeDetailSkeleton**: Replaced `<Spinner>` in `RecipeDetailPage` loading state with a proper shimmer skeleton using `--color-skeleton-base`/`--color-skeleton-highlight` CSS custom properties.
- **CookMode step progress**: Added `<div className={styles.progress}>` with dot indicators above the instruction section. Active dot scales up with `--color-primary`, done dots use `--color-text-muted`. Instruction font size uses `clamp(1.1rem, 2.5vw, 1.35rem)`.
- **Ingredients support**: Added `RecipeIngredient` interface to `api/types.ts`; added `ingredients` to `RecipeDetail` and `CreateRecipeRequest`. Display in `RecipeDetailPage`, editing in `RecipeEditPage` (amount/unit/name grid row per ingredient).
- **Favorites API-backed**: Replaced localStorage-based `useFavorites` with TanStack Query + API (`/api/favorites` with `X-User-Id` header from `localStorage`). Added `getUserId()` to `client.ts`. Added `useToggleFavorite` hook. Updated `FavoritesPage` and `RecipeDetailPage` to use the new API.
- **Existing agent work**: Another session had already added `DifficultyBadge`, `FavoriteButton` UI components and a localStorage-based `useFavorites`. Replaced with API-backed approach as specified.
- **App.tsx uses lazy imports**: The App.tsx already used `React.lazy()` (not direct imports from `./pages`). Had to add `NotFoundPage` as another lazy import.

## Key Learnings

- 2025-07-14: Performance optimization run applied React.lazy code splitting and React.memo memoization. Lesson: Code splitting reduces initial bundle, but only memoize pure stateless components; audit before memoizing to avoid prop-dependency bugs.

- 2025-07-14: Visual polish run delivered DifficultyBadge component, CSS token consistency (replaced hardcoded hex colors), sticky navigation, and unified border-radius. Lesson: Maintain CSS token constants and audit for visual inconsistencies early; hardcoded colors create maintenance debt and inconsistency.
