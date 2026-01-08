import { ModuleLoader } from "./modules/core/ModuleLoader";
import { UrlWatcher } from "./modules/core/UrlWatcher";
import { TestModule } from "./modules/test";
import { TimetableExporter } from "./modules/timetable-exporter/timetable-exporter";
import { VismaWrapped } from "./modules/vismawrapped";

(async function () {
  const moduleLoader = new ModuleLoader([
    new TestModule(),
    new VismaWrapped(),
    new TimetableExporter(),
  ]);

  const watcher = new UrlWatcher((url: string) => {
    moduleLoader.handleUrlChange(url);
  });

  watcher.start();

  moduleLoader.handleUrlChange(window.location.href);
})();
