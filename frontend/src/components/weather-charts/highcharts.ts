import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import Datagrouping from 'highcharts/modules/datagrouping';
import PatternFill from 'highcharts/modules/pattern-fill';
import Windbarb from 'highcharts/modules/windbarb';

HighchartsMore(Highcharts);

Datagrouping(Highcharts);
PatternFill(Highcharts);
Windbarb(Highcharts);

export { Highcharts };
