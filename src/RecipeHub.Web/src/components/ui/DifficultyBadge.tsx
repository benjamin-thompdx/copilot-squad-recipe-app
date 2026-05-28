import { Badge } from './Badge';
import type { BadgeVariant } from './Badge';

const DIFFICULTY_VARIANT: Record<string, BadgeVariant> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
};

interface DifficultyBadgeProps {
  difficulty: string;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const variant = DIFFICULTY_VARIANT[difficulty] ?? 'default';
  return <Badge variant={variant}>{difficulty}</Badge>;
}

export default DifficultyBadge;
