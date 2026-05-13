/**
 * Thin console wrapper that suppresses `log` and `info` in production
 * builds while always forwarding `warn` and `error`.
 *
 * Use this for diagnostic / breadcrumb output. Never use it for messages
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
