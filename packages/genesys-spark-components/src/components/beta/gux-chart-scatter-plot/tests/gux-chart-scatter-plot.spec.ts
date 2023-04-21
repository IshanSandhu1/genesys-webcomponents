import { newSpecPage } from '@stencil/core/testing';
import { GuxScatterPlotChart } from '../gux-chart-scatter-plot';

const components = [GuxScatterPlotChart];
const language = 'en';

describe('gux-chart-scatter-plot-beta', () => {
  const chartData = {
    values: [
      { date: '2021-01-01', value: 9.4, category: 'Jupiter' },
      { date: '2021-01-02', value: 12.8, category: 'Jupiter' },
      { date: '2021-01-03', value: 10.6, category: 'Jupiter' },
      { date: '2021-01-23', value: 6.7, category: 'Jupiter' },
      { date: '2021-01-24', value: 8.3, category: 'Jupiter' }
    ]
  };

  it('should build', async () => {
    const html =
      '<gux-chart-scatter-plot-beta x-field-name="date" y-field-name="value"></gux-chart-scatter-plot-beta>';
    const page = await newSpecPage({ components, html, language });
    const element = page.root;
    element.chartData = chartData;

    expect(page.rootInstance).toBeInstanceOf(GuxScatterPlotChart);
  });

  it('should reflect the shape user has chosen', async () => {
    let html =
      '<gux-chart-scatter-plot-beta x-field-name="date" y-field-name="value"></gux-chart-scatter-plot-beta>';
    let page = await newSpecPage({ components, html, language });

    let element = page.root;
    element.chartData = chartData;

    expect(page.rootInstance.useShape).toBeUndefined();
    expect(page.rootInstance.baseChartSpec.mark.type).toBe('circle');

    html =
      '<gux-chart-scatter-plot-beta x-field-name="date" y-field-name="value" use-shape="square"></gux-chart-scatter-plot-beta>';
    page = await newSpecPage({ components, html, language });

    element = page.root;
    element.chartData = chartData;

    expect(page.rootInstance.useShape).toBeTruthy();
    expect(page.rootInstance.baseChartSpec.mark.type).toBe('square');
  });

  it('should reflect user option to make slant x axis tick labels', async () => {
    let html =
      '<gux-chart-scatter-plot-beta x-field-name="date" y-field-name="value"></gux-chart-scatter-plot-beta>';
    let page = await newSpecPage({ components, html, language });

    let element = page.root;
    element.chartData = chartData;

    expect(page.rootInstance.xTickLabelSlant).toBeUndefined();
    expect(page.rootInstance.baseChartSpec.config.axisX.labelAngle).toBe(0);

    html =
      '<gux-chart-scatter-plot-beta x-field-name="date" y-field-name="value" x-tick-label-slant="true"></gux-chart-scatter-plot-beta>';
    page = await newSpecPage({ components, html, language });

    element = page.root;
    element.chartData = chartData;

    expect(page.rootInstance.xTickLabelSlant).toBeTruthy();
    expect(page.rootInstance.baseChartSpec.config.axisX.labelAngle).toBe(-45);
  });
});
