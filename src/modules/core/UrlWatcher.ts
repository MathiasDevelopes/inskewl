import { createLogger } from "@inskewl/core";

const logger = createLogger("UrlWatcher");

export class UrlWatcher {
  private currentUrl: string;
  private readonly callback: (url: string) => void;
  private restore: (() => void) | null = null;

  constructor(callback: (url: string) => void) {
    this.currentUrl = window.location.href;
    this.callback = callback;
  }

  public start(): void {
    if (this.restore) return;

    const originalPush = history.pushState;
    const originalReplace = history.replaceState;
    const check = () => this.checkUrl();

    history.pushState = (...args: Parameters<History["pushState"]>) => {
      originalPush.apply(history, args);
      check();
    };
    history.replaceState = (...args: Parameters<History["replaceState"]>) => {
      originalReplace.apply(history, args);
      check();
    };
    window.addEventListener("popstate", check);
    window.addEventListener("hashchange", check);

    this.restore = () => {
      history.pushState = originalPush;
      history.replaceState = originalReplace;
      window.removeEventListener("popstate", check);
      window.removeEventListener("hashchange", check);
    };
  }

  public stop(): void {
    this.restore?.();
    this.restore = null;
  }

  private checkUrl(): void {
    if (window.location.href !== this.currentUrl) {
      this.currentUrl = window.location.href;
      logger.debug(`URL changed: ${window.location.pathname}`);
      this.callback(this.currentUrl);
    }
  }
}
