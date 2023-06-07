export interface IWeekElement {
  dates: IDateElement[];
}

export interface IDateElement {
  date: Date;
  disabled: boolean;
  selected: boolean;
  previewed: boolean;
}

export type GuxCalendarDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
