import { Injectable } from "./Injectable";

export abstract class VismaModule {
  abstract name: string;
  description?: string;

  abstract shouldLoad(url: string): boolean;

  // for dom
  injectables(): Injectable[] {
    return [];
  }

  // non-dom
  onLoad?(): void;
  onUnload?(): void;

  _loaded = false;
}
