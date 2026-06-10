import { DomInjector } from "./DOMInjector";
import type { VismaModule } from "./VismaModule";
import { createLogger } from "../../utils/logger";

const logger = createLogger("ModuleLoader");

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
            logger.error(`Error injecting ${mod.name}:`, e);
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
              logger.error(`Error in ${mod.name}.onMutation:`, e);
            }
          }
        }
      }, 100);
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  public async handleUrlChange(url: string): Promise<void> {
    for (const mod of this.modules) {
      const should = mod.shouldLoad(url);

      if (should && !mod._loaded) {
        await this.loadModule(mod);
      } else if (!should && mod._loaded) {
        await this.unloadModule(mod);
      }
    }
  }

  private async loadModule(mod: VismaModule): Promise<void> {
    try {
      mod._loaded = true;
      this.injector.inject(mod);
    } catch (e) {
      mod._loaded = false;
      logger.error(`Error injecting ${mod.name}:`, e);
      return;
    }

    try {
      await mod.onLoad?.();
    } catch (e) {
      logger.error(`Error loading ${mod.name}:`, e);
    }

    logger.info(`${mod.name} loaded.`);
  }

  private async unloadModule(mod: VismaModule): Promise<void> {
    try {
      this.injector.eject(mod);
      await mod.onUnload?.();
      logger.info(`${mod.name} unloaded.`);
    } catch (e) {
      logger.error(`Error unloading ${mod.name}:`, e);
    } finally {
      mod._loaded = false;
    }
  }

  destroy() {
    this.observer.disconnect();
    if (this.mutationTimeout) {
      clearTimeout(this.mutationTimeout);
    }
  }
}
