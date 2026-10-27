import { describe, expect, it } from "vitest";
import { isTechnicianBlockedPath, toNavRole } from "../navRole";

describe("navRole", () => {
  it("maps profile roles to nav roles", () => {
    expect(toNavRole("administrator")).toBe("admin");
    expect(toNavRole("technician")).toBe("technician");
    expect(toNavRole("manager")).toBe("manager");
  });

  it("blocks billing and import for technicians", () => {
    expect(isTechnicianBlockedPath("/billing")).toBe(true);
    expect(isTechnicianBlockedPath("/import/history")).toBe(true);
    expect(isTechnicianBlockedPath("/work-orders")).toBe(false);
  });
});
