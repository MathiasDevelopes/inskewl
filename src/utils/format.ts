export function round(n: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

export function fmt(n: number): string {
  const r = round(n);
  return r % 1 === 0 ? r.toFixed(0) : r.toFixed(1);
}

export function fmtPct(n: number): string {
  return round(n, 2).toFixed(2);
}
