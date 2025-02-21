import { useMemo, useRef } from 'react';

import HighchartsReact from 'highcharts-react-official';

import { type IForecast } from 'backend';
import { Highcharts } from './highcharts';

interface IChartPoint {
  x: number;
  to: number;
  y: number;
}

interface IWindbarbPoint {
  x: number;
  value: number;
  direction: number;
}

const ONE_HOUR = 36e5;

export function Meteogram({
  weather,
  width,
}: {
  weather: IForecast;
  width: number;
}) {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const chartData = useMemo(() => {
    const data: {
      temperatures: IChartPoint[];
      humidities: IChartPoint[];
      pressures: IChartPoint[];
      winds: IWindbarbPoint[];
    } = { temperatures: [], humidities: [], pressures: [], winds: [] };

    weather.forecast.timelines.hourly?.intervals?.forEach(
      ({ startTime, values }, i) => {
        const x = new Date(startTime).getTime();
        const to = x + ONE_HOUR;
        const {
          temperature,
          humidity,
          pressureSeaLevel,
          windSpeed,
          windDirection,
        } = values;

        data.temperatures.push({
          x,
          to,
          y: Math.round(temperature),
        });

        data.humidities.push({
          x,
          to,
          y: Math.round(humidity),
        });

        data.pressures.push({
          x,
          to,
          y: pressureSeaLevel,
        });

        if (i % 2 === 0) {
          data.winds.push({
            x: x,
            value: windSpeed,
            direction: windDirection,
          });
        }
      },
    );

    return data;
  }, [weather]);

  const options: Highcharts.Options = {
    time: {
      timezone: 'America/Los_Angeles',
    },
    chart: {
      alignTicks: false,
      plotBorderWidth: 1,
      width,
      scrollablePlotArea: {
        minWidth: 800,
      },
    },
    title: {
      text: 'Hourly Weather (For Next 5 Days)',
      style: {
        fontSize: '19',
      },
    },
    credits: {
      text: 'Forecast',
    },
    tooltip: {
      shared: true,
      useHTML: true,
      headerFormat:
        '<small>{point.x:%A, %b %e, %H:%M}' +
        '{point.point.to:%H:%M}</small>' +
        '<b>{point.point.symbolName}</b><br>',
      style: {
        fontSize: '12px',
      },
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      series: {
        pointPlacement: 'between',
      },
    },
    xAxis: [
      {
        type: 'datetime',
        tickInterval: 3 * ONE_HOUR,
        minorTickInterval: ONE_HOUR,
        tickmarkPlacement: 'on',
        tickLength: 0,
        gridLineWidth: 1,
        gridLineColor: 'rgba(128, 128, 128, 0.1)',
        startOnTick: false,
        endOnTick: false,
        minPadding: 0,
        maxPadding: 0,
        offset: 26,
        showLastLabel: true,
        labels: {
          format: '{value:%H}',
          style: {
            fontSize: '11px',
          },
        },
        crosshair: true,
      },
      {
        linkedTo: 0,
        type: 'datetime',
        tickInterval: 24 * ONE_HOUR,
        labels: {
          format:
            '{value:<span style="font-size: 10px; font-weight: bold">%a</span> %b %e}',
          align: 'left',
          y: -8,
          x: 3,
          style: {
            fontSize: '11px',
          },
        },
        opposite: true,
        tickLength: 20,
        gridLineWidth: 1,
      },
    ],
    yAxis: [
      {
        title: {
          text: null,
        },
        labels: {
          format: '{value}°',
          style: {
            fontSize: '10px',
          },
          x: -3,
        },
        plotLines: [
          {
            value: 0,
            color: '#BBBBBB',
            width: 1,
            zIndex: 2,
          },
        ],
        maxPadding: 0.3,
        minRange: 8,
        tickInterval: 1,
        gridLineColor: 'rgba(128, 128, 128, 0.1)',
        min: 0,
      },
      {
        title: {
          text: null,
        },
        labels: {
          enabled: false,
        },
        gridLineWidth: 0,
        tickLength: 0,
        min: 0,
        max: 105,
      },
      {
        title: {
          text: 'inHg',
          align: 'high',
          style: {
            color: '#e9ab05',
            fontSize: '10px',
          },
          rotation: 0,
          offset: 3,
        },
        labels: {
          enabled: true,
          distance: 3,
          style: {
            color: '#e9ab05',
            fontSize: '10px',
          },
          rotation: 0,
        },
        tickInterval: 10,
        opposite: true,
        showLastLabel: false,
        showFirstLabel: false,
        gridLineWidth: 0,
      },
    ],
    series: [
      {
        name: 'Temperature',
        data: chartData.temperatures,
        type: 'spline',
        color: '#cc0000',
        negativeColor: '#48afe8',
        tooltip: {
          valueSuffix: '°F',
        },
        lineWidth: 2,
        zIndex: 1,
      } as unknown as Highcharts.SeriesOptionsType,
      {
        yAxis: 1,
        name: 'Humidity',
        data: chartData.humidities,
        type: 'column',
        zIndex: 0,
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '8px',
            color: '#767676',
          },
        },
        tooltip: {
          valueSuffix: ' %',
        },
        grouping: false,
        pointPadding: 0,
        groupPadding: 0,
        color: 'rgb(137, 195, 245)',
      } as unknown as Highcharts.SeriesOptionsType,
      {
        yAxis: 2,
        name: 'Air pressure',
        data: chartData.pressures,
        dashStyle: 'ShortDot',
        lineWidth: 1,
        color: '#e9ab05',
        tooltip: {
          valueSuffix: ' inHg',
        },
      } as unknown as Highcharts.SeriesOptionsType,
      {
        name: 'Wind',
        type: 'windbarb',
        id: 'windbarbs',
        data: chartData.winds,
        yOffset: -16,
        vectorLength: 9,
        lineWidth: 1,
        color: '#cc0000',
        tooltip: {
          valueDecimals: 2,
          valueSuffix: ' mph',
        },
        dataGrouping: false,
      } as unknown as Highcharts.SeriesOptionsType,
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
