import { useNavigate } from 'react-router-dom';
import { Card, SkeletonCard } from '../components/ui';
import { useFavorites, usePageTitle, useToggleFavorite } from '../hooks';
import styles from './FavoritesPage.module.css';

const SKELETON_COUNT = 3;

export function FavoritesPage() {
  usePageTitle('Favorites');
  const navigate = useNavigate();
  const { data, isLoading, isError } = useFavorites();
  const { remove } = useToggleFavorite();

  if (isLoading) {
    return (
      <div>
        <h1>Favorites</h1>
        <div
          className={styles.grid}
          role='status'
          aria-label='Loading favorites…'
        >
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Favorites</h1>
      {isError ? (
        <p className={styles.error}>Couldn't load favorites.</p>
      ) : !data || data.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden='true'>
            🤍
          </span>
          <p className={styles.emptyTitle}>No favorites yet</p>
          <p className={styles.emptyDetail}>
            Heart a recipe from the recipe list or detail page to save it here.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {data.map((r) => (
            <Card
              key={r.id}
              title={r.title}
              image={r.imageUrl ?? undefined}
              imageAlt={r.title}
              onClick={() => navigate(`/recipes/${r.id}`)}
              footer={
                <button
                  className={styles.removeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove.mutate(r.id);
                  }}
                >
                  Remove from favorites
                </button>
              }
            >
              <p className={styles.description}>
                {r.description ?? 'No description.'}
              </p>
              <div className={styles.meta}>
                <span>{r.difficulty}</span>
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

export default FavoritesPage;
