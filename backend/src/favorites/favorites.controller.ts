import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';

import type {
  TFavoriteLocationUpdation,
  TFavoriteLocation,
} from './favorites.dto';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(): Promise<TFavoriteLocation[]> {
    return await this.favoritesService.getFavorites();
  }

  @Post()
  async updateFavorite(@Body() updation: TFavoriteLocationUpdation) {
    if (!updation.city || !updation.state) {
      throw new HttpException('Invalid Arguments', HttpStatus.BAD_REQUEST);
    }

    return await this.favoritesService.updateFavorites(updation);
  }
}
