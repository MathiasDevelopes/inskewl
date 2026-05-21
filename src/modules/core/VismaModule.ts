import { Injectable } from "./Injectable";

export abstract class VismaModule {
  abstract name: string;
  abstract description: string;

  abstract shouldLoad(url: string): boolean;

  // for dom
  injectables(): Injectable[] {
    return [];
  }

  // non-dom
  onLoad?(): void | Promise<void>;
  onUnload?(): void | Promise<void>;
  onMutation?(): void;

  _loaded = false;
}
