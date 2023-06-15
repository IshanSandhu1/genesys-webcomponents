import { newSparkE2EPage } from '../../../../test/e2eTestUtils';

describe('gux-calendar', () => {
  const validateMonthDayYear = async (
    element,
    expectedMonthAndYear,
    expectedDay
  ) => {
    const selectedDate = await element.find('pierce/.gux-selected');
    const currentMonthAndYear = await element.find(
      'pierce/.gux-header-month-and-year'
    );
    expect(currentMonthAndYear.innerHTML).toBe(expectedMonthAndYear);
    expect(selectedDate.innerHTML).toBe(expectedDay);
  };

  const validateMonthYear = async (element, expectedMonthAndYear) => {
    const currentMonthAndYear = await element.find(
      'pierce/.gux-header-month-and-year'
    );
    expect(currentMonthAndYear.innerHTML).toBe(expectedMonthAndYear);
  };

  const defaultHtml = `
    <gux-calendar-beta>
      <input type="date" value="2023-05-19" min="2023-04-28" max="2023-06-18" />
    </gux-calendar-beta>
    `;

  it('renders', async () => {
    const page = await newSparkE2EPage({
      html: defaultHtml
    });
    const element = await page.find('gux-calendar-beta');
    expect(element).toHaveAttribute('hydrated');
  });

  describe('header', () => {
    it('calendar increments by one month after clicking the right arrow button', async () => {
      const page = await newSparkE2EPage({
        html: defaultHtml
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
      await validateMonthYear(element, 'June 2023');
    });

    it('calendar decrements by one month after clicking the left arrow button', async () => {
      const page = await newSparkE2EPage({
        html: defaultHtml
      });
      const element = await page.find('gux-calendar-beta');

      // Validate that the current month before clicking the left arrow is May, 2023
      await validateMonthYear(element, 'May 2023');

      const button = await element.find('pierce/.gux-left');
      await button.click();
      await page.waitForChanges();

      // Validate that the new month after clicking the left arrow  is April, 2023
      await validateMonthYear(element, 'April 2023');
    });
  });

  describe('content', () => {
    it('selected date on page load is correct', async () => {
      const page = await newSparkE2EPage({
        html: defaultHtml
      });
      const element = await page.find('gux-calendar-beta');

      // Validate that the selected date on page load is May 19, 2023
      await validateMonthDayYear(element, 'May 2023', '19');
    });

    it('clicking on a date in the current month causes the date to be selected', async () => {
      const page = await newSparkE2EPage({
        html: defaultHtml
      });

      // Find May 10, 2023 in the calendar and click it so that it will be selected
      const element = await page.find('gux-calendar-beta');
      const contentDate = await element.find(
        'pierce/[data-test="May 10, 2023"]'
      );
      await contentDate.click();
      await page.waitForChanges();

      // Validate that clicking on May 10, 2023 causes it to be selected
      await validateMonthDayYear(element, 'May 2023', '10');
    });

    it('clicking on a date in the next month causes the date to be selected', async () => {
      const page = await newSparkE2EPage({
        html: defaultHtml
      });

      // Find June 1, 2023 in the calendar and click it so that it will be selected
      const element = await page.find('gux-calendar-beta');
      const contentDate = await element.find(
        'pierce/[data-test="June 1, 2023"]'
      );
      await contentDate.click();
      await page.waitForChanges();

      // Validate that clicking on June 1, 2023 causes it to be selected
      await validateMonthDayYear(element, 'June 2023', '1');
    });

    it('clicking on a date in the previous month causes the date to be selected', async () => {
      const page = await newSparkE2EPage({
        html: defaultHtml
      });

      // Find April 30, 2023 in the calendar and click it so that it will be selected
      const element = await page.find('gux-calendar-beta');
      const contentDate = await element.find(
        'pierce/[data-test="April 30, 2023"]'
      );
      await contentDate.click();
      await page.waitForChanges();

      // Validate that clicking on April 30, 2023 causes it to be selected
      await validateMonthDayYear(element, 'April 2023', '30');
    });

    describe('arrow key and page up/down navigation', () => {
      it('pressing the down arrow key and then the enter key cause the selected date to increment by 1 week', async () => {
        const page = await newSparkE2EPage({
          html: defaultHtml
        });
        const element = await page.find('gux-calendar-beta');

        // First click the selected date to get focus on the calendar
        const selectedDate = await element.find('pierce/.gux-selected');
        await selectedDate.click();

        // Press the down arrow key and then the enter key
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForChanges();

        await validateMonthDayYear(element, 'May 2023', '26');
      });

      it('pressing the up arrow key and then the enter key cause the selected date to decrement by 1 week', async () => {
        const page = await newSparkE2EPage({
          html: defaultHtml
        });
        const element = await page.find('gux-calendar-beta');

        // First click the selected date to get focus on the calendar
        const selectedDate = await element.find('pierce/.gux-selected');
        await selectedDate.click();

        // Press the up arrow key and then the enter key
        await page.keyboard.press('ArrowUp');
        await page.keyboard.press('Enter');
        await page.waitForChanges();

        await validateMonthDayYear(element, 'May 2023', '12');
      });

      it('pressing the right arrow key and then the enter key cause the selected date to increment by 1 day', async () => {
        const page = await newSparkE2EPage({
          html: defaultHtml
        });
        const element = await page.find('gux-calendar-beta');

        // First click the selected date to get focus on the calendar
        const selectedDate = await element.find('pierce/.gux-selected');
        await selectedDate.click();

        // Press the right arrow key and then the enter key
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('Enter');
        await page.waitForChanges();

        await validateMonthDayYear(element, 'May 2023', '20');
      });

      it('pressing the left arrow key and then the enter key cause the selected date to decrement by 1 day', async () => {
        const page = await newSparkE2EPage({
          html: defaultHtml
        });
        const element = await page.find('gux-calendar-beta');

        // First click the selected date to get focus on the calendar
        const selectedDate = await element.find('pierce/.gux-selected');
        await selectedDate.click();

        // Press the left arrow key and then the enter key
        await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('Enter');
        await page.waitForChanges();

        await validateMonthDayYear(element, 'May 2023', '18');
      });

      it('pressing the page down key causes the current month to decrement by 1 month', async () => {
        const page = await newSparkE2EPage({
          html: defaultHtml
        });
        const element = await page.find('gux-calendar-beta');

        // First click the selected date to get focus on the calendar
        const selectedDate = await element.find('pierce/.gux-selected');
        await selectedDate.click();

        // Press the left arrow key and then the enter key
        await page.keyboard.press('PageDown');
        await page.keyboard.press('Enter');
        await page.waitForChanges();

        await validateMonthYear(element, 'April 2023');
      });

      it('pressing the page up key causes the current month to increment by 1 month', async () => {
        const page = await newSparkE2EPage({
          html: defaultHtml
        });
        const element = await page.find('gux-calendar-beta');

        // First click the selected date to get focus on the calendar
        const selectedDate = await element.find('pierce/.gux-selected');
        await selectedDate.click();

        // Press the left arrow key and then the enter key
        await page.keyboard.press('PageUp');
        await page.keyboard.press('Enter');
        await page.waitForChanges();

        await validateMonthYear(element, 'June 2023');
      });
    });
  });
});
