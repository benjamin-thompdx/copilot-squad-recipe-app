import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — RecipeHub` : 'RecipeHub';
    return () => {
      document.title = prev;
    };
  }, [title]);
}
