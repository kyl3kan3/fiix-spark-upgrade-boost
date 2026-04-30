import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { ChecklistFrequencies } from "@/types/checklists";

interface AssetLite {
  id: string;
  name: string;
  serial_number?: string | null;
  model?: string | null;
  location?: string | null;
  description?: string | null;
}

interface ChecklistLite {
  id: string;
  name: string;
  description?: string | null;
  frequency?: string;
  items?: { title: string; is_required?: boolean }[];
  asset_ids?: string[];
  asset_offsets?: Record<string, number>;
}

interface SetupSheetData {
  /** Title shown at the top of the page (defaults to "Equipment Setup Sheet"). */
  title?: string;
  assets: AssetLite[];
  /** Optional checklists to print after the equipment table, with attached units. */
  checklists?: ChecklistLite[];
}

const freqLabel = (v?: string) =>
  v ? ChecklistFrequencies.find((f) => f.value === v)?.label ?? v : "—";

const formatOffset = (m: number) => {
  if (!m) return "On time";
  if (m < 60) return `+${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `+${h}h ${r}m` : `+${h}h`;
};

/**
 * Generates a printable setup sheet PDF that lists equipment (with labels)
 * and any attached checklists. Designed to be printed and posted near
 * equipment for technicians to reference.
 */
export const generateSetupSheetPdf = (data: SetupSheetData): void => {
  try {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const title = data.title || "Equipment Setup Sheet";
    const companyName = localStorage.getItem("company_name") || "Your Company";

    // Header band
    doc.setFillColor(13, 71, 161);
    doc.rect(0, 0, pageWidth, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(title, margin, 38);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(companyName, margin, 56);

    const generated = new Date().toLocaleString();
    const dateText = `Generated ${generated}`;
    doc.text(dateText, pageWidth - margin - doc.getTextWidth(dateText), 56);

    let cursorY = 95;
    doc.setTextColor(0, 0, 0);

    // ---- Equipment table ----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Equipment", margin, cursorY);
    cursorY += 6;

    autoTable(doc, {
      startY: cursorY,
      head: [["#", "Label / Name", "Model", "Serial #", "Location", "Notes"]],
      body: data.assets.map((a, i) => [
        String(i + 1),
        a.name || "—",
        a.model || "—",
        a.serial_number || "—",
        a.location || "—",
        a.description || "",
      ]),
      styles: { fontSize: 9, cellPadding: 5, valign: "middle" },
      headStyles: { fillColor: [13, 71, 161], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 28, halign: "center" },
        1: { cellWidth: 130, fontStyle: "bold" },
        2: { cellWidth: 80 },
        3: { cellWidth: 80 },
        4: { cellWidth: 90 },
        5: { cellWidth: "auto" },
      },
      margin: { left: margin, right: margin },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 24;

    // ---- Checklists ----
    const checklists = data.checklists || [];
    if (checklists.length > 0) {
      const assetById = new Map(data.assets.map((a) => [a.id, a]));

      checklists.forEach((cl, idx) => {
        const items = cl.items || [];
        const linkedAssets = (cl.asset_ids || [])
          .map((id) => ({ id, asset: assetById.get(id) }))
          .filter((x) => x.asset);

        // Estimate space needed; if not enough, new page
        const estHeight =
          90 +
          items.length * 18 +
          (linkedAssets.length ? 40 + linkedAssets.length * 18 : 0);
        if (cursorY + estHeight > pageHeight - 60) {
          doc.addPage();
          cursorY = margin;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(
          `${idx === 0 ? "Attached Checklists" : ""}`,
          margin,
          cursorY,
        );
        if (idx === 0) cursorY += 18;

        // Checklist heading box
        doc.setFillColor(238, 242, 247);
        doc.rect(margin, cursorY, pageWidth - margin * 2, 36, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(13, 71, 161);
        doc.text(cl.name, margin + 10, cursorY + 16);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(
          `Frequency: ${freqLabel(cl.frequency)}   ·   ${items.length} item${
            items.length === 1 ? "" : "s"
          }   ·   ${linkedAssets.length} unit${linkedAssets.length === 1 ? "" : "s"}`,
          margin + 10,
          cursorY + 30,
        );
        doc.setTextColor(0, 0, 0);
        cursorY += 44;

        if (cl.description) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          const descLines = doc.splitTextToSize(cl.description, pageWidth - margin * 2);
          doc.text(descLines, margin, cursorY);
          cursorY += descLines.length * 11 + 6;
          doc.setFont("helvetica", "normal");
        }

        // Inspection items table (with a sign-off column)
        if (items.length > 0) {
          autoTable(doc, {
            startY: cursorY,
            head: [["#", "Inspection item", "Required", "✓"]],
            body: items.map((it, i) => [
              String(i + 1),
              it.title,
              it.is_required ? "Yes" : "No",
              "",
            ]),
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [55, 65, 81], textColor: 255 },
            columnStyles: {
              0: { cellWidth: 28, halign: "center" },
              1: { cellWidth: "auto" },
              2: { cellWidth: 60, halign: "center" },
              3: { cellWidth: 40, halign: "center" },
            },
            margin: { left: margin, right: margin },
          });
          cursorY = (doc as any).lastAutoTable.finalY + 12;
        }

        // Linked assets with stagger
        if (linkedAssets.length > 0) {
          if (cursorY + 30 + linkedAssets.length * 16 > pageHeight - 60) {
            doc.addPage();
            cursorY = margin;
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text("Applies to equipment", margin, cursorY);
          cursorY += 4;
          autoTable(doc, {
            startY: cursorY,
            head: [["#", "Label", "Serial #", "Location", "Stagger"]],
            body: linkedAssets.map(({ id, asset }, i) => [
              String(i + 1),
              asset!.name || "—",
              asset!.serial_number || "—",
              asset!.location || "—",
              formatOffset(cl.asset_offsets?.[id] ?? 0),
            ]),
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [100, 116, 139], textColor: 255 },
            columnStyles: {
              0: { cellWidth: 28, halign: "center" },
              1: { cellWidth: 150, fontStyle: "bold" },
              2: { cellWidth: 90 },
              3: { cellWidth: 110 },
              4: { cellWidth: "auto", halign: "center" },
            },
            margin: { left: margin, right: margin },
          });
          cursorY = (doc as any).lastAutoTable.finalY + 16;
        }

        // Sign-off line
        if (cursorY + 30 > pageHeight - 60) {
          doc.addPage();
          cursorY = margin;
        }
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text("Technician: _______________________", margin, cursorY + 14);
        doc.text("Date: ____ / ____ / ______", margin + 260, cursorY + 14);
        doc.text("Signature: _______________________", margin + 380, cursorY + 14);
        doc.setTextColor(0, 0, 0);
        cursorY += 32;
      });
    }

    // ---- Footer with page numbers ----
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const footer = `${companyName}   ·   ${title}   ·   Page ${i} of ${pageCount}`;
      doc.text(footer, pageWidth / 2, pageHeight - 20, { align: "center" });
    }

    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    doc.save(`${safeTitle || "setup-sheet"}-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("Setup sheet downloaded");
  } catch (err: any) {
    console.error("Failed to generate setup sheet PDF", err);
    toast.error("Could not generate PDF", { description: err?.message });
  }
};