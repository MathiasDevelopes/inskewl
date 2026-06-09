export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  if (h === undefined || m === undefined) {
    throw new Error(`Invalid time format: ${time}. Expected HH:mm`);
  }
  return h * 60 + m;
}

export function startOfWeek(date: Date): Date {
  const weekStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const day = weekStart.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

export function addWeeks(date: Date, amount: number): Date {
  const next = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  next.setDate(next.getDate() + amount * 7);
  return next;
}

export function getWeekStartDates(startDate: Date, endDate: Date): Date[] {
  const weekStarts: Date[] = [];
  const currentDate = startOfWeek(startDate);
  const lastDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

  while (currentDate <= lastDate) {
    weekStarts.push(new Date(currentDate.getTime()));
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weekStarts;
}

export function getISOWeekNumber(date: Date): number {
  const utcDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const daysSinceYearStart =
    (utcDate.getTime() - yearStart.getTime()) / 86400000 + 1;

  return Math.ceil(daysSinceYearStart / 7);
}

export function formatWeekRange(
  date: Date,
  locale = "nb-NO",
  daysInWeek = 5,
): string {
  const start = startOfWeek(date);
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + daysInWeek - 1,
  );
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "long" });

  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}.-${end.getDate()}. ${monthFormatter.format(end)}`;
  }

  return `${start.getDate()}. ${monthFormatter.format(start)}-${end.getDate()}. ${monthFormatter.format(end)}`;
}
