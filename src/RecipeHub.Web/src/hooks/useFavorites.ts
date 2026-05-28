import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

const FAVORITES_KEY = ['favorites'] as const;

export function useFavorites() {
  return useQuery({
    queryKey: FAVORITES_KEY,
    queryFn: () => apiClient.listFavorites(),
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  const add = useMutation({
    mutationFn: (recipeId: number) => apiClient.addFavorite(recipeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: FAVORITES_KEY }),
  });
  const remove = useMutation({
    mutationFn: (recipeId: number) => apiClient.removeFavorite(recipeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: FAVORITES_KEY }),
  });
  return { add, remove };
}

/** Composite hook: provides `isFavorite(id)` and `toggle(id)` helpers. */
export function useFavoritesActions() {
  const { data: favorites = [] } = useFavorites();
  const { add, remove } = useToggleFavorite();

  const favoriteIds = new Set(favorites.map((f) => f.id));

  const isFavorite = (id: number) => favoriteIds.has(id);

  const toggle = (id: number) => {
    if (isFavorite(id)) {
      remove.mutate(id);
    } else {
      add.mutate(id);
    }
  };

  return { isFavorite, toggle };
}
