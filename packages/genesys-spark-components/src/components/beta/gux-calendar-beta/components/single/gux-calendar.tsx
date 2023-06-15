import { Component, Element, h, JSX, State } from '@stencil/core';
import { IWeekElement, GuxCalendarDayOfWeek } from '../../gux-calendar.types';
import { afterNextRenderTimeout } from '@utils/dom/after-next-render';
import { fromIsoDate } from '@utils/date/iso-dates';
import {
  getWeekdays,
  getFirstOfMonth,
  getDateAsMonthYear
} from '../../services/calendar.service';
import { getDesiredLocale, getStartOfWeek } from '../../../../../i18n';
import { DateTimeFormatter } from '../../../../../i18n/DateTimeFormatter';

@Component({
  styleUrl: 'gux-calendar.scss',
  tag: 'gux-calendar-beta',
  shadow: true
})
export class GuxCalendar {
  @Element()
  root: HTMLElement;

  @State()
  private selectedValue: Date = new Date();

  @State()
  private previewValue: Date;

  @State()
  private minValue: Date;

  @State()
  private maxValue: Date;

  @State()
  // Preview value will not be visible when the user clicks on the next or previous month arrows in the header,
  // otherwise we will show the preview value as a circular border around the date
  private showPreviewValue: boolean = false;

  @State()
  // Selected value will not be visible if the user's date input value is empty
  private showSelectedValue: boolean = true;

  private locale: string = 'en';
  private input: HTMLInputElement;

  // Total number of dates that will display for each month in the calendar
  private MONTH_DATE_COUNT: number = 42;

  // Keeps track of the start day of the week based on user's locale
  // Some locales will have the start day of the week be different than others
  private startDayOfWeek: GuxCalendarDayOfWeek;

  private dateFormatter: DateTimeFormatter;

  componentWillLoad(): void {
    this.locale = getDesiredLocale(this.root);
    this.startDayOfWeek = this.startDayOfWeek || getStartOfWeek(this.locale);
    this.dateFormatter = new DateTimeFormatter(getDesiredLocale(this.root));

    // Get date input element
    this.input = this.root.querySelector('input[type="date"]');
    if (!this.input) {
      return;
    }

    if (this.input.value) {
      this.selectedValue = new Date(this.input.value);
      this.selectedValue.setHours(0, 0, 0, 0);
    } else {
      this.selectedValue.setHours(0, 0, 0, 0);
      // Hide the selected value since the user's input value is empty
      this.showSelectedValue = false;
    }
    // Initialize preview value to be the same as the selected value
    this.previewValue = new Date(this.selectedValue.getTime());

    // Set min value from the "min" input prop
    if (this.input.min) {
      this.minValue = new Date(this.input.min);
      this.minValue.setHours(0, 0, 0, 0);
    }
    // Set max value from the "max" input prop
    if (this.input.max) {
      this.maxValue = new Date(this.input.max);
      this.maxValue.setHours(0, 0, 0, 0);
    }

    this.onSlotInputChange();
  }

  /**
   *  Set the selected calendar value when the slot input value changes
   */
  private onSlotInputChange(): void {
    this.input.addEventListener('input', () => {
      const value = fromIsoDate(this.input.value);
      value.setHours(0, 0, 0, 0);
      this.selectedValue = value;
    });
  }

  private onDateClick(date: Date): void {
    this.showSelectedValue = true;
    this.selectedValue = new Date(date.getTime());
    this.previewValue = new Date(date.getTime());
    this.setSlotInputValue(date);
  }

  private setSlotInputValue(date: Date) {
    this.input.value = date.toISOString().substring(0, 10);
  }

  private setDateAfterArrowKeyPress(
    event: KeyboardEvent,
    newDayValue: number
  ): void {
    event.preventDefault();
    this.previewValue = new Date(
      this.previewValue.getFullYear(),
      this.previewValue.getMonth(),
      this.previewValue.getDate() + newDayValue,
      0,
      0,
      0
    );

    // Wait for render before focusing preview date
    afterNextRenderTimeout(() => {
      this.focusSelectedDate();
    });
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.showPreviewValue = true;

    switch (event.key) {
      case ' ':
        this.showPreviewValue = false;
        break;
      case 'Enter':
        event.preventDefault();
        this.onDateClick(this.previewValue);

        // Wait for render before focusing preview date
        afterNextRenderTimeout(() => {
          this.focusSelectedDate();
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
        this.incrementMonth();
        break;
      case 'PageDown':
        event.preventDefault();
        this.decrementMonth();
        break;
    }
  }

  private getMonthDays(): IWeekElement[] {
    const firstOfMonth = getFirstOfMonth(this.previewValue);
    const weeks = [];
    let currentWeek = { dates: [] };
    let weekDayIndex = 0;
    const currentMonth = firstOfMonth.getMonth();
    const firstDayOfMonthIndex = firstOfMonth.getDay();
    const currentDate = new Date(firstOfMonth.getTime());

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

      currentWeek.dates.push({
        date: new Date(currentDate),
        disabled,
        inCurrentMonth: currentMonth === currentDate.getMonth() && !disabled,
        selected:
          this.selectedValue.getTime() === currentDate.getTime() &&
          this.showSelectedValue,
        previewed:
          this.showPreviewValue &&
          this.previewValue?.getTime() === currentDate.getTime() &&
          this.previewValue?.getTime() !== this.selectedValue.getTime() // Do not show preview value for date if it's already selected
      });
      weekDayIndex += 1;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return weeks as IWeekElement[];
  }

  private changeMonth(newMonthValue: number): void {
    this.previewValue = new Date(
      this.previewValue.getFullYear(),
      this.previewValue.getMonth() + newMonthValue,
      1,
      0,
      0,
      0
    );

    // Wait for render before focusing preview date
    afterNextRenderTimeout(() => {
      this.focusSelectedDate();
    });
  }

  private decrementMonth(): void {
    this.changeMonth(-1);
  }

  private incrementMonth(): void {
    this.changeMonth(1);
  }

  private focusSelectedDate(): void {
    const target: HTMLTableCellElement = this.root.shadowRoot.querySelector(
      `.gux-content-date[data-date="${this.selectedValue.getTime()}"]`
    );
    if (target) {
      target.focus();
    }
  }

  private prevMonthClick(): void {
    this.showPreviewValue = false;
    this.decrementMonth();
  }

  private nextMonthClick(): void {
    this.showPreviewValue = false;
    this.incrementMonth();
  }

  private renderHeader(): JSX.Element {
    return (
      <div class="gux-header">
        <button
          type="button"
          class="gux-left"
          aria-label="Previous month"
          onClick={() => this.prevMonthClick()}
        >
          <gux-icon decorative icon-name="chevron-small-left"></gux-icon>
        </button>
        <span class="gux-header-month-and-year">
          {getDateAsMonthYear(this.previewValue, this.locale)}
        </span>
        <button
          type="button"
          class="gux-right"
          aria-label="Next month"
          onClick={() => this.nextMonthClick()}
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
                <div class="gux-week-day" aria-label="Week day">
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
                          aria-selected={day.selected ? 'true' : 'false'}
                          tabindex={day.selected ? '0' : '-1'}
                          onKeyDown={e => void this.onKeyDown(e)}
                          aria-disabled={day.disabled}
                          class={{
                            'gux-content-date': true,
                            'gux-disabled': day.disabled,
                            'gux-current-month': day.inCurrentMonth,
                            'gux-selected': day.selected,
                            'gux-previewed': day.previewed
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
