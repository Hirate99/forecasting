import { Loader } from '@googlemaps/js-api-loader';

import { env } from '@/env';

const loader = new Loader({
  apiKey: env.GMAP_API_KEY,
  language: 'en',
});

export const placeApi = loader.importLibrary('places');

export const geocodingApi = loader.importLibrary('geocoding');

export const mapApi = loader.importLibrary('maps');

export const markerApi = loader.importLibrary('marker');
