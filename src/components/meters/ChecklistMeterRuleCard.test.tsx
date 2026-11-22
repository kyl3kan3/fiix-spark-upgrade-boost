import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { saveChecklistMeterRule } from "@/services/meterService";
import { ChecklistMeterRuleCard } from "./ChecklistMeterRuleCard";

vi.mock("@/hooks/useSubscription", () => ({ useHasFeature: () => true }));
vi.mock("@/services/meterService", () => ({
  fetchChecklistMeterRule: async () => null,
  fetchMetersForAsset: async () => [{ id: "counter", name: "Odometer", unit: "mi", current_reading: 62000 }],
  saveChecklistMeterRule: vi.fn(),
}));

it("defaults to the current mileage and previews a historical last service before saving", async () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ChecklistMeterRuleCard checklistId="service" assetIds={["truck"]} />
    </QueryClientProvider>,
  );
  fireEvent.change(await screen.findByLabelText("Meter"), { target: { value: "counter" } });
  const lastService = screen.getByLabelText("Last service reading (mi)");
  expect(lastService).toHaveValue(62000);
  fireEvent.change(screen.getByLabelText("Service every (units)"), { target: { value: "5000" } });
  expect(screen.getByText(/Service due at 67000 mi/)).toBeInTheDocument();
  fireEvent.change(lastService, { target: { value: "63000" } });
  expect(screen.getByRole("button", { name: "Save meter rule" })).toBeDisabled();
  fireEvent.change(lastService, { target: { value: "60000" } });
  expect(screen.getByText(/Service due at 65000 mi/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Save meter rule" }));
  await waitFor(() => expect(saveChecklistMeterRule).toHaveBeenCalledWith({
    checklistId: "service", meterId: "counter", intervalUnits: 5000, createWorkOrder: true,
    expectedMeterId: undefined, initialServiceReading: 60000,
  }));
});
