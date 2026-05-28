import { memo } from 'react';
import styles from './SkeletonCard.module.css';

export type SkeletonCardProps = {
  className?: string;
};

export const SkeletonCard = memo(function SkeletonCard({
  className,
}: SkeletonCardProps) {
  const classes = [styles.skeleton, className].filter(Boolean).join(' ');

  return (
    <div className={classes} aria-hidden='true'>
      <div className={`${styles.shimmer} ${styles.title}`} />
      <div className={`${styles.shimmer} ${styles.line}`} />
      <div className={`${styles.shimmer} ${styles.lineShort}`} />
      <div className={styles.tags}>
        <div className={`${styles.shimmer} ${styles.tag}`} />
        <div className={`${styles.shimmer} ${styles.tag}`} />
      </div>
      <div className={styles.meta}>
        <div className={`${styles.shimmer} ${styles.metaItem}`} />
        <div
          className={`${styles.shimmer} ${styles.metaItem}`}
          style={{ width: '6rem' }}
        />
      </div>
    </div>
  );
});

export default SkeletonCard;
