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
 * @throws Error if the date format is invalid
 */
export function transformDDMMYYYY(dateStr: string): Date {
  const parts = dateStr.split("/");
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateStr}. Expected dd/mm/yyyy`);
  }
  const [d, m, y] = parts.map(Number);
  if (isNaN(d) || isNaN(m) || isNaN(y)) {
    throw new Error(`Invalid date values: ${dateStr}`);
  }
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  return date;
}

/**
 * Transforms an ISO date string to a Date object
 * @param isoDate An ISO date string (e.g., "2023-12-31")
 * @returns Date
 * @throws Error if the ISO date is invalid
 */
export function transformISODate(isoDate: string): Date {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date: ${isoDate}`);
  }
  return date;
}

/**
 * Transforms an ISO datetime string to a Date object
 * @param isoDatetime An ISO datetime string (e.g., "2023-12-31T12:00:00")
 * @returns Date
 * @throws Error if the ISO datetime is invalid
 */
export function transformISODateTime(isoDatetime: string): Date {
  const date = new Date(isoDatetime);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO datetime: ${isoDatetime}`);
  }
  return date;
}

/**
 * Combines a Date object with a time string to create a new Date with that time
 * @param date A Date object
 * @param time A time string in HH:mm format
 * @returns Date with the specified time
 * @throws Error if the time format is invalid
 */
export function combineDateWithTime(date: Date, time: string): Date {
  const parts = time.split(":");
  if (parts.length !== 2) {
    throw new Error(`Invalid time format: ${time}. Expected HH:mm`);
  }
  const [h, min] = parts.map(Number);
  if (isNaN(h) || isNaN(min) || h < 0 || h > 23 || min < 0 || min > 59) {
    throw new Error(`Invalid time values: ${time}`);
  }
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    h,
    min,
  );
}
