import { describe, expect, it } from "vitest";
import { PWA_APP_SHELL_NAVIGATE_ALLOWLIST } from "../pwaAppShellRoutes";

function matchesAppShell(path: string): boolean {
  return PWA_APP_SHELL_NAVIGATE_ALLOWLIST.some((re) => re.test(path));
}

describe("PWA app-shell navigate allowlist", () => {
  it("includes core app routes", () => {
    expect(matchesAppShell("/dashboard")).toBe(true);
    expect(matchesAppShell("/work-orders/abc")).toBe(true);
    expect(matchesAppShell("/scan")).toBe(true);
    expect(matchesAppShell("/reports/mttr")).toBe(true);
  });

  it("excludes marketing routes", () => {
    expect(matchesAppShell("/")).toBe(false);
    expect(matchesAppShell("/pricing")).toBe(false);
    expect(matchesAppShell("/learn/preventive-maintenance")).toBe(false);
    expect(matchesAppShell("/features")).toBe(false);
  });
});
