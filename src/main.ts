import { ModuleLoader } from "./modules/core/ModuleLoader";
import { UrlWatcher } from "./modules/core/UrlWatcher";
import { TestModule } from "./modules/test";
import { TimetableToICS } from "./modules/timetabletoics";
import { VismaWrapped } from "./modules/vismawrapped";

(async function () {
  const moduleLoader = new ModuleLoader([new VismaWrapped()]);

  const watcher = new UrlWatcher((url: string) => {
    moduleLoader.handleUrlChange(url);
  });

  watcher.start();

  moduleLoader.handleUrlChange(window.location.href);
})();
