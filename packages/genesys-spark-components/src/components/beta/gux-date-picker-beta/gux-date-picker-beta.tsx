import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  JSX,
  Method,
  Prop,
  State
} from '@stencil/core';

import { afterNextRenderTimeout } from '@utils/dom/after-next-render';
import { asIsoDate, fromIsoDate } from '@utils/date/iso-dates';

import { trackComponent } from '@utils/tracking/usage';
import { CalendarModes } from '../../../common-enums';
import { getDesiredLocale, getStartOfWeek } from '../../../i18n';

import {
  firstDateInMonth,
  getWeekdays,
  getOffsetMonthDate,
  getDateMonthAndYearString
} from './gux-calendar.service';
import { GuxCalendarDayOfWeek, IDateElement } from './gux-calendar.types';

@Component({
  styleUrl: 'gux-date-picker-beta.less',
  tag: 'gux-date-picker-beta',
  shadow: true
})
export class GuxDatePickerBeta {
  @Element()
  root: HTMLElement;

  /**
   * The calendar current selected date
   */
  @Prop({ mutable: true })
  value: string = '';

  /**
   * The min date selectable
   */
  @Prop()
  minDate: string = '';

  /**
   * The max date selectable
   */
  @Prop()
  maxDate: string = '';

  /**
   * The calendar number of months displayed
   */
  @Prop()
  numberOfMonths: number = 1;

  /**
   * The day of the week to start each calendar row. ISO weekday number ie 1 - Monday, 2 - Tuesday, ... 7 - Sunday
   */
  @Prop({ mutable: true })
  startDayOfWeek: GuxCalendarDayOfWeek;

  @State()
  previewValue: Date = new Date();

  /**
   * Triggered when user selects a date
   */
  @Event()
  input: EventEmitter<string>;

  private locale: string = 'en';

  /**
   * Focus the preview date
   */
  @Method()
  focusPreviewDate() {
    const target: HTMLTableCellElement = this.root.shadowRoot.querySelector(
      `.day-value[data-date="${this.previewValue.getTime()}"]`
    );
    if (target) {
      target.focus();
    }
  }

  /**
   * Reset calendar view to show first selected date
   */
  @Method()
  resetCalendarView(value: Date) {
    this.previewValue = value;
  }

  incrementPreviewDateByMonth(increment: number) {
    this.previewValue = new Date(
      this.previewValue.getFullYear(),
      this.previewValue.getMonth() + increment,
      15, // Don't use the day from the old value, because we'll skip a month on the 31st
      0,
      0,
      0
    );
    // Wait for render before focusing preview date
    afterNextRenderTimeout(() => {
      void this.focusPreviewDate();
    });
  }

  outOfBounds(date: Date): boolean {
    return (
      (this.maxDate !== '' && fromIsoDate(this.maxDate) < date) ||
      (this.minDate !== '' && fromIsoDate(this.minDate) > date)
    );
  }

