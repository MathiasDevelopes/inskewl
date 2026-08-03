import { ModuleLoader } from "./modules/core/ModuleLoader";
import { UrlWatcher } from "./modules/core/UrlWatcher";
import { AttendanceCalculator } from "./modules/attendance-calculator/attendance-calculator";
import { TimetableExporter } from "./modules/timetable-exporter/timetable-exporter";
import { testAllApiSchemas } from "@inskewl/api-client";
import { printDebugInfo } from "./debuginfo";

// Expose API schema test function to global window context
declare global {
  interface Window {
    testAllApiSchemas?: typeof testAllApiSchemas;
    debugInfo?: typeof printDebugInfo;
  }
}

if (typeof window !== "undefined" && !("testAllApiSchemas" in window)) {
  Object.defineProperty(window, "testAllApiSchemas", {
    value: testAllApiSchemas,
    writable: false,
    configurable: true,
  });
}

if (typeof window !== "undefined" && !("debugInfo" in window)) {
  Object.defineProperty(window, "debugInfo", {
    value: printDebugInfo,
    writable: false,
    configurable: true,
  });
}

(async function () {
  const moduleLoader = new ModuleLoader([
    new AttendanceCalculator(),
    new TimetableExporter(),
  ]);

  const watcher = new UrlWatcher((url: string) => {
    void moduleLoader.handleUrlChange(url);
  });

  watcher.start();

  void moduleLoader.handleUrlChange(window.location.href);
})();
