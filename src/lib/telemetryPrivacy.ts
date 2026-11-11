import type { ErrorEvent } from "@sentry/react";
// Keep diagnostic structure, never application payloads or identity-bearing URLs.
export function privateErrorEvent(event: Record<string, any>): ErrorEvent {
  const allowedTypes = new Set(["Error", "TypeError", "RangeError", "ReferenceError", "SyntaxError", "URIError", "AggregateError"]);
  const values = Array.isArray(event.exception?.values) ? event.exception.values : [];
  return {
    type: undefined,
    level: "error",
    platform: "javascript",
    exception: { values: values.slice(0, 5).map((value: any) => ({
      type: allowedTypes.has(value.type) ? value.type : "Error",
      value: "Application error",
      stacktrace: { frames: (Array.isArray(value.stacktrace?.frames) ? value.stacktrace.frames : [])
        .filter((frame: any) => typeof frame.filename === "string" && /\/(?:assets|static)\/[A-Za-z0-9_.-]+\.js(?:[?#].*)?$/.test(frame.filename))
        .slice(-30).map((frame: any) => ({
          filename: frame.filename.split(/[?#]/)[0].replace(/^https?:\/\/[^/]+/, ""),
          lineno: Number.isSafeInteger(frame.lineno) ? frame.lineno : undefined,
          colno: Number.isSafeInteger(frame.colno) ? frame.colno : undefined,
        })) },
    })) },
  };
}
