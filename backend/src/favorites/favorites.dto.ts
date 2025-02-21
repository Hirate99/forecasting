import { type FavoriteLocation } from '@prisma/client';

type TTimestamps = 'updatedAt' | 'createdAt';

export type TFavoriteLocation = Omit<
  FavoriteLocation,
  'id' | 'favorite' | TTimestamps
>;

export type TFavoriteLocationUpdation = Partial<
  TFavoriteLocation & {
    favorite: boolean;
  }
>;
