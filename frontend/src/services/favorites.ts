import type { TFavoriteLocation, TFavoriteLocationUpdation } from 'backend';

import { favoriteStore } from '@/store/favorites';
import { request } from '@/utils/request';

export async function fetchFavoriteCities() {
  return await request<TFavoriteLocation[]>({
    url: '/api/favorites',
  });
}

export async function updateFavoriteCity(updation: TFavoriteLocationUpdation) {
  if (updation.favorite) {
    favoriteStore.emit('update', [
      ...favoriteStore.getFavorites(),
      { city: updation.city ?? '', state: updation.state ?? '' },
    ]);
  } else {
    favoriteStore.emit(
      'update',
      favoriteStore
        .getFavorites()
        .filter(
          (city) =>
            city.city !== updation.city || city.state !== updation.state,
        ),
    );
  }

  request<TFavoriteLocation[]>({
    method: 'POST',
    url: '/api/favorites',
    data: updation,
  }).then((favorites) => {
    favoriteStore.emit('update', favorites ?? []);
  });
}
