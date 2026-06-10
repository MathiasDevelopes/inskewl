export type CssVarName = `--${string}`;
export type CssVarValue = string | null | undefined;
export type CssVars = Partial<Record<CssVarName, CssVarValue>>;

export function setCssVars(el: HTMLElement, vars: CssVars): void {
  for (const [name, value] of Object.entries(vars)) {
    if (value == null) {
      el.style.removeProperty(name);
    } else {
      el.style.setProperty(name, value);
    }
  }
}

export function px(value: number): string {
  return `${value}px`;
}

export function pct(value: number): string {
  return `${value}%`;
}
