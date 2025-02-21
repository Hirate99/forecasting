import { useMemo } from 'react';

import type { TFavoriteLocation } from 'backend';
import { BaseStore } from './base-store';
import { fetchFavoriteCities } from '@/services/favorites';

export class FavoriteStore extends BaseStore<
  'info' | 'update',
  { info: TFavoriteLocation[]; update: TFavoriteLocation[] }
> {
  private favorites: TFavoriteLocation[] = [];

  constructor() {
    super();

    fetchFavoriteCities().then((cities) => {
      this.favorites = cities ?? [];
      this.emit('info', this.favorites);
    });

    this.on('update', (updation) => {
      this.favorites = updation;
      this.emit('info', this.favorites);
    });
  }

  isFavorite({ city, state }: Partial<{ city: string; state: string }>) {
    return !!this.favorites.find(
      (value) => value.city === city && value.state === state,
    );
  }

  getFavorites() {
    return this.favorites;
  }
}

export const favoriteStore = new FavoriteStore();

export function useFavoriteStore() {
  return useMemo(() => favoriteStore, []);
}