  createSimpleDateFrom(date: Date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0
    );
  }

  generateDatesFrom(
    month: number,
    startDate: Date,
    length: number
  ): IDateElement[] {
    const arr: IDateElement[] = [];
    const currentDate = this.createSimpleDateFrom(startDate);
    for (let i = 0; i < length; i++) {
      const date = this.createSimpleDateFrom(currentDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const classes = [];

      let disabled = false;
      const hidden = false;

      // Check if day is not part of the current month
      if (date.getMonth() !== month) {
        classes.push('gux-not-in-month');
        disabled = true;
      }

      // Check if the day should be disabled, i.e. the day is part of a previous or next month
      // but still displayed in the calendar
      if (this.outOfBounds(date)) {
        classes.push('gux-disabled');
        disabled = true;
      }

      // Bold today's day in the calendar
      if (date.getTime() === now.getTime()) {
        classes.push('gux-today');
      }

      // Check if the day is selected, and if so highlight it
      let isSelected = false;
      const selectedTimestamp = fromIsoDate(this.value).getTime();
      if (date.getTime() === selectedTimestamp) {
        isSelected = true;
        classes.push('gux-selected');
      }

      arr.push({
        class: classes.join(' '),
        date,
        hidden,
        disabled,
        selected: isSelected
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return arr;
  }

  /**
   *
   * @param arr A list of all days currently in the calendar
   * @param chunkSize The number of days per row in the calendar
   * @returns A list of rows, where each row has n number of days in it
   */
  organizeDaysIntoRows(
    arr: IDateElement[],
    chunkSize: number
  ): IDateElement[][] {
    const result: IDateElement[][] = [];
    for (let i = 0; i < chunkSize - 1; i++) {
      const week = arr.slice(i * chunkSize, i * chunkSize + chunkSize);
      if (this.weekShouldBeDisplayed(week)) {
        result.push(week);
      }
    }
    return result;
  }

  isFocusableDate(day: IDateElement): boolean {
    return day.selected || this.previewValue.getTime() === day.date.getTime();
  }

  weekShouldBeDisplayed(week: IDateElement[]): boolean {
    const hasNonHiddenDate = week.find(date => {
      return !date.hidden;
    });
    return week.length && !!hasNonHiddenDate;
  }

  getMonthDays(index: number): IDateElement[][] {
    const month = new Date(this.previewValue.getTime());
    month.setDate(1);
    month.setMonth(month.getMonth() + index);
    const monthIndex = month.getMonth();
    const year = month.getFullYear();
    const startDate = firstDateInMonth(monthIndex, year, this.startDayOfWeek);
    const datesArray = this.generateDatesFrom(monthIndex, startDate, 42);
    return this.organizeDaysIntoRows(datesArray, 7);
  }

  onDateClick(date: Date) {
    if (!this.outOfBounds(date)) {
      this.value = asIsoDate(date);
      this.previewValue = date;
      this.input.emit(this.value);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.onDateClick(this.previewValue);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.previewValue = new Date(
          this.previewValue.setDate(this.previewValue.getDate() + 7)
        );
        afterNextRenderTimeout(() => {
          void this.focusPreviewDate();
        });
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.previewValue = new Date(
          this.previewValue.setDate(this.previewValue.getDate() - 7)
        );
        afterNextRenderTimeout(() => {
          void this.focusPreviewDate();
        });
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.previewValue = new Date(
          this.previewValue.setDate(this.previewValue.getDate() - 1)
        );
        afterNextRenderTimeout(() => {
          void this.focusPreviewDate();
        });
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.previewValue = new Date(
          this.previewValue.setDate(this.previewValue.getDate() + 1)
        );
        afterNextRenderTimeout(() => {
          void this.focusPreviewDate();
        });
        break;
      case 'PageUp':
        this.incrementPreviewDateByMonth(1);
        break;
      case 'PageDown':
        this.incrementPreviewDateByMonth(-1);
        break;
    }
  }

  componentWillLoad() {
    trackComponent(this.root, { variant: CalendarModes.Single });
    this.locale = getDesiredLocale(this.root);

    this.startDayOfWeek = this.startDayOfWeek || getStartOfWeek(this.locale);

    if (!this.value) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      this.value = asIsoDate(now);
    }

    this.previewValue = fromIsoDate(this.value);
  }

  renderMonthHeader() {
    return (
      <div class="gux-month-list">
        {Array.from(Array(this.numberOfMonths).keys()).map(index => {
          const offsetMonthDate = getOffsetMonthDate(this.previewValue, index);
          return (
            <label>
              {getDateMonthAndYearString(offsetMonthDate, this.locale)}
            </label>
          ) as JSX.Element;
        })}
      </div>
    ) as JSX.Element;
  }

  renderCalendar(index: number) {
    return (
      <div class="gux-date-picker-content">
        <div class="gux-date-picker-header">
          {getWeekdays(this.locale, this.startDayOfWeek).map(
            day => (<div class="gux-header-day">{day}</div>) as JSX.Element
          )}
        </div>
        {this.getMonthDays(index).map(
          week =>
            (
              <div class="gux-day-container">
                {week.map(
                  day =>
                    (
                      <div
                        tabindex={this.isFocusableDate(day) ? '0' : '-1'}
                        class={`gux-day-value ${day.class}`}
                        aria-hidden={day.hidden ? 'true' : 'false'}
                        aria-disabled={day.disabled ? 'true' : 'false'}
                        data-date={day.date.getTime()}
                        onClick={() => void this.onDateClick(day.date)}
                        onKeyDown={e => void this.onKeyDown(e)}
                      >
                        {day.date.getDate()}
                        <span class="gux-sr-only">
                          {getDateMonthAndYearString(day.date, this.locale)}
                        </span>
                      </div>
                    ) as JSX.Element
                )}
              </div>
            ) as JSX.Element
        )}
      </div>
    ) as JSX.Element;
  }

  render() {
    return (
      <div class="gux-date-picker">
        <div class="gux-header">
          <button
            type="button"
            class="gux-left"
            onClick={() => this.incrementPreviewDateByMonth(-1)}
            tabindex="-1"
            aria-hidden="true"
          >
            <gux-icon decorative icon-name="chevron-small-left"></gux-icon>
          </button>
          {this.renderMonthHeader()}
          <button
            type="button"
            class="gux-right"
            onClick={() => this.incrementPreviewDateByMonth(1)}
            tabindex="-1"
            aria-hidden="true"
          >
            <gux-icon decorative icon-name="chevron-small-right"></gux-icon>
          </button>
        </div>
        <div class="gux-content">
          {Array.from(Array(this.numberOfMonths).keys()).map(index =>
            this.renderCalendar(index)
          )}
        </div>
      </div>
    ) as JSX.Element;
  }
}
