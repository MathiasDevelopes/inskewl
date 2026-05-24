export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  if (h === undefined || m === undefined) {
    throw new Error(`Invalid time format: ${time}. Expected HH:mm`);
  }
  return h * 60 + m;
}
