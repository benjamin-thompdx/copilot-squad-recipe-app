import { lazy, Suspense } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useTheme } from './hooks';
import { PixelBackground } from './components/ui';
import styles from './App.module.css';
import './App.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const RecipeListPage = lazy(() => import('./pages/RecipeListPage'));
const RecipeDetailPage = lazy(() => import('./pages/RecipeDetailPage'));
const RecipeEditPage = lazy(() => import('./pages/RecipeEditPage'));
const CookModePage = lazy(() => import('./pages/CookModePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const SharedRecipePage = lazy(() => import('./pages/SharedRecipePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  const location = useLocation();
  const hideChrome = location.pathname.startsWith('/shared/');
  const { theme, toggle } = useTheme();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? styles.active : undefined;

  if (hideChrome) {
    return (
      <Suspense
        fallback={
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>
        }
      >
        <Routes>
          <Route path='/shared/:token' element={<SharedRecipePage />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className={styles.app}>
      <PixelBackground />
      <nav className={styles.nav} aria-label='Main navigation'>
        <NavLink to='/' className={styles.brand}>
          RecipeHub
        </NavLink>
        <NavLink to='/' end className={navLinkClass}>
          Home
        </NavLink>
        <NavLink to='/recipes' className={navLinkClass}>
          Recipes
        </NavLink>
        <NavLink to='/favorites' className={navLinkClass}>
          Favorites
        </NavLink>
        <button
          className={styles.themeToggle}
          onClick={toggle}
          aria-label={
            theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
          }
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>
      <main>
        <Suspense
          fallback={
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>
          }
        >
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/recipes' element={<RecipeListPage />} />
            <Route path='/recipes/new' element={<RecipeEditPage />} />
            <Route path='/recipes/:id' element={<RecipeDetailPage />} />
            <Route path='/recipes/:id/edit' element={<RecipeEditPage />} />
            <Route path='/recipes/:id/cook' element={<CookModePage />} />
            <Route path='/favorites' element={<FavoritesPage />} />
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
