import jsPDF from "jspdf";
import autoTable, { type CellDef, type RowInput } from "jspdf-autotable";
import { toast } from "sonner";
import { ChecklistFrequencies } from "@/types/checklists";
import JsBarcode from "jsbarcode";

// jspdf-autotable extends the jsPDF instance with these properties.
// jsPDF's own types include getNumberOfPages on the internal namespace
// but earlier @types/jspdf releases don't, so re-declare both here.
type JsPDFWithAutoTable = jsPDF & {
  lastAutoTable: { finalY: number };
  internal: jsPDF["internal"] & { getNumberOfPages: () => number };
};

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
 * Returns the asset's scannable label/barcode value. Prefers the serial number,
 * otherwise derives a stable short code from the asset id (e.g. AST-AB12CD).
 */
export const getAssetBarcodeValue = (a: AssetLite): string => {
  const sn = (a.serial_number || "").trim();
  if (sn) return sn.toUpperCase();
  const compact = (a.id || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `AST-${compact.slice(0, 6) || "000000"}`;
};

/** Generate a Code128 barcode PNG data URL for the given value. */
const generateBarcodeDataUrl = (value: string): string | null => {
  try {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, value, {
      format: "CODE128",
      displayValue: false,
      margin: 0,
      height: 40,
      width: 1.4,
    });
    return canvas.toDataURL("image/png");
  } catch (e) {
    console.warn("Barcode generation failed for", value, e);
    return null;
  }
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

    // Pre-generate barcodes (one per asset) so the table render is sync.
    const barcodeByAsset = new Map<string, string | null>();
    data.assets.forEach((a) => {
      barcodeByAsset.set(a.id, generateBarcodeDataUrl(getAssetBarcodeValue(a)));
    });

    autoTable(doc, {
      startY: cursorY,
      head: [["#", "Label / Name", "Asset Barcode", "Model", "Location", "Notes"]],
      body: data.assets.map((a, i) => [
        String(i + 1),
        a.name || "—",
        getAssetBarcodeValue(a),
        a.model || "—",
        a.location || "—",
        a.description || "",
      ]),
      styles: { fontSize: 9, cellPadding: 5, valign: "middle" },
      headStyles: { fillColor: [13, 71, 161], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 28, halign: "center" },
        1: { cellWidth: 120, fontStyle: "bold" },
        2: { cellWidth: 130, halign: "center", minCellHeight: 46 },
        3: { cellWidth: 70 },
        4: { cellWidth: 80 },
        5: { cellWidth: "auto" },
      },
      margin: { left: margin, right: margin },
      didDrawCell: (hook) => {
        if (hook.section !== "body" || hook.column.index !== 2) return;
        const asset = data.assets[hook.row.index];
        if (!asset) return;
        const dataUrl = barcodeByAsset.get(asset.id);
        const value = getAssetBarcodeValue(asset);
        const cell = hook.cell;
        const padding = 4;
        const imgH = 28;
        const imgW = Math.min(cell.width - padding * 2, 110);
        const x = cell.x + (cell.width - imgW) / 2;
        const y = cell.y + padding;
        if (dataUrl) {
          try {
            doc.addImage(dataUrl, "PNG", x, y, imgW, imgH);
          } catch (e) {
            // ignore — text fallback will still render below
          }
        }
        // Caption underneath the barcode
        doc.setFont("courier", "normal");
        doc.setFontSize(8);
        doc.setTextColor(40, 40, 40);
        doc.text(value, cell.x + cell.width / 2, y + imgH + 8, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
      },
      // Hide the plain text in the barcode column — we draw our own.
      willDrawCell: (hook) => {
        if (hook.section === "body" && hook.column.index === 2) {
          hook.cell.text = [];
        }
      },
    });

    cursorY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 24;

    // ---- Overall compliance summary ----
    const allChecklists = data.checklists || [];
    if (allChecklists.length > 0) {
      const totalItems = allChecklists.reduce((s, c) => s + (c.items?.length || 0), 0);
      const totalRequired = allChecklists.reduce(
        (s, c) => s + (c.items?.filter((i) => i.is_required).length || 0),
        0,
      );
      const totalOptional = totalItems - totalRequired;
      const compliancePct = totalItems
        ? Math.round((totalRequired / totalItems) * 100)
        : 0;

      if (cursorY + 90 > pageHeight - 60) {
        doc.addPage();
        cursorY = margin;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Compliance Summary", margin, cursorY);
      cursorY += 8;

      autoTable(doc, {
        startY: cursorY,
        head: [["Checklist", "Frequency", "Required", "Optional", "Total", "% Required"]],
        body: [
          ...allChecklists.map((c) => {
            const items = c.items || [];
            const req = items.filter((i) => i.is_required).length;
            const opt = items.length - req;
            const pct = items.length ? Math.round((req / items.length) * 100) : 0;
            return [
              c.name,
              freqLabel(c.frequency),
              String(req),
              String(opt),
              String(items.length),
              `${pct}%`,
            ];
          }),
          [
            { content: "TOTAL", styles: { fontStyle: "bold" } } as CellDef,
            "",
            { content: String(totalRequired), styles: { fontStyle: "bold" } } as CellDef,
            { content: String(totalOptional), styles: { fontStyle: "bold" } } as CellDef,
            { content: String(totalItems), styles: { fontStyle: "bold" } } as CellDef,
            { content: `${compliancePct}%`, styles: { fontStyle: "bold" } } as CellDef,
          ],
        ],
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [22, 101, 52], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        columnStyles: {
          0: { cellWidth: "auto", fontStyle: "bold" },
          1: { cellWidth: 90 },
          2: { cellWidth: 60, halign: "center" },
          3: { cellWidth: 60, halign: "center" },
          4: { cellWidth: 50, halign: "center" },
          5: { cellWidth: 70, halign: "center" },
        },
        margin: { left: margin, right: margin },
      });
      cursorY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 8;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(90, 90, 90);
      doc.text(
        `Required items must be completed for the inspection to pass. Optional items provide additional context.`,
        margin,
        cursorY + 4,
      );
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      cursorY += 22;
    }

    // ---- Checklists ----
    const checklists = data.checklists || [];
    if (checklists.length > 0) {
      const assetById = new Map(data.assets.map((a) => [a.id, a]));

      checklists.forEach((cl, idx) => {
        const items = cl.items || [];
        const requiredCount = items.filter((i) => i.is_required).length;
        const optionalCount = items.length - requiredCount;
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
        doc.rect(margin, cursorY, pageWidth - margin * 2, 50, "F");
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
        // Compliance line inside heading box
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 101, 52);
        doc.text(
          `Compliance: ${requiredCount} required  ·  ${optionalCount} optional  ·  ${
            items.length ? Math.round((requiredCount / items.length) * 100) : 0
          }% required`,
          margin + 10,
          cursorY + 44,
        );
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        cursorY += 58;

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
          cursorY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 12;
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
            head: [["#", "Label", "Asset Barcode", "Location", "Stagger"]],
            body: linkedAssets.map(({ id, asset }, i) => [
              String(i + 1),
              asset!.name || "—",
              getAssetBarcodeValue(asset!),
              asset!.location || "—",
              formatOffset(cl.asset_offsets?.[id] ?? 0),
            ]),
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [100, 116, 139], textColor: 255 },
            columnStyles: {
              0: { cellWidth: 28, halign: "center" },
              1: { cellWidth: 140, fontStyle: "bold" },
              2: { cellWidth: 110, halign: "center", fontStyle: "bold" },
              3: { cellWidth: 100 },
              4: { cellWidth: "auto", halign: "center" },
            },
            margin: { left: margin, right: margin },
          });
          cursorY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 16;
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
    const pageCount = (doc as JsPDFWithAutoTable).internal.getNumberOfPages();
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
  } catch (err: unknown) {
    console.error("Failed to generate setup sheet PDF", err);
    toast.error("Could not generate PDF", {
      description: err instanceof Error ? err.message : undefined,
    });
  }
};