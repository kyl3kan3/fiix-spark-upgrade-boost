import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import ScanPage from "../ScanPage";
import { adjustPartStock } from "@/services/partsService";

vi.mock("@/components/dashboard/DashboardLayout", () => ({ default: ({ children }: React.PropsWithChildren) => children }));
vi.mock("@/components/billing/PaywallGate", () => ({ PaywallGate: ({ children }: React.PropsWithChildren) => children }));
vi.mock("@/services/scanService", () => ({
  scanRecord: async () => ({ kind: "part", id: "belt", part: {
    id: "belt", name: "Pump belt", quantity_on_hand: 5, unit_of_measure: "ea",
  } }),
}));
vi.mock("@/services/partsService", () => ({ adjustPartStock: vi.fn().mockResolvedValue({}) }));

it("shows the matched part and waits for a confirmed stock adjustment", async () => {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={new QueryClient()}><ScanPage /></QueryClientProvider>
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByRole("textbox", { name: "Barcode or QR value" }), { target: { value: "00123" } });
  fireEvent.click(screen.getByRole("button", { name: "Look up" }));
  expect(await screen.findByRole("dialog", { name: "Adjust stock — Pump belt" })).toBeInTheDocument();
  expect(screen.getByText("On hand: 5 ea")).toBeInTheDocument();
  expect(adjustPartStock).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole("spinbutton", { name: "Quantity" }), { target: { value: "3" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await waitFor(() => expect(adjustPartStock).toHaveBeenCalledWith("belt", "receive", 3, undefined));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});
