import { Component, Element, h, JSX, Method, State } from '@stencil/core';
import { hasSlot } from '@utils/dom/has-slot';
import { IWeekElement } from './gux-calendar.types';
import { afterNextRenderTimeout } from '@utils/dom/after-next-render';
import { fromIsoDate } from '@utils/date/iso-dates';

@Component({
  styleUrl: 'gux-calendar-single.less',
  tag: 'gux-calendar-single',
  shadow: true
})
export class GuxCalendar {
  @Element()
  root: HTMLElement;

  private input: HTMLInputElement;

  @State()
  value: Date = new Date();

  onDateClick(date: Date): void {
    this.value = date;
    this.setSlotInputValue(date);
  }

  setSlotInputValue(date: Date) {
    this.input.value = date.toISOString().substring(0, 10);
  }

  setDateAfterArrowKeyPress(event: KeyboardEvent, newDayValue: number): void {
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
    afterNextRenderTimeout(() => {
      this.focusSelectedDate();
    });
  }

  onKeyDown(event: KeyboardEvent): void {
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

  componentWillLoad(): void {
    const hasDateSlot = hasSlot(this.root, 'date');
    if (!hasDateSlot) {
      return;
    }

    this.input = this.root.querySelector('input[slot="date"]');
    const valueProp = this.input.value;

    if (!valueProp) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      this.value = now;
    } else {
      this.value = new Date(valueProp);
      this.value.setHours(0, 0, 0, 0);
    }

    // Set the calendar selected value when the slot input value changes
    this.input.addEventListener('input', () => {
      this.value = fromIsoDate(this.input.value);
      this.value.setHours(0, 0, 0, 0);
    });
  }

  getMonthAndYearDisplay(): string {
    return `${this.value.toLocaleString('default', {
      month: 'long'
    })} ${this.value.getFullYear()}`;
  }

  getMonthHeader(): string[] {
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  }

  getFirstOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
  }

  getMonthDays(): IWeekElement[] {
    const firstOfMonth = this.getFirstOfMonth(this.value);
    const weeks = [];
    let currentWeek = { dates: [] };
    let weekDayIndex = 0;
    const currentMonth = firstOfMonth.getMonth();
    const firstDayOfMonthIndex = firstOfMonth.getDay();
    const totalDayCount = 42 + firstDayOfMonthIndex;
    const currentDate = this.getFirstOfMonth(firstOfMonth);

    // We want to include backfilled days before the first day of the month. For instance, if the first of the month
    // lands on the 15th, then we want to backfill the 1st-14th
    if (firstDayOfMonthIndex > 0) {
      currentDate.setDate(currentDate.getDate() - firstDayOfMonthIndex);
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

  changeMonth(newMonthValue: number): void {
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

  decrementMonth(): void {
    this.changeMonth(-1);
  }

  incrementMonth(): void {
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

  renderHeader(): JSX.Element {
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
          {this.getMonthAndYearDisplay()}
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

  renderContent(): JSX.Element {
    return (
      <div>
        <div class="gux-week-day-letters">
          {this.getMonthHeader().map(
            headerDay =>
              (
                <div class="gux-day-letter" aria-label="Week day">
                  {headerDay}
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
