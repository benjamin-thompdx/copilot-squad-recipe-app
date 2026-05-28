import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSearch } from '../useSearch';
import { apiClient } from '../../api';

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe('useSearch', () => {
  beforeEach(() => {
    vi.spyOn(apiClient, 'searchRecipes').mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does NOT call the API when query is empty and no tag is given', () => {
    renderHook(() => useSearch({ q: '' }), { wrapper: makeWrapper() });
    // enabled=false — queryFn must never fire synchronously
    expect(apiClient.searchRecipes).not.toHaveBeenCalled();
  });

  it('does NOT call the API when query is whitespace-only', () => {
    renderHook(() => useSearch({ q: '   ' }), { wrapper: makeWrapper() });
    expect(apiClient.searchRecipes).not.toHaveBeenCalled();
  });

  it('calls the API when query is non-empty', async () => {
    renderHook(() => useSearch({ q: 'pasta' }), { wrapper: makeWrapper() });
    await vi.waitFor(() => {
      expect(apiClient.searchRecipes).toHaveBeenCalledWith('pasta', undefined);
    });
  });

  it('calls the API when only a tag is provided (empty query)', async () => {
    renderHook(() => useSearch({ q: '', tag: 'Italian' }), {
      wrapper: makeWrapper(),
    });
    await vi.waitFor(() => {
      expect(apiClient.searchRecipes).toHaveBeenCalledWith('', 'Italian');
    });
  });

  it('trims the query before passing it to the API', async () => {
    renderHook(() => useSearch({ q: '  pizza  ' }), { wrapper: makeWrapper() });
    await vi.waitFor(() => {
      expect(apiClient.searchRecipes).toHaveBeenCalledWith('pizza', undefined);
    });
  });

  it('returns isLoading=false when the query is disabled (empty string)', () => {
    const { result } = renderHook(() => useSearch({ q: '' }), {
      wrapper: makeWrapper(),
    });
    // A disabled query is never in loading state
    expect(result.current.isLoading).toBe(false);
  });

  it('returns data from the API mock', async () => {
    const fakeRecipe = {
      id: 1,
      title: 'Spaghetti',
      description: null,
      difficulty: 'Easy' as const,
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      servings: 2,
      imageUrl: null,
      tagNames: ['Italian'],
    };
    vi.spyOn(apiClient, 'searchRecipes').mockResolvedValue([fakeRecipe]);

    const { result } = renderHook(() => useSearch({ q: 'spaghetti' }), {
      wrapper: makeWrapper(),
    });

    await vi.waitFor(() => {
      expect(result.current.data).toEqual([fakeRecipe]);
    });
  });
});
