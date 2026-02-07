/**
 *
 * @param date A date in the format dd/mm/yyyy
 * @param time A clock in the time format 23:59
 * @returns Date
 */
export function makeDate(date: string, time: string): Date {
  const [d, m, y] = date.split("/");
  const [h, min] = time.split(":");

  return new Date(
    Number(y),
    Number(m) - 1, // for index
    Number(d),
    Number(h),
    Number(min),
  );
}

/**
 * Transforms a date string in dd/mm/yyyy format to a Date object
 * @param dateStr A date in the format dd/mm/yyyy
 * @returns Date
 */
export function transformDDMMYYYY(dateStr: string): Date {
  const [d, m, y] = dateStr.split("/");
  return new Date(Number(y), Number(m) - 1, Number(d));
}

/**
 * Transforms an ISO date string to a Date object
 * @param isoDate An ISO date string (e.g., "2023-12-31")
 * @returns Date
 */
export function transformISODate(isoDate: string): Date {
  return new Date(isoDate);
}

/**
 * Transforms an ISO datetime string to a Date object
 * @param isoDatetime An ISO datetime string (e.g., "2023-12-31T12:00:00")
 * @returns Date
 */
export function transformISODateTime(isoDatetime: string): Date {
  return new Date(isoDatetime);
}

/**
 * Combines a Date object with a time string to create a new Date with that time
 * @param date A Date object
 * @param time A time string in HH:mm format
 * @returns Date with the specified time
 */
export function combineDateWithTime(date: Date, time: string): Date {
  const [h, min] = time.split(":");
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Number(h),
    Number(min),
  );
}
