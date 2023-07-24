/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Component, Element, h, JSX, Prop, Watch } from '@stencil/core';
import { EmbedOptions, VisualizationSpec } from 'vega-embed';

import { trackComponent } from '@utils/tracking/usage';

import { VISUALIZATION_COLORS } from '../../../utils/theme/color-palette';

import { logError } from '../../../utils/error/log-error';

const DEFAULT_COLOR_FIELD_NAME = 'category';
@Component({
  styleUrl: 'gux-chart-line.less',
  tag: 'gux-chart-line-beta',
  shadow: true
})
export class GuxLineChart {
  @Element()
  root: HTMLElement;

  private visualizationSpec: VisualizationSpec;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private baseChartSpec: Record<string, any> = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    mark: {
      type: 'line',
      interpolate: 'linear',
      point: false
    },
    config: {
      axis: {
        ticks: false,
        titlePadding: 8
      },
      axisX: {
        labelPadding: 4,
        labelAngle: 0,
        grid: false,
        labelLimit: 125
      },
      axisY: {
        labelPadding: 8
      },
      legend: {
        symbolType: 'circle'
      }
    },
    encoding: {
      x: { type: 'nominal', tickCount: 6 },
      y: { type: 'quantitative' },
      color: {
        field: DEFAULT_COLOR_FIELD_NAME,
        type: 'nominal',
        scale: { range: VISUALIZATION_COLORS },
        legend: null
      },
      tooltip: { aggregate: 'count', type: 'quantitative' }
    },
    layer: [
      {
        mark: 'line'
      },
      {
        params: [
          {
            name: 'hover',
            select: { type: 'point', on: 'mouseover', clear: 'mouseout' }
          }
        ],
        mark: { type: 'circle', tooltip: true },
        encoding: {
          opacity: {
            condition: { test: { param: 'hover', empty: false }, value: 1 },
            value: 0
          },
          size: {
            condition: { test: { param: 'hover', empty: false }, value: 48 },
            value: 100
          }
        }
      }
    ]
  };

  /**
   * Data to be rendered in the chart.
   * Data field names must match the values you set in xFieldName and yFieldName
   */
  @Prop()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartData: Record<string, any>;

  /**
   * If true, then make Axis tick label 45 degrees
   */
  @Prop()
  xTickLabelSlant: boolean;

  @Prop()
  includeLegend: boolean;

  @Prop()
  legendPosition:
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'none' = 'right';

  @Prop()
  includeDataPointMarkers: boolean;

  @Prop()
  includeDataPointshapes: boolean;

  /**
   * Name for the data field to use to populate the chart's x-axis
   * e.g. xFieldName of "category" will map any "category" fields in chartData to the x-axis
   */
  @Prop()
  xFieldName: string;

  /**
   * Title to display along the x-axis
   */
  @Prop()
  xAxisTitle: string;

  /**
   * Vertical gridlines to display along the x-axis
   */
  @Prop()
  xAxisGridlines: boolean;

  /**
   * Name for the data field to use to populate the chart's x-axis
   * e.g. yFieldName of "value" will map any "value" fields in chartData to the y-axis
   */
  @Prop()
  yFieldName: string;

  /**
   * Title to display along the y-axis
   */
  @Prop()
  yAxisTitle: string;

  /**
   * Title to display above the optional legend
   */
  @Prop()
  legendTitle: string;

  @Prop()
  colorFieldName: string;

  @Prop()
  strokeDash: boolean;

  @Prop()
  interpolation: string;

  @Prop()
  embedOptions: EmbedOptions;

  @Watch('chartData')
  parseData() {
    if (!this.xFieldName || !this.yFieldName) {
      logError(this.root, 'requires x-field-name and y-field-name');
    }

    let chartData = {};
    if (this.chartData) {
      chartData = { data: this.chartData };
    }

    if (this.xTickLabelSlant) {
      this.baseChartSpec.config.axisX.labelAngle = -45;
    }

    if (this.includeLegend) {
      this.baseChartSpec.encoding.color.legend = true;
    }

    if (this.legendPosition) {
      this.baseChartSpec.config.legend.orient = this.legendPosition;
    }

    const xFieldName = this.xFieldName;
    const xAxisTitle = this.xAxisTitle;
    const xAxisGridlines = this.xAxisGridlines;
    const yFieldName = this.yFieldName;
    const yAxisTitle = this.yAxisTitle;
    const legendTitle = this.legendTitle;
    const colorFieldName = this.colorFieldName || DEFAULT_COLOR_FIELD_NAME;
    const interpolation = this.interpolation;
    const strokeDash = this.strokeDash;
    const includeDataPointMarkers = this.includeDataPointMarkers;
    const includeDataPointshapes = this.includeDataPointshapes;

    if (xFieldName) {
      this.baseChartSpec.encoding.x.field = xFieldName;
    }

    if (xAxisTitle) {
      this.baseChartSpec.encoding.x.title = xAxisTitle;
    }

    if (xAxisGridlines) {
      this.baseChartSpec.config.axisX.grid = xAxisGridlines;
    }

    if (yFieldName) {
      this.baseChartSpec.encoding.y.field = yFieldName;
    }

    if (yAxisTitle) {
      this.baseChartSpec.encoding.y.title = yAxisTitle;
    }

    if (colorFieldName) {
      this.baseChartSpec.encoding.color.field = colorFieldName;
    }

    if (legendTitle) {
      this.baseChartSpec.encoding.color.title = legendTitle;
    }

    if (strokeDash) {
      this.baseChartSpec.encoding.strokeDash = {
        field: colorFieldName,
        type: 'nominal'
      };
    }

    if (interpolation) {
      this.baseChartSpec.mark.interpolate = interpolation;
    }

    if (includeDataPointshapes) {
      this.baseChartSpec.mark.point = true;
      this.baseChartSpec.encoding.shape = {
        field: colorFieldName,
        type: 'nominal'
      };
    }

    if (includeDataPointMarkers) {
      this.baseChartSpec.mark.point = includeDataPointMarkers;
    }

    const spec = Object.assign(this.baseChartSpec, chartData);
    this.visualizationSpec = spec;
  }

  componentWillLoad(): void {
    trackComponent(this.root);
    this.parseData();
  }

  render(): JSX.Element {
    return (
      <gux-visualization-beta
        visualizationSpec={this.visualizationSpec}
      ></gux-visualization-beta>
    ) as JSX.Element;
  }
}
