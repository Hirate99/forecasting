import { useCallback, useEffect, useRef, useState } from 'react';

import { ChevronRight, ChevronLeft } from '@mui/icons-material';
import clsx from 'clsx';
import dayjs from 'dayjs';
import {
  Alert,
  Button,
  Carousel,
  ProgressBar,
  Tab,
  Table,
  Tabs,
} from 'react-bootstrap';
import { StarFill, TwitterX } from 'react-bootstrap-icons';

import type { TIForcastTimelineInterval, IForecast } from 'backend';

import { mapApi, markerApi } from '@/apis/gmap';

import { IWeatherStoreInfo, useWeatherStore } from '@/store/weather';
import { useFavoriteStore } from '@/store/favorites';
import { updateFavoriteCity } from '@/services/favorites';

import { TempChart } from './weather-charts/temp-chart';
import { Meteogram } from './weather-charts/meteogram';

import { WEATHER_CODES } from '@/utils/const';

const getWeatherInfo = (weatherCode = 0) => {
  const name =
    WEATHER_CODES[weatherCode as unknown as keyof typeof WEATHER_CODES] ?? '';
  return {
    name,
    icon: `/images/weather-symbols/${name.toLowerCase().split(' ').join('_')}.svg`,
  };
};

function WeatherTable({
  weather,
  onSelect,
}: {
  weather: IForecast;
  onSelect?: (info: TIForcastTimelineInterval) => void;
}) {
  return (
    <table className="tw-w-full tw-text-[13px] sm:tw-text-sm" border={0}>
      <thead>
        <tr className="tw-border-[--bs-border-color] tw-border-b-[1px] [&>th]:tw-py-3">
          <th>#</th>
          <th>Date</th>
          <th>Status</th>
          <th>Temp. HIgh{'(°F)'}</th>
          <th>Temp. Low{'(°F)'}</th>
          <th>Wind Speed{'(mph)'}</th>
        </tr>
      </thead>
      <tbody>
        {weather.forecast.timelines.daily.intervals.map((interval, idx) => {
          const info = getWeatherInfo(interval.values.weatherCode);

          return (
            <tr
              key={idx}
              className="tw-border-[--bs-border-color] tw-border-b-[1px] [&>td]:tw-py-2 [&>td]:tw-align-top hover:tw-cursor-pointer"
              onClick={() => {
                onSelect?.(interval);
              }}
            >
              <td className="tw-font-bold tw-min-w-4">{idx + 1}</td>
              <td className="tw-underline">
                <a className="tw-text-blue-700">
                  {dayjs(interval.startTime).format('dddd, MMM. D, YYYY')}
                </a>
              </td>
              <td className="tw-min-w-[96px]">
                <div className="tw-flex tw-items-center tw-gap-x-1">
                  <img
                    className="tw-w-8 tw-h-8"
                    alt={info.name}
                    src={info.icon}
                  />
                  <span>{info.name}</span>
                </div>
              </td>
              <td>{interval.values.temperatureMax}</td>
              <td>{interval.values.temperatureMin}</td>
              <td>{interval.values.windSpeed}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

interface IDetailTab {
  weather: TIForcastTimelineInterval;
  location: {
    lat: number;
    lon: number;
    loc: string;
  };
  onBack?: () => void;
}

function DetailTab({ weather, location, onBack }: IDetailTab) {
  const time = weather.startTime;
  const info = getWeatherInfo(weather.values.weatherCode);

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mapContainer = mapRef.current;
    if (mapContainer) {
      Promise.all([mapApi, markerApi]).then(([gmap, gmarker]) => {
        const position = {
          lat: location.lat,
          lng: location.lon,
        };
        const map = new gmap.Map(mapContainer, {
          mapId: 'bf464c2e1a349152',
          zoom: 16,
          center: position,
        });

        new gmarker.AdvancedMarkerElement({
          position,
          map,
        });
      });
    }
  }, [location.lat, location.lon, weather]);

  return (
    <>
      <div className="tw-flex tw-justify-center tw-self-stretch">
        <Button
          size="sm"
          className="tw-bg-gray-100 tw-flex tw-items-center"
          variant="outline-secondary"
          onClick={() => {
            onBack?.();
          }}
        >
          <ChevronLeft />
          List
        </Button>
        <span className="tw-text-center tw-font-bold tw-text-xl tw-mx-auto tw-whitespace-nowrap">
          {dayjs(time).format('dddd, MMM. D, YYYY')}
        </span>
        <Button
          as="a"
          className="tw-px-2 twitter-share-button"
          variant="outline-secondary"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `The temperature in ${location.loc} on ${dayjs(time).format('dddd, MMM. D, YYYY')} is ${weather.values.temperature}°F and the conditions are ${info.name} #CSCI571WeatherForecast`,
          )}`}
          target="__blank"
        >
          <TwitterX className="tw-text-xl" />
        </Button>
      </div>
      <Table className="tw-w-full tw-my-3 tw-text-sm" striped>
        <thead>
          <tr>
            <th className="tw-w-48 sm:tw-w-72 md:tw-w-80"></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="tw-font-bold">Status</td>
            <td>{info.name}</td>
          </tr>
          <tr>
            <td className="tw-font-bold">Max Temperature</td>
            <td>{`${weather.values.temperatureMax}°F`}</td>
          </tr>
          <tr>
            <td className="tw-font-bold">Min Temperature</td>
            <td>{`${weather.values.temperatureMin}°F`}</td>
          </tr>
          <tr>
            <td className="tw-font-bold">Apparent Temperature</td>
            <td>{`${weather.values.temperatureApparent}°F`}</td>
          </tr>
          <tr>
            <td className="tw-font-bold">Sun Rise Time</td>
            <td>{dayjs(weather.values.sunriseTime).format('ha')}</td>
          </tr>
          <tr>
            <td className="tw-font-bold">Sun Set Time</td>
            <td>{dayjs(weather.values.sunsetTime).format('ha')}</td>
          </tr>
          <tr>
            <td className="tw-font-bold">Humidity</td>
            <td>{`${Math.round(weather.values.humidity)}%`}</td>
          </tr>
          <tr>
            <td className="tw-font-bold">Wind Speed</td>
            <td>{`${Math.round(weather.values.windSpeed)}mph`}</td>
          </tr>
          <tr>
            <td className="tw-font-bold">Visibility</td>
            <td>{`${weather.values.visibility}mi`}</td>
          </tr>
          <tr>
            <td className="tw-font-bold">Cloud Cover</td>
            <td>{`${weather.values.cloudCover}%`}</td>
          </tr>
        </tbody>
      </Table>
      <div ref={mapRef} className="tw-self-stretch tw-h-96" />
    </>
  );
}

interface IWeatherTab {
  width: number;
}

export function WeatherTab({ width }: IWeatherTab) {
  const weatherStore = useWeatherStore();
  const favoriteStore = useFavoriteStore();

  const [weatherInfo, setWeatherInfo] = useState<IWeatherStoreInfo>();

  const [tabKey, setTabKey] = useState('day-view');

  useEffect(() => {
    return weatherStore.on('info', (info) => {
      setTabIndex(0);
      setIsFavorite(favoriteStore.isFavorite(info?.location ?? {}));
      setWeatherInfo(info);
    });
  }, [favoriteStore, weatherStore]);

  const [isFavorite, setIsFavorite] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    return favoriteStore.on('info', () => {
      setIsFavorite(favoriteStore.isFavorite(weatherInfo?.location ?? {}));
    });
  }, [favoriteStore, weatherInfo]);

  const [currentWeatherInfo, setCurrentWeatherInfo] =
    useState<TIForcastTimelineInterval>();

  const displayDetailTab = useCallback(
    (info?: TIForcastTimelineInterval) => {
      if (!info && !currentWeatherInfo) {
        const current =
          weatherInfo?.weather?.forecast.timelines.daily.intervals.at(0);
        if (current) {
          setCurrentWeatherInfo(current);
        }
      } else if (info) {
        setCurrentWeatherInfo(info);
      }
      setTabIndex(1);
    },
    [
      currentWeatherInfo,
      weatherInfo?.weather?.forecast.timelines.daily.intervals,
    ],
  );

  const renderChartTab = useCallback(() => {
    if (weatherInfo?.error) {
      return (
        <Alert className="tw-w-full" variant="danger">
          An error occured. Please try again later.
        </Alert>
      );
    } else if (!weatherInfo?.weather) {
      if (typeof weatherInfo?.progress === 'undefined') {
        return <></>;
      }
      return (
        <ProgressBar
          className="tw-w-full"
          now={Math.max(weatherInfo.progress, 50)}
          striped
          animated
        />
      );
    } else {
      const { location, weather } = weatherInfo;

      return (
        <>
          <div className="tw-font-bold tw-text-xl tw-mb-3">
            Forecast at {location?.loc}
          </div>
          <div className="tw-flex tw-self-stretch tw-justify-end tw-my-1">
            {isFavorite !== undefined && location && (
              <Button
                className="tw-px-[9px] tw-bg-gray-50"
                variant="outline-secondary"
                onClick={async () => {
                  try {
                    await updateFavoriteCity({
                      city: location.city,
                      state: location.state,
                      favorite: !isFavorite,
                    });
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                <StarFill
                  className={clsx(
                    'tw-text-2xl tw-stroke-black',
                    isFavorite ? 'tw-fill-yellow-200' : 'tw-fill-white',
                  )}
                />
              </Button>
            )}
            <Button
              className="tw-text-black tw-flex tw-items-center tw-pl-0"
              variant="link"
              onClick={() => {
                displayDetailTab();
              }}
            >
              Details
              <ChevronRight />
            </Button>
          </div>
          <Tabs
            className="tw-self-stretch tw-text-[13px] sm:tw-text-sm tw-justify-end tw-mt-2"
            defaultActiveKey="day-view"
            onSelect={(k) => setTabKey(k ?? 'day-view')}
          >
            <Tab
              className="tw-w-full tw-min-h-64"
              eventKey="day-view"
              title="Day View"
            >
              <WeatherTable weather={weather} onSelect={displayDetailTab} />
            </Tab>
            <Tab
              className="tw-min-h-64"
              eventKey="temp-chart"
              title="Daily Temp. Chart"
            >
              {tabKey === 'temp-chart' && (
                <div className="tw-mt-2">
                  <TempChart weather={weather} width={width} />
                </div>
              )}
            </Tab>
            <Tab className="tw-min-h-64" eventKey="meteogram" title="Meteogram">
              <div className="tw-mt-2">
                {tabKey === 'meteogram' && (
                  <Meteogram weather={weather} width={width} />
                )}
              </div>
            </Tab>
          </Tabs>
        </>
      );
    }
  }, [displayDetailTab, isFavorite, tabKey, weatherInfo, width]);

  const [tabIndex, setTabIndex] = useState(0);

  const { location } = weatherInfo ?? {};

  return (
    <div className="tw-flex tw-flex-grow tw-flex-col tw-items-center tw-justify-center">
      <Carousel
        className="tw-self-stretch"
        activeIndex={tabIndex}
        onSelect={setTabIndex}
        controls={false}
        indicators={false}
        interval={null}
        touch={false}
      >
        <Carousel.Item>
          <div className="tw-flex tw-flex-col tw-self-stretch tw-items-center [&>.tab-content]:tw-self-stretch [&>.tab-content]:tw-mb-9">
            {renderChartTab()}
          </div>
        </Carousel.Item>
        {weatherInfo?.weather && (
          <Carousel.Item>
            <div className="tw-flex tw-flex-col tw-self-stretch tw-items-center tw-mb-9">
              {currentWeatherInfo && (
                <DetailTab
                  weather={currentWeatherInfo}
                  location={{
                    lat: location?.lat ?? 0,
                    lon: location?.lon ?? 0,
                    loc: location?.loc ?? '',
                  }}
                  onBack={() => {
                    setTabIndex(0);
                  }}
                />
              )}
            </div>
          </Carousel.Item>
        )}
      </Carousel>
    </div>
  );
}
