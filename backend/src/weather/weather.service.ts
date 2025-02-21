import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import type { IForecast, IForecastQuery, TIForcastTimeline } from './dto';

const ForecastFields = [
  'temperature',
  'temperatureApparent',
  'temperatureMin',
  'temperatureMax',
  'windSpeed',
  'windDirection',
  'humidity',
  'pressureSeaLevel',
  'uvIndex',
  'weatherCode',
  'precipitationProbability',
  'precipitationType',
  'sunriseTime',
  'sunsetTime',
  'visibility',
  'moonPhase',
  'cloudCover',
] as const;

@Injectable()
export class WeatherService {
  constructor(private readonly httpService: HttpService) {}

  async getWeatherForcast(query: IForecastQuery): Promise<IForecast> {
    const timelines = await this.httpService.axiosRef.request<{
      data: {
        timelines: [TIForcastTimeline];
      };
    }>({
      url: 'https://api.tomorrow.io/v4/timelines',
      method: 'POST',
      params: {
        apikey: process.env.TOMORROW_IO_API_KEY,
      },
      data: {
        location: `${query.lat}, ${query.lon}`,
        timezone: 'America/Los_Angeles',
        timesteps: ['current', '1h', '1d'],
        fields: ForecastFields,
        startTime: 'now',
        endTime: 'nowPlus5d',
        units: 'imperial',
      },
    });

    const { daily, hourly, current } = timelines.data.data.timelines.reduce<
      Partial<Record<'hourly' | 'daily' | 'current', TIForcastTimeline>>
    >((prev, curr) => {
      const timesteps = {
        '1h': 'hourly',
        '1d': 'daily',
        current: 'current',
      };

      return {
        ...prev,
        [timesteps[curr.timestep]]: curr,
      };
    }, {});

    const { lat, lon } = query;

    return {
      forecast: {
        timelines: {
          daily,
          hourly,
        },
      },
      realtime: current,
      location: {
        lat,
        lon,
      },
    };
  }
}
