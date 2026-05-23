import { DomInjector } from "./DOMInjector";
import { VismaModule } from "./VismaModule";

export class ModuleLoader {
  private injector = new DomInjector();
  private observer: MutationObserver;
  private mutationTimeout: number | null = null;

  constructor(private modules: VismaModule[]) {
    this.observer = new MutationObserver(() => {
      for (const mod of this.modules) {
        if (mod._loaded) {
          try {
            this.injector.inject(mod);
          } catch (e) {
            console.error(`[inskewl] Error injecting ${mod.name}:`, e);
          }
        }
      }

      if (this.mutationTimeout) {
        clearTimeout(this.mutationTimeout);
      }
      this.mutationTimeout = window.setTimeout(() => {
        for (const mod of this.modules) {
          if (mod._loaded) {
            try {
              mod.onMutation?.();
            } catch (e) {
              console.error(`[inskewl] Error in ${mod.name}.onMutation:`, e);
            }
          }
        }
      }, 100);
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  public handleUrlChange(url: string) {
    for (const mod of this.modules) {
      const should = mod.shouldLoad(url);

      if (should && !mod._loaded) {
        try {
          mod.onLoad?.();
          this.injector.inject(mod);
          mod._loaded = true;
          console.log(`inskewl: ${mod.name} loaded.`);
        } catch (e) {
          console.error(`[inskewl] Error loading ${mod.name}:`, e);
        }
      } else if (!should && mod._loaded) {
        try {
          this.injector.eject(mod);
          mod.onUnload?.();
          mod._loaded = false;
          console.log(`inskewl: ${mod.name} unloaded.`);
        } catch (e) {
          console.error(`[inskewl] Error unloading ${mod.name}:`, e);
        }
      }
    }
  }

  destroy() {
    this.observer.disconnect();
    if (this.mutationTimeout) {
      clearTimeout(this.mutationTimeout);
    }
  }
}
