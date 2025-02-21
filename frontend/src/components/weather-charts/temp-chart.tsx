import { useRef } from 'react';

import HighchartsReact from 'highcharts-react-official';

import { type IForecast } from 'backend';
import { Highcharts } from './highcharts';

export function TempChart({
  weather,
  width,
}: {
  weather: IForecast;
  width: number;
}) {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const options: Highcharts.Options = {
    chart: {
      type: 'arearange',
      zooming: {
        type: 'x',
      },
      width,
      scrollablePlotArea: {
        scrollPositionX: 1,
      },
    },
    time: {
      timezone: 'America/Los_Angeles',
    },
    title: {
      text: 'Temperature Ranges (Min, Max)',
      style: {
        fontSize: '19',
      },
    },
    xAxis: {
      type: 'datetime',
    },
    yAxis: {
      title: {
        text: null,
      },
    },
    tooltip: {
      shared: true,
      valueSuffix: '°F',
      xDateFormat: '%A, %b %e',
      style: {
        fontSize: '12px',
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        name: 'Temperatures',
        type: 'arearange',
        data: weather.forecast.timelines.daily?.intervals?.map(
          ({ startTime, values }) => [
            new Date(startTime).getTime(),
            values.temperatureMin,
            values.temperatureMax,
          ],
        ),
        tooltip: {
          pointFormatter() {
            const { low, high } =
              (this.series.data[this.index] as unknown as {
                low: number;
                high: number;
              }) ?? {};
            return `<span style="color: rgb(78,158,246)">●</span> Temperatures: <b>${low}°F - ${high}°F</b>`;
          },
        },
        color: {
          linearGradient: {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 1,
          },
          stops: [
            [0, 'rgb(222, 161, 72)'],
            [1, 'rgb(78, 158, 246)'],
          ],
        },
        marker: {
          fillColor: 'rgb(78, 158, 246)',
        },
        lineColor: 'rgb(78, 158, 246)',
      },
    ],
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
    />
  );
}
