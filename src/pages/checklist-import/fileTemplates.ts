import * as XLSX from "xlsx";

/** Downloads a sample .xlsx the user can fill in and re-import. */
export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ["Title", "Description", "Required"],
    ["Check oil level", "Inspect dipstick reading", "yes"],
    ["Inspect belts", "Look for cracks or fraying", "no"],
    ["Verify safety guards in place", "", "yes"],
  ]);
  ws["!cols"] = [{ wch: 32 }, { wch: 40 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, "Checklist");
  XLSX.writeFile(wb, "checklist-template.xlsx");
}

/** Downloads a sample Word-compatible doc the user can fill in and re-import. */
export function downloadWordTemplate() {
  const lines = [
    "Checklist Template",
    "",
    "Each non-empty line below becomes one checklist item.",
    "Numbering and bullets (1., -, *, •) are stripped automatically.",
    "",
    "1. Check oil level",
    "2. Inspect belts",
    "3. Verify safety guards in place",
    "- Test emergency stop button",
    "- Record temperature readings",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "checklist-template.doc";
  a.click();
  URL.revokeObjectURL(url);
}
