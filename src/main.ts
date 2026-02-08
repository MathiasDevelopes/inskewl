import { ModuleLoader } from "./modules/core/ModuleLoader";
import { UrlWatcher } from "./modules/core/UrlWatcher";
import { TestModule } from "./modules/test";
import { TimetableExporter } from "./modules/timetable-exporter/timetable-exporter";
import { VismaWrapped } from "./modules/vismawrapped";
import { testAllApiSchemas } from "./api/testSchemas";

// Expose API schema test function to global window context
declare global {
  interface Window {
    testAllApiSchemas: typeof testAllApiSchemas;
  }
}

window.testAllApiSchemas = testAllApiSchemas;

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
