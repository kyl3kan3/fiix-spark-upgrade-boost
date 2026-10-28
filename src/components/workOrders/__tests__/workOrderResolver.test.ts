import { describe, expect, it } from "vitest";
import { zodResolver } from "@hookform/resolvers/zod";
import { workOrderFormSchema } from "../WorkOrderFormSchema";

describe("work order zod resolver", () => {
  it("returns field errors instead of throwing a ZodError (MAINTENEASE-F)", async () => {
    const resolver = zodResolver(workOrderFormSchema);
    const result = await resolver(
      { title: "QA", description: "abc", priority: "medium", status: "pending" } as never,
      undefined,
      { fields: {}, shouldUseNativeValidation: false } as never,
    );
    expect(result.errors.title?.message).toBe("Title must be at least 3 characters.");
  });

  it("accepts a short description", async () => {
    const resolver = zodResolver(workOrderFormSchema);
    const result = await resolver(
      { title: "Seal leak", description: "abc", priority: "medium", status: "pending" } as never,
      undefined,
      { fields: {}, shouldUseNativeValidation: false } as never,
    );
    expect(result.errors).toEqual({});
  });
});
