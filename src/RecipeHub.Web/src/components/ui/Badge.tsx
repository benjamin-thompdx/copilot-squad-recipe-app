import { memo, type ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger';

export type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

export const Badge = memo(function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  const classes = [styles.badge, styles[variant], className]
    .filter(Boolean)
    .join(' ');
  return <span className={classes}>{children}</span>;
});

export default Badge;
