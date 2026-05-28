import {
  memo,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import styles from './Card.module.css';

export type CardProps = {
  title?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  image?: string;
  imageAlt?: string;
  /** Accessible label for clickable cards (role="button"). Falls back to title text. */
  'aria-label'?: string;
  style?: CSSProperties;
};

export const Card = memo(function Card({
  title,
  footer,
  onClick,
  children,
  className,
  image,
  imageAlt,
  style,
  'aria-label': ariaLabel,
}: CardProps) {
  const clickable = typeof onClick === 'function';

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!clickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const classes = [styles.card, clickable ? styles.clickable : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      style={style}
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={
        clickable
          ? (ariaLabel ?? (typeof title === 'string' ? title : undefined))
          : undefined
      }
    >
      {image ? (
        <div className={styles.imageWrap}>
          <img
            src={image}
            alt={imageAlt ?? title?.toString() ?? ''}
            className={styles.image}
            onError={(e) => {
              (
                e.currentTarget as HTMLImageElement
              ).parentElement!.style.display = 'none';
            }}
          />
        </div>
      ) : null}
      {title ? <div className={styles.title}>{title}</div> : null}
      <div className={styles.body}>{children}</div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
});

export default Card;
