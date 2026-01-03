import { DomInjector } from "./DOMInjector";
import { VismaModule } from "./VismaModule";

export class ModuleLoader {
  private injector = new DomInjector();
  private observer: MutationObserver;

  constructor(private modules: VismaModule[]) {
    this.observer = new MutationObserver(() => {
      for (const mod of this.modules) {
        if (mod._loaded) {
          this.injector.inject(mod);
        }
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  public handleUrlChange(url: string) {
    for (const mod of this.modules) {
      const should = mod.shouldLoad(url);

      if (should && !mod._loaded) {
        mod.onLoad?.();
        this.injector.inject(mod);
        mod._loaded = true;
        console.log(`inskewl: ${mod.name} loaded.`);
      } else if (!should && mod._loaded) {
        this.injector.eject(mod);
        mod.onUnload?.();
        mod._loaded = false;
        console.log(`inskewl: ${mod.name} unloaded.`);
      }
    }
  }

  destroy() {
    this.observer.disconnect();
  }
}
