/**
 * Thin console wrapper. `log` and `info` are suppressed in production
 * builds; `warn` and `error` always pass through.
 *
 * Use this for diagnostic / breadcrumb output — never for messages
 * shown to end users.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
