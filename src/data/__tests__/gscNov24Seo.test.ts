import { describe, expect, it } from "vitest";
import { getGlossaryTerm } from "@/data/glossary";
import { getMaintenanceTemplate } from "@/data/maintenanceTemplates";
import { getSolution } from "@/data/solutions";

describe("GSC Nov 24 SEO copy", () => {
  it("targets asset-management-software meta, H1, and registry section", () => {
    const solution = getSolution("asset-management-software");
    expect(solution).toBeDefined();
    expect(solution?.metaTitle).toBe("CMMS Asset Registry and Asset Management Software");
    expect(solution?.metaTitle.length).toBeLessThanOrEqual(60);
    expect(solution?.h1).toBe("CMMS asset registry and asset management software");
    expect(solution?.metaDescription.length).toBeLessThanOrEqual(155);
    expect(solution?.registryFieldsHeading).toBe("CMMS asset registry fields");
    expect(solution?.registryFieldsPlainList).toBe(true);
    expect(solution?.registryFields?.map((row) => row.field)).toEqual([
      "Name",
      "Serial number",
      "Model",
      "Location",
      "Status",
      "Purchase date",
      "Description",
      "Parent asset",
      "Image",
    ]);
  });

  it("shortens maintenance MCP server title only", () => {
    const term = getGlossaryTerm("maintenance-mcp-server");
    expect(term?.metaTitle).toBe("Maintenance MCP Server");
    expect(term?.term).toBe("Maintenance MCP Server");
  });

  it("updates CMMS article H1 while keeping title", () => {
    const term = getGlossaryTerm("cmms");
    expect(term?.term).toBe("What Does CMMS Stand For?");
    expect(term?.metaTitle).toBe("What Does CMMS Stand For? CMMS Meaning & Systems Guide");
  });

  it("de-cannibalizes checklist vs templates index copy", () => {
    const checklist = getMaintenanceTemplate("preventive-maintenance-checklist");
    expect(checklist?.metaTitle).toBe("Preventive Maintenance Checklist Template");
    expect(checklist?.h1).toBe("Maintenance checklist template");
    expect(checklist?.metaDescription).toMatch(/maintenance checklist template/i);

    const log = getMaintenanceTemplate("maintenance-log-template");
    expect(log?.metaDescription.length).toBeLessThanOrEqual(155);
    expect(log?.metaDescription.toLowerCase()).toMatch(/free maintenance log template/);
  });
});