import { Component, Element, h, JSX, State, Method } from '@stencil/core';
import { IWeekElement, GuxCalendarDayOfWeek } from '../../gux-calendar.types';
import { fromIsoDate } from '@utils/date/iso-dates';
import {
  getWeekdays,
  getFirstOfMonth,
  getDateAsMonthYear
} from '../../services/calendar.service';
import { getDesiredLocale, getStartOfWeek } from '../../../../../i18n';
import { DateTimeFormatter } from '../../../../../i18n/DateTimeFormatter';
import { buildI18nForComponent, GetI18nValue } from '../../../../../i18n';
import translationResources from '../../i18n/en.json';
import { afterNextRenderTimeout } from '@utils/dom/after-next-render';

@Component({
  styleUrl: 'gux-calendar.scss',
  tag: 'gux-calendar-beta',
  shadow: true
})
export class GuxCalendar {
  @Element()
  root: HTMLElement;

  @State()
  private focusedValue: Date;

  @State()
  private minValue: Date;

  @State()
  private maxValue: Date;

  private locale: string = 'en';

  private i18n: GetI18nValue;

  // Total number of dates that will display for each month in the calendar
  private MONTH_DATE_COUNT: number = 42;

  // Keeps track of the start day of the week based on user's locale
  // Some locales will have the start day of the week be different than others
  private startDayOfWeek: GuxCalendarDayOfWeek;

  private dateFormatter: DateTimeFormatter;

  private get slottedInput(): HTMLInputElement {
    return this.root.querySelector('input[type="date"]');
  }

  async componentWillLoad(): Promise<void> {
    this.locale = getDesiredLocale(this.root);
    this.startDayOfWeek = this.startDayOfWeek || getStartOfWeek(this.locale);
    this.dateFormatter = new DateTimeFormatter(this.locale);
    this.i18n = await buildI18nForComponent(this.root, translationResources);

    if (this.slottedInput.value) {
      this.focusedValue = fromIsoDate(this.slottedInput.value);
    }

    // Set min value from the "min" input prop
    if (this.slottedInput.min) {
      this.minValue = new Date(this.slottedInput.min);
      this.minValue.setHours(0, 0, 0, 0);
    }
    // Set max value from the "max" input prop
    if (this.slottedInput.max) {
      this.maxValue = new Date(this.slottedInput.max);
      this.maxValue.setHours(0, 0, 0, 0);
    }
  }

  private onDateClick(date: Date): void {
    this.focusedValue = new Date(date.getTime());
    this.slottedInput.value = date.toISOString().substring(0, 10);
  }

  private setDateAfterArrowKeyPress(
    event: KeyboardEvent,
    newDayValue: number
  ): void {
    event.preventDefault();
    this.focusedValue = new Date(
      this.getFocusedValue().getFullYear(),
      this.getFocusedValue().getMonth(),
      this.getFocusedValue().getDate() + newDayValue,
      0,
      0,
      0
    );
    afterNextRenderTimeout(() => {
      void this.focusPreviewDate();
    });
  }

