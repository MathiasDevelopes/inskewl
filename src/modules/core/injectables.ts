import { createDropdownItem } from "../../utils/dom";
import type { Injectable, Placement } from "./Injectable";

interface DropdownActionOptions {
  id: string;
  buttonId: string;
  label: string;
  onClick: () => void;
  target?: string;
  placement?: Placement;
}

export function dropdownAction({
  id,
  buttonId,
  label,
  onClick,
  target = "ul.dropdown-menu",
  placement = "append",
}: DropdownActionOptions): Injectable {
  return {
    id,
    target,
    placement,
    render: () => createDropdownItem(buttonId, label, onClick),
  };
}
