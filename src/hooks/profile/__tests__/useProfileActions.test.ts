import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const insertMock = vi.fn();
const selectMock = vi.fn();
const singleMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      insert: (rows: unknown[]) => {
        insertMock(rows);
        return {
          select: () => {
            selectMock();
            return { single: () => singleMock() };
          },
        };
      },
    }),
  },
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

import { DEFAULT_PROFILE_ROLE } from "@/lib/appRole";
import { useProfileActions } from "../useProfileActions";

describe("useProfileActions.createProfile", () => {
  beforeEach(() => {
    insertMock.mockReset();
    selectMock.mockReset();
    singleMock.mockReset();
    singleMock.mockResolvedValue({ data: { id: "u1" }, error: null });
  });

  it("inserts new profiles with the default app role", async () => {
    const { result } = renderHook(() => useProfileActions());

    await result.current.createProfile("u1", "tech@example.com");

    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "u1",
        email: "tech@example.com",
        role: DEFAULT_PROFILE_ROLE,
      }),
    ]);
  });
});
