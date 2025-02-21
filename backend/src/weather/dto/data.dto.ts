export interface TIForcastTimelineInterval {
  startTime: string;
  values: {
    cloudCover: number;
    humidity: number;
    moonPhase: number;
    precipitationProbability: number;
    precipitationType: number;
    pressureSeaLevel: number;
    sunriseTime: string;
    sunsetTime: string;
    temperature: number;
    temperatureApparent: number;
    temperatureMax: number;
    temperatureMin: number;
    uvIndex: number;
    visibility: number;
    weatherCode: number;
    windDirection: number;
    windSpeed: number;
  };
}

export interface TIForcastTimeline {
  endTime: string;
  intervals: TIForcastTimelineInterval[];
  startTime: string;
  timestep: string;
}

export interface IForecastLocation {
  lat: number;
  lon: number;
}

export interface IForecast {
  forecast: {
    timelines: {
      daily: TIForcastTimeline;
      hourly: TIForcastTimeline;
    };
  };
  location: IForecastLocation;
  realtime: TIForcastTimeline;
}
