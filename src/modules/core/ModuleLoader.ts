import { VismaModule } from "./VismaModule";

export class ModuleLoader {
  private modules: VismaModule[];

  constructor(modules: VismaModule[]) {
    this.modules = modules;
  }

  public handleUrlChange(url: string) {
    for (const mod of this.modules) {
      if (mod.shouldLoad(url) && !mod.isLoaded) {
        mod.load();
        mod.isLoaded = true;
        console.log(`inskewl: ${mod.name} loaded.`);
      } else if (!mod.shouldLoad(url) && mod.isLoaded) {
        mod.unload?.();
        mod.isLoaded = false;
        console.log(`inskewl: ${mod.name} unloaded.`);
      }
    }
  }
}
