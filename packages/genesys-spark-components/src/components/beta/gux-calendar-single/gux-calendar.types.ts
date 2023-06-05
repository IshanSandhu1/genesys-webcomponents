export interface IWeekElement {
  dates: IDateElement[];
}

export interface IDateElement {
  date: Date;
  disabled: boolean;
  selected: boolean;
}
