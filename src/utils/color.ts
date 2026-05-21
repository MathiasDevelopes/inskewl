export function normHex(raw: string): string {
  const stripped = raw.replace(/^#/, "");
  if (/^[0-9a-f]{6}$/i.test(stripped)) return `#${stripped}`;
  if (/^[0-9a-f]{3}$/i.test(stripped)) {
    const [r, g, b] = stripped;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#5c6bc0";
}

export function textColorForBg(hex: string): string {
  const h = normHex(hex).replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#222" : "#fff";
}
