export function getMonthAndYearDisplay(date: Date): string {
  return `${date.toLocaleString('default', {
    month: 'long'
  })} ${date.getFullYear()}`;
}

export function getFirstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
}

export function getWeekdays(
  locale: Intl.LocalesArgument,
  startDayOfWeek: number
): string[] {
  const days: string[] = [];
  // Sunday
  const day = new Date(1970, 0, 4);

  for (let i = 0; i < 7; i++) {
    const weekday = day.toLocaleString(locale, { weekday: 'narrow' });
    days.push(weekday);
    day.setDate(day.getDate() + 1);
  }

  return shiftArray(days, startDayOfWeek);
}

function shiftArray(arr: string[], n: number): string[] {
  const times = n > arr.length ? n % arr.length : n;

  return arr.concat(arr.splice(0, times));
}
