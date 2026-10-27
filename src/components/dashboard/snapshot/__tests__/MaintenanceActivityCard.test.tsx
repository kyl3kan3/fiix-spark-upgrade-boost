import { describe, expect, it, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { MaintenanceActivityCard } from "../MaintenanceActivityCard";

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart-mock">{children}</div>
  ),
  BarChart: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

vi.mock("@/hooks/dashboard/useMaintenanceActivity", () => ({
  useMaintenanceActivity: () => ({
    isLoading: false,
    totalActivity: 12,
    totalOpen: 4,
    weeks: [
      { label: "Oct 6", opened: 3, completed: 2, weekStart: new Date() },
      { label: "Oct 13", opened: 5, completed: 4, weekStart: new Date() },
      { label: "Oct 20", opened: 2, completed: 6, weekStart: new Date() },
      { label: "Oct 27", opened: 7, completed: 1, weekStart: new Date() },
    ],
    priorities: [
      { priority: "urgent", count: 1 },
      { priority: "high", count: 1 },
      { priority: "medium", count: 1 },
      { priority: "low", count: 1 },
    ],
  }),
}));

describe("MaintenanceActivityCard", () => {
  it("clips the screen-reader activity table so a 390px viewport does not grow horizontally", () => {
    const viewport = document.createElement("div");
    viewport.style.width = "390px";
    viewport.style.overflow = "auto";
    document.body.appendChild(viewport);

    const { container } = render(<MaintenanceActivityCard />, {
      container: viewport,
    });

    const a11yMount = container.querySelector('[data-testid="activity-chart-a11y"]');
    expect(a11yMount).toBeTruthy();
    expect(a11yMount).toHaveClass("overflow-hidden", "absolute", "max-w-px");

    expect(viewport.scrollWidth).toBeLessThanOrEqual(390);

    document.body.removeChild(viewport);
  });
});
