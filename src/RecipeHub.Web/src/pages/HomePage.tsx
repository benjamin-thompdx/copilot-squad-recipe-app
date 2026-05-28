import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, DifficultyBadge, Spinner } from '../components/ui';
import { usePageTitle, useRecipes } from '../hooks';
import styles from './HomePage.module.css';

export function HomePage() {
  usePageTitle('Home');
  const navigate = useNavigate();
  const { data, isLoading } = useRecipes();

  const featured = (data ?? []).slice(0, 3);

  return (
    <div>
      <section className={styles.hero}>
        <h1>RecipeHub</h1>
        <p className={styles.tagline}>
          Discover, create, and cook your favorite recipes.
        </p>
        <div className={styles.cta}>
          <Link to='/recipes'>
            <Button variant='primary' size='lg'>
              Browse Recipes
            </Button>
          </Link>
          <Link to='/recipes/new'>
            <Button variant='ghost' size='lg'>
              Add Recipe
            </Button>
          </Link>
        </div>
      </section>

      <section className={styles.featured}>
        <h2>Featured</h2>
        {isLoading ? (
          <Spinner label='Loading featured recipes…' />
        ) : featured.length === 0 ? (
          <p>No recipes yet. Be the first to add one!</p>
        ) : (
          <div className={styles.strip}>
            {featured.map((r) => (
              <Card
                key={r.id}
                title={r.title}
                image={r.imageUrl ?? undefined}
                imageAlt={r.title}
                onClick={() => navigate(`/recipes/${r.id}`)}
              >
                <p>{r.description ?? 'No description.'}</p>
                <div className={styles.meta}>
                  <DifficultyBadge difficulty={r.difficulty} />
                  <span>{r.prepTimeMinutes + r.cookTimeMinutes} min total</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
