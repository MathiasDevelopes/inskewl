import { Injectable } from "./Injectable";
import { createLogger } from "../../utils/logger";

export abstract class VismaModule {
  abstract name: string;
  abstract description: string;

  private _logger?: ReturnType<typeof createLogger>;

  protected get logger() {
    if (!this._logger) {
      this._logger = createLogger(this.name);
    }
    return this._logger;
  }

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
