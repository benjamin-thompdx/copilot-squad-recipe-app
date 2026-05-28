import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Card,
  DifficultyBadge,
  FavoriteButton,
  SkeletonCard,
} from '../components/ui';
import { FilterPanel, SearchBar } from '../components/search';
import {
  useFavoritesActions,
  usePageTitle,
  useRecipes,
  useSearch,
} from '../hooks';
import type { Recipe } from '../api';
import styles from './RecipeListPage.module.css';

const SKELETON_COUNT = 6;

export function RecipeListPage() {
  usePageTitle('Recipes');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | undefined>(undefined);

  const hasFilters = query.trim().length > 0 || tag !== undefined;
  const allRecipes = useRecipes();
  const searchResults = useSearch({ q: query, tag });

  const active = hasFilters ? searchResults : allRecipes;
  const recipes: Recipe[] = active.data ?? [];
  const { toggle, isFavorite } = useFavoritesActions();

  return (
    <div>
      <div className={styles.header}>
        <h1>Recipes</h1>
        <SearchBar value={query} onChange={setQuery} />
      </div>
      <FilterPanel selectedTag={tag} onTagChange={setTag} />

      {active.isLoading ? (
        <div
          className={styles.grid}
          role='status'
          aria-label='Loading recipes…'
        >
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : active.isError ? (
        <div className={styles.errorState} role='alert' aria-live='assertive'>
          <span className={styles.errorIcon} aria-hidden='true'>
            ⚠️
          </span>
          <p className={styles.errorTitle}>Couldn't load recipes</p>
          <p className={styles.errorDetail}>
            {active.error instanceof Error
              ? active.error.message
              : 'An unexpected error occurred.'}
          </p>
          <button
            className={styles.retryButton}
            onClick={() => active.refetch()}
          >
            Try again
          </button>
        </div>
      ) : recipes.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden='true'>
            {hasFilters ? '🔍' : '🍽️'}
          </span>
          <p className={styles.emptyTitle}>
            {hasFilters ? 'No recipes match your filters' : 'No recipes yet'}
          </p>
          <p className={styles.emptyDetail}>
            {hasFilters
              ? 'Try adjusting your search or clearing the filters.'
              : 'Add your first recipe to get started.'}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {recipes.map((r, i) => (
            <Card
              key={r.id}
              title={r.title}
              image={r.imageUrl ?? undefined}
              imageAlt={r.title}
              onClick={() => navigate(`/recipes/${r.id}`)}
              className={styles.recipeCard}
              style={
                {
                  animationDelay: `${Math.min(i * 40, 400)}ms`,
                } as React.CSSProperties
              }
              footer={
                <FavoriteButton
                  isFavorite={isFavorite(r.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(r.id);
                  }}
                  recipeName={r.title}
                />
              }
            >
              <p className={styles.description}>
                {r.description ?? 'No description.'}
              </p>
              <div className={styles.tags}>
                {r.tagNames.map((t) => (
                  <Badge key={t} variant='info'>
                    {t}
                  </Badge>
                ))}
              </div>
              <div className={styles.meta}>
                <DifficultyBadge difficulty={r.difficulty} />
                <span>
                  Prep {r.prepTimeMinutes}m · Cook {r.cookTimeMinutes}m
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecipeListPage;
