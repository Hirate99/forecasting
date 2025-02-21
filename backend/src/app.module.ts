import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';

import { join } from 'path';

import { WeatherModule } from './weather/weather.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../../', 'frontend', 'dist'),
      renderPath: '/^(?!/api/).*',
    }),
    ConfigModule.forRoot(),
    FavoritesModule,
    WeatherModule,
  ],
})
export class AppModule {}
