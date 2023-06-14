import { newSparkE2EPage, a11yCheck } from '../../../../test/e2eTestUtils';

describe('gux-calendar', () => {
  it('renders', async () => {
    const page = await newSparkE2EPage({
      html: `
      <gux-calendar-beta>
        <input type="date" value="2023-05-19" min="2023-04-28" max="2023-06-18" />
      </gux-calendar-beta>
      `
    });
    const element = await page.find('gux-calendar-beta');
    expect(element).toHaveAttribute('hydrated');
  });

  describe('header', () => {
    it('calendar increments by one month after clicking the right arrow button', async () => {
      const page = await newSparkE2EPage({
        html: `
        <gux-calendar-beta>
          <input type="date" value="2023-05-19" min="2023-04-28" max="2023-06-18" />
        </gux-calendar-beta>
        `
      });
      const element = await page.find('gux-calendar-beta');

      // Validate that the current month before clicking the right arrow is May, 2023
      const currentMonthAndYear = await element.find(
        'pierce/.gux-header-month-and-year'
      );
      expect(currentMonthAndYear.innerHTML).toBe('May 2023');

      const button = await element.find('pierce/.gux-right');
      await button.click();
      await page.waitForChanges();
      // await a11yCheck(page);

      // Validate that the new month after clicking the right arrow is June, 2023
      const newMonthAndYear = await element.find(
        'pierce/.gux-header-month-and-year'
      );
      expect(newMonthAndYear.innerHTML).toBe('June 2023');
    });

    it('calendar decrements by one month after clicking the left arrow button', async () => {
      const page = await newSparkE2EPage({
        html: `
        <gux-calendar-beta>
          <input type="date" value="2023-05-19" min="2023-04-28" max="2023-06-18" />
        </gux-calendar-beta>
        `
      });
      const element = await page.find('gux-calendar-beta');

      // Validate that the current month before clicking the left arrow is May, 2023
      const currentMonthAndYear = await element.find(
        'pierce/.gux-header-month-and-year'
      );
      expect(currentMonthAndYear.innerHTML).toBe('May 2023');

      const button = await element.find('pierce/.gux-left');
      await button.click();
      await page.waitForChanges();

      // Validate that the new month after clicking the left arrow  is April, 2023
      const newMonthAndYear = await element.find(
        'pierce/.gux-header-month-and-year'
      );
      expect(newMonthAndYear.innerHTML).toBe('April 2023');
    });
  });

  describe('content', () => {
    it('selected date on page load is correct', async () => {
      const page = await newSparkE2EPage({
        html: `
        <gux-calendar-beta>
          <input type="date" value="2023-05-19" min="2023-04-28" max="2023-06-18" />
        </gux-calendar-beta>
        `
      });

      // Validate that the selected date on page load is May 19, 2023
      const element = await page.find('gux-calendar-beta');
      const selectedDate = await element.find('pierce/.gux-selected');
      const currentMonthAndYear = await element.find(
        'pierce/.gux-header-month-and-year'
      );
      expect(currentMonthAndYear.innerHTML).toBe('May 2023');
      expect(selectedDate.innerHTML).toBe('19');
    });

    it('clicking on a date in the current month causes the date to be selected', async () => {
      const page = await newSparkE2EPage({
        html: `
        <gux-calendar-beta>
          <input type="date" value="2023-05-19" min="2023-04-28" max="2023-06-18" />
        </gux-calendar-beta>
        `
      });

      // Find May 10, 2023 in the calendar and click it so that it will be selected
      const element = await page.find('gux-calendar-beta');
      const contentDate = await element.find(
        'pierce/[aria-label="May 10, 2023"]'
      );
      await contentDate.click();
      await page.waitForChanges();

      // Validate that clicking on May 10, 2023 causes it to be selected
      const selectedDate = await element.find('pierce/.gux-selected');
      const currentMonthAndYear = await element.find(
        'pierce/.gux-header-month-and-year'
      );
      expect(currentMonthAndYear.innerHTML).toBe('May 2023');
      expect(selectedDate.innerHTML).toBe('10');
    });

    it('clicking on a date in the next month causes the date to be selected', async () => {
      const page = await newSparkE2EPage({
        html: `
        <gux-calendar-beta>
          <input type="date" value="2023-05-19" min="2023-04-28" max="2023-06-18" />
        </gux-calendar-beta>
        `
      });

      // Find June 1, 2023 in the calendar and click it so that it will be selected
      const element = await page.find('gux-calendar-beta');
      const contentDate = await element.find(
        'pierce/[aria-label="June 1, 2023"]'
      );
      await contentDate.click();
      await page.waitForChanges();

      // Validate that clicking on June 1, 2023 causes it to be selected
      const selectedDate = await element.find('pierce/.gux-selected');
      const currentMonthAndYear = await element.find(
        'pierce/.gux-header-month-and-year'
      );
      expect(currentMonthAndYear.innerHTML).toBe('June 2023');
      expect(selectedDate.innerHTML).toBe('1');
    });

    it('clicking on a date in the previous month causes the date to be selected', async () => {
      const page = await newSparkE2EPage({
        html: `
        <gux-calendar-beta>
          <input type="date" value="2023-05-19" min="2023-04-28" max="2023-06-18" />
        </gux-calendar-beta>
        `
      });

      // Find April 30, 2023 in the calendar and click it so that it will be selected
      const element = await page.find('gux-calendar-beta');
      const contentDate = await element.find(
        'pierce/[aria-label="April 30, 2023"]'
      );
      await contentDate.click();
      await page.waitForChanges();

      // Validate that clicking on April 30, 2023 causes it to be selected
      const selectedDate = await element.find('pierce/.gux-selected');
      const currentMonthAndYear = await element.find(
        'pierce/.gux-header-month-and-year'
      );
      expect(currentMonthAndYear.innerHTML).toBe('April 2023');
      expect(selectedDate.innerHTML).toBe('30');
    });

    // TODO: write tests for arrow key navigation
  });
});