  /**
   * Focus the preview date
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  @Method()
  focusPreviewDate() {
    const target: HTMLTableCellElement = this.root.shadowRoot.querySelector(
      `.gux-content-date[data-date="${this.focusedValue.getTime()}"]`
    );
    if (target) {
      target.focus();
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case ' ':
        break;
      case 'Enter':
        event.preventDefault();
        this.onDateClick(this.getFocusedValue());
        afterNextRenderTimeout(() => {
          void this.focusPreviewDate();
        });
        break;
      case 'ArrowDown':
        this.setDateAfterArrowKeyPress(event, 7);
        break;
      case 'ArrowUp':
        this.setDateAfterArrowKeyPress(event, -7);
        break;
      case 'ArrowLeft':
        this.setDateAfterArrowKeyPress(event, -1);
        break;
      case 'ArrowRight':
        this.setDateAfterArrowKeyPress(event, 1);
        break;
      case 'PageUp':
        event.preventDefault();
        this.changeMonth(1);
        afterNextRenderTimeout(() => {
          void this.focusPreviewDate();
        });
        break;
      case 'PageDown':
        event.preventDefault();
        this.changeMonth(-1);
        afterNextRenderTimeout(() => {
          void this.focusPreviewDate();
        });
        break;
    }
  }

  private getMonthDays(): IWeekElement[] {
    const firstOfMonth = getFirstOfMonth(this.getFocusedValue());
    const weeks = [];
    let currentWeek = { dates: [] };
    let weekDayIndex = 0;
    const currentMonth = firstOfMonth.getMonth();
    const firstDayOfMonthIndex = firstOfMonth.getDay();
    const currentDate = new Date(firstOfMonth.getTime());
    const selectedValue = this.getSelectedValue();

    // Initialize the first date in the calendar based on the position of the first of the month and the user's locale
    //
    // For instance, if we're using 'en' locale and we're rendering May, 2023, then May 1st resides on a Monday,
    // which means the first date to render in the calendar will be April 30, since Sunday is the first week day we want
    // to render in the calendar for the 'en' locale.
    if (firstDayOfMonthIndex > 0) {
      currentDate.setDate(
        currentDate.getDate() - firstDayOfMonthIndex + this.startDayOfWeek
      );
    }

    // Generate all of the dates in the current month
    for (let d = 0; d < this.MONTH_DATE_COUNT + 1; d += 1) {
      const selected =
        selectedValue.getTime() === currentDate.getTime() &&
        this.focusedValue !== undefined;

      if (weekDayIndex % 7 === 0) {
        weeks.push(currentWeek);
        currentWeek = {
          dates: []
        };
      }

      // Disable a date that is outside the defined date range boundaries
      const disabled =
        (this.minValue && currentDate.getTime() <= this.minValue.getTime()) ||
        (this.maxValue && currentDate.getTime() > this.maxValue.getTime());

      const focused =
        this.getFocusedValue()?.getTime() === currentDate.getTime() &&
        this.getFocusedValue()?.getTime() !== selectedValue.getTime(); // Do not show preview value for date if it's already selected

      currentWeek.dates.push({
        date: new Date(currentDate),
        disabled,
        inCurrentMonth: currentMonth === currentDate.getMonth() && !disabled,
        tabIndex: selected || focused ? '0' : '-1',
        selected: selected && selectedValue,
        focused,
        ariaSelected: selected ? 'true' : 'false',
        ariaDisabled: disabled ? 'true' : 'false'
      });
      weekDayIndex += 1;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return weeks as IWeekElement[];
  }

  private getFocusedValue(): Date {
    if (this.focusedValue) {
      return this.focusedValue;
    }
    return this.getSelectedValue();
  }

  private changeMonth(newMonthValue: number): void {
    this.focusedValue = new Date(
      this.getFocusedValue().getFullYear(),
      this.getFocusedValue().getMonth() + newMonthValue,
      1,
      0,
      0,
      0
    );
  }

  private getSelectedValue(): Date {
    if (this.slottedInput.value) {
      const value = fromIsoDate(this.slottedInput.value);
      return value;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  private renderHeader(): JSX.Element {
    return (
      <div class="gux-header">
        <button
          type="button"
          class="gux-left"
          aria-label={this.i18n('previousMonth')}
          onClick={() => this.changeMonth(-1)}
        >
          <gux-icon decorative icon-name="chevron-small-left"></gux-icon>
        </button>
        <span class="gux-header-month-and-year">
          {getDateAsMonthYear(this.getFocusedValue(), this.locale)}
        </span>
        <button
          type="button"
          class="gux-right"
          aria-label={this.i18n('nextMonth')}
          onClick={() => this.changeMonth(1)}
        >
          <gux-icon decorative icon-name="chevron-small-right"></gux-icon>
        </button>
      </div>
    ) as JSX.Element;
  }

  private renderContent(): JSX.Element {
    return (
      <div>
        <div class="gux-week-days">
          {getWeekdays(this.locale, this.startDayOfWeek).map(
            day =>
              (
                <div class="gux-week-day" aria-label={this.i18n('weekDay')}>
                  {day}
                </div>
              ) as JSX.Element
          )}
        </div>

        <div class="gux-content">
          {this.getMonthDays().map(
            week =>
              (
                <div class="gux-content-week">
                  {week.dates.map(
                    day =>
                      (
                        <div
                          data-date={day.date.getTime()}
                          onClick={() => this.onDateClick(day.date)}
                          aria-label={this.dateFormatter.formatDate(
                            day.date,
                            'long'
                          )}
                          role="button"
                          aria-selected={day.ariaSelected}
                          tabindex={day.tabIndex}
                          onKeyDown={e => void this.onKeyDown(e)}
                          aria-disabled={day.ariaDisabled}
                          class={{
                            'gux-content-date': true,
                            'gux-disabled': day.disabled,
                            'gux-current-month': day.inCurrentMonth,
                            'gux-selected': day.selected,
                            'gux-previewed': day.focused
                          }}
                        >
                          {day.date.getDate()}
                        </div>
                      ) as JSX.Element
                  )}
                </div>
              ) as JSX.Element
          )}
        </div>
      </div>
    ) as JSX.Element;
  }

  render(): JSX.Element {
    return (
      <div class="gux-calendar-beta">
        <slot aria-hidden="true" />
        {this.renderHeader()}
        {this.renderContent()}
      </div>
    ) as JSX.Element;
  }
}
