import { afterEach, describe, expect, it, vi } from "vitest";
import {
  hasWindowLoadCompleted,
  resetWindowLoadGateForTests,
  scheduleIdleTask,
  shouldDeferAuthBootstrap,
} from "@/lib/deferAuthBootstrap";

describe("shouldDeferAuthBootstrap", () => {
  it("skips bootstrap on indexable marketing routes", () => {
    expect(shouldDeferAuthBootstrap("/")).toBe(true);
    expect(shouldDeferAuthBootstrap("/pricing")).toBe(true);
    expect(shouldDeferAuthBootstrap("/best-cmms-software-for-small-business")).toBe(true);
  });

  it("does not defer on auth or app routes", () => {
    expect(shouldDeferAuthBootstrap("/auth")).toBe(false);
    expect(shouldDeferAuthBootstrap("/dashboard")).toBe(false);
    expect(shouldDeferAuthBootstrap("/billing")).toBe(false);
  });
});

describe("window load gate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("tracks window load separately from document.readyState", () => {
    const readyState = Object.getOwnPropertyDescriptor(document, "readyState");
    Object.defineProperty(document, "readyState", {
      configurable: true,
      get: () => "complete",
    });

    try {
      resetWindowLoadGateForTests();
      expect(hasWindowLoadCompleted()).toBe(false);

      const task = vi.fn();
      scheduleIdleTask(task);
      expect(task).not.toHaveBeenCalled();

      window.dispatchEvent(new Event("load"));
      expect(hasWindowLoadCompleted()).toBe(true);
    } finally {
      if (readyState) {
        Object.defineProperty(document, "readyState", readyState);
      }
    }
  });
});