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
