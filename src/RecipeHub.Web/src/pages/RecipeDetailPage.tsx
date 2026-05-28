import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, DifficultyBadge } from '../components/ui';
import { ShareButton } from '../components/recipe';
import {
  useDeleteRecipe,
  useFavorites,
  usePageTitle,
  useRecipe,
  useToggleFavorite,
} from '../hooks';
import { RecipeDetailSkeleton } from './RecipeDetailSkeleton';
import styles from './RecipeDetailPage.module.css';

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number.parseInt(id, 10) : undefined;
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useRecipe(numericId);
  const deleteMutation = useDeleteRecipe();
  const { data: favData } = useFavorites();
  const { add, remove } = useToggleFavorite();
  const isFav = favData?.some((f) => f.id === numericId) ?? false;
  usePageTitle(data?.title ?? 'Recipe');

  if (isLoading) {
    return <RecipeDetailSkeleton />;
  }

  if (isError || !data || numericId === undefined) {
    return (
      <div className={styles.error} role='alert' aria-live='assertive'>
        Couldn't load recipe. {error instanceof Error ? error.message : ''}
      </div>
    );
  }

  const handleDelete = () => {
    if (!window.confirm(`Delete "${data.title}"? This cannot be undone.`)) {
      return;
    }
    deleteMutation.mutate(numericId, {
      onSuccess: () => navigate('/recipes'),
    });
  };

  const sortedSteps = [...data.steps].sort(
    (a, b) => a.stepNumber - b.stepNumber,
  );

  return (
    <article aria-labelledby='recipe-title'>
      <header className={styles.header}>
        <h1 id='recipe-title' className={styles.title}>
          {data.title}
        </h1>
        <div className={styles.meta}>
          <DifficultyBadge difficulty={data.difficulty} />
          <span>Prep {data.prepTimeMinutes}m</span>
          <span>Cook {data.cookTimeMinutes}m</span>
          <span>Serves {data.servings}</span>
        </div>
        <div className={styles.tags}>
          {data.tagNames.map((t) => (
            <Badge key={t} variant='info'>
              {t}
            </Badge>
          ))}
        </div>
      </header>

      {data.description ? (
        <p className={styles.description}>{data.description}</p>
      ) : null}

      {data.imageUrl ? (
        <img
          src={data.imageUrl}
          alt={data.title}
          className={styles.image}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : null}

      {data.ingredients && data.ingredients.length > 0 ? (
        <section>
          <h2>Ingredients</h2>
          <ul className={styles.ingredients}>
            {[...data.ingredients]
              .sort((a, b) => a.order - b.order)
              .map((ing) => (
                <li key={ing.order} className={styles.ingredient}>
                  {ing.amount ? (
                    <span className={styles.amount}>
                      {ing.amount}
                      {ing.unit ? ` ${ing.unit}` : ''}
                    </span>
                  ) : null}
                  <span className={styles.ingName}>{ing.name}</span>
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2>Steps</h2>
        <ol className={styles.steps}>
          {sortedSteps.map((s) => (
            <li key={s.stepNumber} className={styles.step}>
              {s.instruction}
              {s.timerMinutes != null ? (
                <span className={styles.timer}>({s.timerMinutes} min)</span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.actions}>
        <Button
          variant='ghost'
          onClick={() =>
            isFav ? remove.mutate(numericId!) : add.mutate(numericId!)
          }
        >
          {isFav ? '♥ Unfavorite' : '♡ Favorite'}
        </Button>
        <Link to={`/recipes/${numericId}/edit`}>
          <Button variant='primary'>Edit</Button>
        </Link>
        <Link to={`/recipes/${numericId}/cook`}>
          <Button variant='secondary'>Cook Mode</Button>
        </Link>
        <ShareButton recipeId={numericId} />
        <Button
          variant='danger'
          onClick={handleDelete}
          loading={deleteMutation.isPending}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}

export default RecipeDetailPage;
