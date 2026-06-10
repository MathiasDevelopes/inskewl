import { INSKEWL_UI_STYLES } from "./styles";

const STYLE_ID = "inskewl-ui-styles";

export function installInskewlUi(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = INSKEWL_UI_STYLES;
  document.head.appendChild(style);
}
