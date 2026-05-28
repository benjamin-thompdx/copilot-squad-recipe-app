import type { MouseEvent } from 'react';
import styles from './FavoriteButton.module.css';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: (e: MouseEvent) => void;
  recipeName?: string;
}

export function FavoriteButton({
  isFavorite,
  onClick,
  recipeName,
}: FavoriteButtonProps) {
  return (
    <button
      type='button'
      className={`${styles.btn} ${isFavorite ? styles.active : ''}`}
      onClick={onClick}
      aria-label={
        isFavorite
          ? `Remove ${recipeName ?? 'recipe'} from favorites`
          : `Add ${recipeName ?? 'recipe'} to favorites`
      }
      aria-pressed={isFavorite}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? '❤️' : '🤍'}
    </button>
  );
}

export default FavoriteButton;
