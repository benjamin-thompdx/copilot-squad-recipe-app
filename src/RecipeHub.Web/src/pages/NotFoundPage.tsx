import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { usePageTitle } from '../hooks';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  usePageTitle('Not Found');
  return (
    <div className={styles.wrapper}>
      <span className={styles.code}>404</span>
      <h1 className={styles.heading}>Page not found</h1>
      <p className={styles.detail}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to='/'>
        <Button variant='primary'>Go home</Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
