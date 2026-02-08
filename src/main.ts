import { ModuleLoader } from "./modules/core/ModuleLoader";
import { UrlWatcher } from "./modules/core/UrlWatcher";
import { TimetableExporter } from "./modules/timetable-exporter/timetable-exporter";
import { VismaWrapped } from "./modules/vismawrapped";
import { testAllApiSchemas } from "./api/testSchemas";

// Expose API schema test function to global window context
declare global {
  interface Window {
    testAllApiSchemas?: typeof testAllApiSchemas;
  }
}

if (typeof window !== "undefined" && !("testAllApiSchemas" in window)) {
  Object.defineProperty(window, "testAllApiSchemas", {
    value: testAllApiSchemas,
    writable: false,
    configurable: true,
  });
}

(async function () {
  const moduleLoader = new ModuleLoader([
    new VismaWrapped(),
    new TimetableExporter(),
  ]);

  const watcher = new UrlWatcher((url: string) => {
    moduleLoader.handleUrlChange(url);
  });

  watcher.start();

  moduleLoader.handleUrlChange(window.location.href);
})();
