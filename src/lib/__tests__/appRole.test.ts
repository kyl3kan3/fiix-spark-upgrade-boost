import { describe, expect, it } from "vitest";
import { roles } from "@/components/team/roles/roleDefinitions";
import {
  DEFAULT_PROFILE_ROLE,
  buildNewProfileInsert,
} from "@/lib/appRole";
import { toNavRole } from "@/lib/navRole";

describe("appRole", () => {
  it("uses technician as the default profile role aligned with app_role", () => {
    expect(DEFAULT_PROFILE_ROLE).toBe("technician");
    expect(roles.some((r) => r.value === DEFAULT_PROFILE_ROLE)).toBe(true);
    expect(toNavRole(DEFAULT_PROFILE_ROLE)).toBe("technician");
  });

  it("buildNewProfileInsert assigns the default role", () => {
    expect(buildNewProfileInsert("user-1", "a@example.com")).toMatchObject({
      id: "user-1",
      email: "a@example.com",
      role: DEFAULT_PROFILE_ROLE,
    });
  });
});
