import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TemplateDownloadForm from "@/components/marketing/TemplateDownloadForm";
import { submitTemplateLead } from "@/services/marketingLeadService";

vi.mock("@/services/marketingLeadService", () => ({
  submitTemplateLead: vi.fn(),
}));

vi.mock("@/lib/analytics/marketingEvents", () => ({
  getAttributionMetadata: () => ({}),
  trackMarketingEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const renderForm = () => render(
  <TemplateDownloadForm
    sourceSlug="maintenance-log-template"
    templateTitle="Maintenance Log Template"
    downloadPath="/templates/downloads/maintenance-log-template.csv"
    downloadFilename="maintenance-log-template.csv"
  />,
);

describe("TemplateDownloadForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the download gated when the email is invalid", async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Work email"), { target: { value: "not-an-email" } });
    const submitButton = screen.getByRole("button", { name: "Download free CSV" });
    fireEvent.submit(submitButton.closest("form")!);

    expect(await screen.findByText("Enter a valid work email")).toBeInTheDocument();
    expect(submitTemplateLead).not.toHaveBeenCalled();
  });

  it("records the lead before exposing the repeat-download action", async () => {
    vi.mocked(submitTemplateLead).mockResolvedValue(undefined);
    const downloadClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    renderForm();

    fireEvent.change(screen.getByLabelText("Work email"), { target: { value: "operator@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Download free CSV" }));

    await waitFor(() => {
      expect(submitTemplateLead).toHaveBeenCalledWith(expect.objectContaining({
        email: "operator@example.com",
        sourceSlug: "maintenance-log-template",
        templateTitle: "Maintenance Log Template",
      }));
    });
    expect(await screen.findByText("Your template is downloading")).toBeInTheDocument();
    expect(downloadClick).toHaveBeenCalledOnce();
    downloadClick.mockRestore();
  });
});
