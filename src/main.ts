import { ModuleLoader } from "./modules/core/ModuleLoader";
import { UrlWatcher } from "./modules/core/UrlWatcher";
import { TestModule } from "./modules/test";
import { TimetableToICS } from "./modules/timetabletoics";

(async function () {
  const moduleLoader = new ModuleLoader([new TestModule()]);

  const watcher = new UrlWatcher((url: string) => {
    moduleLoader.handleUrlChange(url);
  });

  watcher.start();

  moduleLoader.handleUrlChange(window.location.href);
})();
