import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import { WorkOrderCompletePartsDialog } from "./WorkOrderCompletePartsDialog";
import { completeWorkOrderWithUsage } from "@/services/workOrderService";

vi.mock("@/hooks/useSubscription", () => ({ useHasFeature: (key: string) => key === "parts_inventory" }));
vi.mock("@/hooks/useMaintenanceCodes", () => ({ useMaintenanceCodes: () => ({ codes: [] }) }));
vi.mock("@/services/partsService", () => ({
  fetchParts: async () => [],
  fetchPartsForAsset: async () => [{ id: "linked", name: "Linked part" }],
}));
vi.mock("@/services/workOrderService", () => ({ completeWorkOrderWithUsage: vi.fn() }));
vi.mock("@/services/scanService", () => ({
  scanPart: async (value: string) => {
    if (value !== "00123") throw new Error("No matching record found.");
    return { id: "belt", name: "Belt", quantity_on_hand: 5, unit_of_measure: "ea" };
  },
}));

it("reviews repeated scans of a part outside the asset list before recording usage", async () => {
  vi.mocked(completeWorkOrderWithUsage).mockRejectedValueOnce(new Error("Insufficient stock"))
    .mockResolvedValueOnce(true);
  const onCompleted = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <WorkOrderCompletePartsDialog open onOpenChange={() => {}} workOrderId="job" assetId="asset"
        onCompleted={onCompleted} />
    </QueryClientProvider>,
  );
  await screen.findByText("Linked part");
  const enterCode = (value: string) => {
    fireEvent.change(screen.getByRole("textbox", { name: "Barcode or QR value" }), { target: { value } });
    fireEvent.click(screen.getByRole("button", { name: "Look up" }));
  };
  fireEvent.click(screen.getByRole("button", { name: "Scan a part" }));
  enterCode("unknown");
  expect(await screen.findByRole("alert")).toHaveTextContent("No matching record");
  enterCode("00123");
  const quantity = await screen.findByRole("spinbutton", { name: "Quantity used for Belt" });
  expect(quantity).toHaveValue(1);
  fireEvent.click(screen.getByRole("button", { name: "Scan a part" }));
  enterCode("00123");
  await waitFor(() => expect(quantity).toHaveValue(2));
  expect(completeWorkOrderWithUsage).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Complete job" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Insufficient stock");
  expect(onCompleted).not.toHaveBeenCalled();
  expect(quantity).toHaveValue(2);
  fireEvent.click(screen.getByRole("button", { name: "Complete job" }));
  await waitFor(() => expect(onCompleted).toHaveBeenCalledOnce());
  expect(completeWorkOrderWithUsage).toHaveBeenLastCalledWith("job", expect.objectContaining({
    parts: [{ part_id: "belt", quantity: 2 }], lubricants: [],
  }));
});
