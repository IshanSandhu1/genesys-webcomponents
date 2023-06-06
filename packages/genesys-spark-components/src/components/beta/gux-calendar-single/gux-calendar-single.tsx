import { Component, Element, h, JSX, State } from '@stencil/core';
import { hasSlot } from '@utils/dom/has-slot';
import { IWeekElement, GuxCalendarDayOfWeek } from './gux-calendar.types';
import { afterNextRenderTimeout } from '@utils/dom/after-next-render';
import { fromIsoDate } from '@utils/date/iso-dates';
import { getMonthAndYearDisplay, getWeekdays } from '@utils/calendar/calendar';
import { getDesiredLocale, getStartOfWeek } from '../../../i18n';

@Component({
  styleUrl: 'gux-calendar-single.less',
  tag: 'gux-calendar-single',
  shadow: true
})
export class GuxCalendar {
  @Element()
  root: HTMLElement;

  @State()
  private value: Date = new Date();

  private locale: string = 'en';
  private input: HTMLInputElement;
  private startDayOfWeek: GuxCalendarDayOfWeek;

  componentWillLoad(): void {
    this.locale = getDesiredLocale(this.root);
    this.startDayOfWeek = this.startDayOfWeek || getStartOfWeek(this.locale);
    const hasDateSlot = hasSlot(this.root, 'date');
    if (!hasDateSlot) {
      return;
    }

    // Get date input slot element
    this.input = this.root.querySelector('input[slot="date"]');

    if (!this.input.value) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      this.value = now;
    } else {
      this.value = new Date(this.input.value);
      this.value.setHours(0, 0, 0, 0);
    }

    this.onSlotInputChange();
  }

  /**
   *  Set the selected calendar value when the slot input value changes
   */
  private onSlotInputChange(): void {
    this.input.addEventListener('input', () => {
      this.value = fromIsoDate(this.input.value);
      this.value.setHours(0, 0, 0, 0);
    });
  }

  private onDateClick(date: Date): void {
    this.value = date;
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
    this.value = new Date(
      this.value.getFullYear(),
      this.value.getMonth(),
      this.value.getDate() + newDayValue,
      0,
      0,
      0
    );
    this.setSlotInputValue(this.value);

    // Wait for render before focusing preview date
    afterNextRenderTimeout(() => {
      this.focusSelectedDate();
    });
  }

  private onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.onDateClick(this.value);
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
        this.incrementMonth();
        break;
      case 'PageDown':
        this.decrementMonth();
        break;
    }
  }

  private getMonthDays(): IWeekElement[] {
    const firstOfMonth = new Date(
      this.value.getFullYear(),
      this.value.getMonth(),
      1,
      0,
      0,
      0
    );
    const weeks = [];
    let currentWeek = { dates: [] };
    let weekDayIndex = 0;
    const currentMonth = firstOfMonth.getMonth();
    const firstDayOfMonthIndex = firstOfMonth.getDay();
    const totalDayCount = 42 + firstDayOfMonthIndex;
    const currentDate = new Date(
      firstOfMonth.getFullYear(),
      firstOfMonth.getMonth(),
      1,
      0,
      0,
      0
    );

    // We want to include backfilled days before the first day of the month. For instance, if the first of the month
    // lands on the 15th, then we want to backfill the 1st-14th. Make sure to account for the locale start day of the week.
    if (firstDayOfMonthIndex > 0) {
      currentDate.setDate(
        currentDate.getDate() - firstDayOfMonthIndex + this.startDayOfWeek
      );
    }
    for (let d = 0; d < totalDayCount; d += 1) {
      if (weekDayIndex % 7 === 0) {
        weeks.push(currentWeek);
        currentWeek = {
          dates: []
        };
      }
      currentWeek.dates.push({
        date: new Date(currentDate),
        disabled: currentMonth !== currentDate.getMonth(),
        selected: this.value.getTime() === currentDate.getTime()
      });
      weekDayIndex += 1;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return weeks as IWeekElement[];
  }

  private changeMonth(newMonthValue: number): void {
    this.value = new Date(
      this.value.getFullYear(),
      this.value.getMonth() + newMonthValue,
      1,
      0,
      0,
      0
    );
    this.setSlotInputValue(this.value);

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
      `.gux-content-date[data-date="${this.value.getTime()}"]`
    );
    if (target) {
      target.focus();
    }
  }

  private renderHeader(): JSX.Element {
    return (
      <div class="gux-header">
        <button
          type="button"
          class="gux-left"
          onClick={() => this.decrementMonth()}
        >
          <gux-icon decorative icon-name="chevron-small-left"></gux-icon>
        </button>
        <span class="gux-header-month-and-year">
          {getMonthAndYearDisplay(this.value)}
        </span>
        <button
          type="button"
          class="gux-right"
          onClick={() => this.incrementMonth()}
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
                          aria-label="Calendar Date"
                          role="button"
                          aria-selected={day.selected}
                          tabindex={day.selected ? '0' : '-1'}
                          onKeyDown={e => void this.onKeyDown(e)}
                          class={{
                            'gux-content-date': true,
                            'gux-disabled': day.disabled,
                            'gux-selected': day.selected
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
      <div class="gux-calendar-single">
        <slot aria-hidden="true" name="date" />
        {this.renderHeader()}
        {this.renderContent()}
      </div>
    ) as JSX.Element;
  }
}
