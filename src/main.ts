import { ModuleLoader } from "./modules/core/ModuleLoader";
import { UrlWatcher } from "./modules/core/UrlWatcher";
import { AttendanceCalculator } from "./modules/attendance-calculator/attendance-calculator";
import { TimetableExporter } from "./modules/timetable-exporter/timetable-exporter";
import { testAllApiSchemas } from "./api/testSchemas";
import { printDebugInfo } from "./debuginfo";
import { createLogger } from "@inskewl/core";
import { version } from "../package.json" with { type: "json" };

const logger = createLogger("main");

// Expose API schema test function to global window context
declare global {
  interface Window {
    testAllApiSchemas?: typeof testAllApiSchemas;
    debugInfo?: typeof printDebugInfo;
  }
}

if (!("testAllApiSchemas" in window)) {
  Object.defineProperty(window, "testAllApiSchemas", {
    value: testAllApiSchemas,
    writable: false,
    configurable: true,
  });
}

if (!("debugInfo" in window)) {
  Object.defineProperty(window, "debugInfo", {
    value: printDebugInfo,
    writable: false,
    configurable: true,
  });
}

logger.info(`v${version} starting.`);
const moduleLoader = new ModuleLoader([
  new AttendanceCalculator(),
  new TimetableExporter(),
]);

new UrlWatcher((url) => {
  void moduleLoader.handleUrlChange(url);
}).start();

void moduleLoader.handleUrlChange(window.location.href);
