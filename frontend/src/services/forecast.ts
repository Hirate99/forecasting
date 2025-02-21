import { catchError, from, of, switchMap, tap } from 'rxjs';

import type { IForecast } from 'backend';

import { geocodingApi } from '@/apis/gmap';
import { IWeatherLocationInput } from '@/components/weather-form';
import { weatherStore } from '@/store/weather';

import { request } from '@/utils/request';
import { STATES } from '@/utils/const';

import { env } from '@/env';

async function getGeocoding({
  street = '',
  city = '',
  state = '',
}: IWeatherLocationInput) {
  const joinAddress = (address: string) => address.split(' ').join('+');
  if (!Object.values(STATES).includes(state)) {
    throw new Error('Invalid State Input');
  }

  const coder = new (await geocodingApi).Geocoder();
  const code = await coder.geocode({
    address: `${joinAddress(street)},+${joinAddress(city)},+${joinAddress(state)}`,
    language: 'en-US',
  });

  const stateName = Object.entries(STATES).find(
    (entry) => entry[1] === state,
  )?.[0];

  return {
    ...(code.results.shift()?.geometry.location.toJSON() ?? {}),
    loc: `${city ? `${city}, ` : ''}${stateName}`,
    city,
    state: stateName,
    street,
  };
}

async function getIpinfo() {
  const ipInfo = await request<{
    loc: string;
    city: string;
    country: string;
    region: string;
  }>({
    url: 'https://ipinfo.io/',
    params: {
      token: env.IP_INFO_API_KEY,
    },
  });

  if (!ipInfo) {
    throw new Error('Invalid Ip Info');
  }

  const { loc, city, region } = ipInfo;

  const coordinates = loc.split(',').map((l) => parseFloat(l));
  return {
    lat: coordinates.at(0),
    lon: coordinates.at(1),
    loc: `${city}, ${region}`,
    street: '',
    city,
    state: region,
  };
}

async function getForecast(location: {
  lat?: number;
  lon?: number;
  lng?: number;
  loc?: string;
  street?: string;
  city?: string;
  state?: string;
}) {
  const lat = location.lat ?? '';
  const lon = location.lon ?? location.lng ?? '';

  const forecast = await request<IForecast>({
    url: '/api/weather/forecast',
    params: {
      lat,
      lon,
    },
  });

  return {
    forecast,
    location: {
      loc: location.loc ?? '',
      street: location.street ?? '',
      city: location.city ?? '',
      state: location.state ?? '',
      lat: lat as number,
      lon: lon as number,
    },
  };
}

export function forecast(
  location: IWeatherLocationInput,
  autoDetect = false,
  onProgress?: (progress: number) => void,
) {
  return of(autoDetect).pipe(
    tap(() => onProgress?.(0)),
    switchMap((autoDetect) =>
      autoDetect ? from(getIpinfo()) : from(getGeocoding(location)),
    ),
    tap(() => onProgress?.(50)),
    switchMap((value) => getForecast(value)),
    tap(() => onProgress?.(100)),
  );
}

export function triggerForecast({
  location,
  autoDetect,
}: {
  location: IWeatherLocationInput;
  autoDetect?: boolean;
}) {
  forecast(location, autoDetect, (progress) => {
    weatherStore.emit('update', { progress });
  })
    .pipe(
      catchError((err) => {
        console.error(err);
        return of(undefined);
      }),
    )
    .subscribe((weather) => {
      weatherStore.emit('update', {
        weather: weather?.forecast,
        location: weather?.location,
        error: !weather?.forecast,
      });
    });
}
