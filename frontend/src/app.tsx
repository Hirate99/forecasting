import { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { Button } from 'react-bootstrap';

import { WeatherLocationForm } from './components/weather-form';
import { triggerForecast } from './services/forecast';
import { WeatherTab } from './components/weather-tab';
import { FavoriteTab } from './components/favorite-tab';

import { useWeatherStore } from './store/weather';
import { useResize } from './hooks/use-resize';

export function App() {
  const weatherStore = useWeatherStore();

  const [tabIndex, setTabIndex] = useState(0);

  const tabRef = useRef<HTMLFormElement>(null);
  const [tabWidth, setTabWidth] = useState(0);
  useResize(() => {
    if (tabRef.current) {
      setTabWidth(tabRef.current.clientWidth);
    }
  });

  useEffect(() => {
    return weatherStore.on('info', ({ progress }) => {
      if (progress === 0) {
        setTabIndex(0);
      }
    });
  }, [weatherStore]);

  return (
    <main className="tw-flex tw-w-full tw-flex-col tw-items-center">
      <WeatherLocationForm
        ref={tabRef}
        className="tw-mt-4 tw-mb-3 tw-mx-3 sm:tw-m-8 sm:tw-mb-3 tw-bg-[rgb(242,242,241)] tw-box-border tw-self-stretch sm:tw-self-center sm:tw-w-full tw-max-w-[1000px]"
        onClear={() => {
          setTabIndex(0);
          weatherStore.emit('clear', undefined);
        }}
        onSubmit={({ location, autoDetect }) => {
          setTabIndex(0);
          triggerForecast({ location, autoDetect });
        }}
      />
      <div className="tw-flex tw-justify-center tw-gap-x-3 [&>.btn]:tw-border-none">
        <Button
          className="tw-text-[15px]"
          variant={tabIndex ? 'outline-primary' : 'primary'}
          onClick={() => setTabIndex(0)}
        >
          Results
        </Button>
        <Button
          className="tw-text-[15px]"
          variant={tabIndex ? 'primary' : 'outline-primary'}
          onClick={() => setTabIndex(1)}
        >
          Favorites
        </Button>
      </div>
      <div className="tw-box-border tw-self-stretch tw-m-3 tw-mt-10">
        <div
          className={clsx('tw-flex-grow tw-flex tw-justify-center', {
            'tw-hidden': tabIndex !== 0,
          })}
        >
          <div className="sm:tw-self-center sm:tw-w-full tw-flex-grow tw-max-w-[1000px]">
            <WeatherTab width={tabWidth} />
          </div>
        </div>
        <div
          className={clsx('tw-flex-grow tw-flex tw-justify-center', {
            'tw-hidden': tabIndex !== 1,
          })}
        >
          <div className="sm:tw-self-center sm:tw-w-full tw-flex-grow tw-max-w-[1000px]">
            <FavoriteTab />
          </div>
        </div>
      </div>
    </main>
  );
}
