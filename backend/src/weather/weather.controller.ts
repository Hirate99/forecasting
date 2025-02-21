import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import { IForecast, IForecastReq } from './dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('forecast')
  async getForecast(@Query() query: IForecastReq): Promise<IForecast> {
    const lon = query.lon ?? query.lng;
    const lat = query.lat;
    if (!lon || !lat) {
      throw new HttpException('Missing Args', HttpStatus.BAD_REQUEST);
    }

    return this.weatherService.getWeatherForcast({
      lat,
      lon,
    });
  }
}
