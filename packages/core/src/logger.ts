const PREFIX = "[inskewl]";

type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, scope: string, message: string, ...args: unknown[]): void {
  console[level](`${PREFIX} [${scope}] ${message}`, ...args);
}

export function createLogger(scope: string) {
  return {
    info: (message: string, ...args: unknown[]) => log("info", scope, message, ...args),
    warn: (message: string, ...args: unknown[]) => log("warn", scope, message, ...args),
    error: (message: string, ...args: unknown[]) => log("error", scope, message, ...args),
    debug: (message: string, ...args: unknown[]) => log("debug", scope, message, ...args),
  };
}
