# Feathers McGraw History

- Project: copilot-squad-recipe-app
- User: Benjamin Thom
- Focus: RecipeHub API and SQLite implementation
- Current role: Backend Dev

## Review 2026-05-28: /api/recipes Endpoint

**Key Risks Identified:**
- Silent tag failure: unknown tags skipped without feedback during create/update
- No pagination on GetAll endpoint (performance risk with large datasets)
- Missing field validation on recipe input (title, times, servings)
- Potential N+1 query inefficiency in summary operations

## Learnings 2026-05-28: Favorites API + Ingredients

**Favorites (Task 1):**
- The `Favorite` model, `DbSet`, EF config, and migration were already shipped in `InitialCreate` — no new migration needed. Only the endpoint implementation was missing.
- Idempotent POST: check for existing record first, return 201 with the existing or new `FavoriteDto`. Avoids UniqueIndex constraint errors.
- `internal static ToSummaryDto` on `RecipeEndpoints` lets FavoriteEndpoints reuse the DTO mapping without duplication.

**Ingredients (Task 2):**
- Seed data previously embedded ingredients as raw text appended to `Description`. Switching to a proper `RecipeIngredients` table required a full rewrite of `SeedData.cs` `BuildRecipe` helper — the helper now accepts `(string Name, string? Amount, string? Unit)[]`.
- Manual migration files (`.cs` + `.Designer.cs` + snapshot) are straightforward to write by following the `InitialCreate` pattern. The `[Migration("timestamp_Name")]` attribute is critical.
- `RecipeIngredientDto[]?` nullable on Create/Update keeps backward compatibility — existing API consumers that omit `ingredients` get an empty list rather than a validation error.
- Stale `recipes.db` must be deleted when schema changes (SQLite doesn't auto-migrate on startup in this setup; `EnsureCreated`+`Migrate` is called at startup via `MigrateAsync`).

