export type Placement = "append" | "prepend" | "before" | "after";

export interface Injectable {
  id: string;
  target: string;
  placement: Placement;

  render(): HTMLElement;

  destroy?(el: HTMLElement): void;
}
