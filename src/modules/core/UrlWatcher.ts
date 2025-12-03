export class UrlWatcher {
  private currentUrl: string;
  private callback: (url: string) => void;

  constructor(callback: (url: string) => void) {
    this.currentUrl = window.location.href;
    this.callback = callback;
  }

  public start() {
    this.patchHistory();
    window.addEventListener("popstate", () => this.checkUrl());
    window.addEventListener("hashchange", () => this.checkUrl());
  }

  private patchHistory() {
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;

    // behold referanse til denne instansen
    const watcher = this;

    history.pushState = function (
      data: any,
      unused: string,
      url?: string | URL | null,
    ) {
      originalPush.call(history, data, unused, url);
      watcher.checkUrl(); // bruk watcher, ikke self
    };

    history.replaceState = function (
      data: any,
      unused: string,
      url?: string | URL | null,
    ) {
      originalReplace.call(history, data, unused, url);
      watcher.checkUrl(); // bruk watcher
    };
  }

  private checkUrl() {
    if (window.location.href !== this.currentUrl) {
      this.currentUrl = window.location.href;
      this.callback(this.currentUrl);
    }
  }
}
