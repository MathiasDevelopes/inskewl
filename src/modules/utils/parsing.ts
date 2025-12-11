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
