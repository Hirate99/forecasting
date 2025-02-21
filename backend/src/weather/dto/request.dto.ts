export interface IForecastQuery {
  location?: string;
  lat: number;
  lon: number;
  city?: string;
  state?: string;
}

export interface IForecastReq extends Partial<IForecastQuery> {
  lng?: number;
}
