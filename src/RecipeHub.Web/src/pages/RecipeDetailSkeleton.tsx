import styles from './RecipeDetailSkeleton.module.css';

export function RecipeDetailSkeleton() {
  return (
    <article className={styles.skeleton}>
      {/* Title */}
      <div className={styles.titleBar} />
      {/* Meta row */}
      <div className={styles.metaRow}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={styles.metaChip} />
        ))}
      </div>
      {/* Image */}
      <div className={styles.imageBlock} />
      {/* Steps heading */}
      <div className={styles.sectionHead} />
      {/* Step rows */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className={styles.stepLine} />
      ))}
    </article>
  );
}
