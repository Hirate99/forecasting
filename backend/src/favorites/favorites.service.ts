import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

import type {
  TFavoriteLocation,
  TFavoriteLocationUpdation,
} from './favorites.dto';

const favoriteQuerySelector: Prisma.FavoriteLocationFindManyArgs = {
  select: {
    city: true,
    state: true,
  },
  where: {
    favorite: true,
  },
  orderBy: {
    updatedAt: 'asc',
  },
};

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async getFavorites(): Promise<TFavoriteLocation[]> {
    return await this.prisma.favoriteLocation.findMany(favoriteQuerySelector);
  }

  async updateFavorites({
    city,
    state,
    favorite,
  }: TFavoriteLocationUpdation): Promise<TFavoriteLocation[]> {
    return await this.prisma.$transaction(async (tx) => {
      await tx.favoriteLocation.upsert({
        where: {
          city_state: {
            city,
            state,
          },
        },
        update: {
          favorite,
        },
        create: {
          city,
          state,
          favorite,
        },
      });

      return await tx.favoriteLocation.findMany(favoriteQuerySelector);
    });
  }
}
