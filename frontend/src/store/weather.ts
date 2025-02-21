import { type IForecast } from 'backend';
import { BaseStore } from './base-store';
import { type IWeatherLocationInput } from '@/components/weather-form';
import { useMemo } from 'react';

export interface IWeatherStoreInfo {
  weather?: IForecast;
  progress?: number;
  error?: boolean;
  location?: IWeatherLocationInput & {
    loc: string;
    lat: number;
    lon: number;
  };
}

export class WeatherStore extends BaseStore<
  'info' | 'update' | 'clear',
  {
    info: IWeatherStoreInfo;
    update: IWeatherStoreInfo;
    clear: void;
  }
> {
  private weatherInfo: IWeatherStoreInfo = {};

  constructor() {
    super();

    this.on('update', (info) => {
      if (info.progress === 0) {
        this.weatherInfo = {
          ...info,
        };
      } else {
        this.weatherInfo = {
          ...this.weatherInfo,
          ...info,
        };
      }

      this.emit('info', this.weatherInfo);
    });

    this.on('clear', () => {
      this.weatherInfo = {};
      this.emit('info', this.weatherInfo);
    });
  }
}

export const weatherStore = new WeatherStore();

export function useWeatherStore() {
  return useMemo(() => weatherStore, []);
}
