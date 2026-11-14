/** Downloads a sample .xlsx the user can fill in and re-import. */
export async function downloadExcelTemplate(): Promise<void> {
  const XLSX = await import("xlsx");
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

/** Downloads a .docx that round-trips through the Word importer. */
export async function downloadWordTemplate() {
  const { Document, Packer, Paragraph } = await import("docx");
  const lines = ["Check oil level", "Inspect belts", "Verify safety guards in place", "Test emergency stop button", "Record temperature readings"];
  const document = new Document({ sections: [{ children: lines.map(text => new Paragraph(text)) }] });
  const blob = await Packer.toBlob(document);
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = url;
  a.download = "checklist-template.docx";
  a.click();
  URL.revokeObjectURL(url);
}
