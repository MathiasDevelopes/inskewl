export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function createDropdownItem(id: string, text: string, onClick: () => void): HTMLElement {
  const li = document.createElement("li");
  li.setAttribute("role", "menuitem");
  li.setAttribute("tabindex", "-1");

  const btn = document.createElement("button");
  btn.id = id;
  btn.className = "vsware-capitalize dropdown-item";

  const firstItem = document.querySelector("ul.dropdown-menu li");
  if (firstItem) {
    const dataVAttr = [...firstItem.attributes].find((attr) =>
      attr.name.startsWith("data-v"),
    )?.name;
    if (dataVAttr) btn.setAttribute(dataVAttr, "");
  }

  btn.textContent = text;
  btn.onclick = onClick;
  li.appendChild(btn);
  return li;
}
