import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Check, Download, FileText, LoaderCircle, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SECOND_PASS_TOOL_PAGES } from "@/data/secondPassTools";
import { trackMarketingEvent } from "@/lib/analytics/marketingEvents";
import { cn } from "@/lib/utils";

const PAGE = SECOND_PASS_TOOL_PAGES.find((page) => page.slug === "maintenance-sop-generator")!;
const CANONICAL_URL = `https://maintenease.com${PAGE.path}`;

type SopDraft = {
  title: string;
  asset: string;
  purpose: string;
  qualifiedRole: string;
  hazards: string;
  ppe: string;
  tools: string;
  steps: string;
  acceptance: string;
  escalation: string;
  approver: string;
};

const INITIAL_DRAFT: SopDraft = {
  title: "Inspect and tension an air-handler drive belt",
  asset: "AHU-014 — rooftop air handler",
  purpose: "Inspect belt condition and alignment, verify tension, and return the unit to service without exposing the technician to stored or unexpected energy.",
  qualifiedRole: "Qualified HVAC maintenance technician",
  hazards: "Unexpected startup\nStored rotational energy\nSharp sheet-metal edges\nRoof access and weather exposure",
  ppe: "Safety glasses\nCut-resistant gloves\nSite-required footwear\nFall protection when required by the roof-access plan",
  tools: "Asset-specific lockout devices\nBelt tension gauge\nFlashlight\nStraightedge\nManufacturer belt specification",
  steps: "Review the work order, asset history, and manufacturer instructions.\nNotify affected occupants or operators and stop the unit.\nApply the asset-specific energy-control procedure and verify zero energy.\nInspect the guard, belt, sheaves, alignment, and surrounding area.\nMeasure belt tension and adjust only within the manufacturer specification.\nReinstall and secure the guard; clear tools and personnel.\nRemove lockout under the site procedure, restart, and observe operation.\nRecord readings, findings, photos, parts, and follow-up work in the work order.",
  acceptance: "Guard is secure; belt has no cracks, glazing, fraying, or contamination; alignment and tension meet manufacturer criteria; unit runs without abnormal vibration, noise, or belt tracking.",
  escalation: "Stop and create corrective work for damaged guards, worn sheaves, bearing play, contamination, repeated belt failure, inaccessible isolation points, or any condition outside the technician's qualification or approved procedure.",
  approver: "Maintenance manager; EHS review when energy-control or PPE requirements change",
};

const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);

const safeFilename = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "maintenance-sop";

const ExportIcon = ({ state }: { state: "idle" | "working" | "done" }) => (
  <span className="relative inline-flex h-5 w-5 items-center justify-center" aria-hidden="true">
    <LoaderCircle
      className={cn(
        "absolute h-5 w-5 transition-[opacity,filter,scale] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)]",
        state === "working" ? "scale-100 opacity-100 blur-0 animate-spin" : "scale-[0.25] opacity-0 blur-[4px]",
      )}
    />
    <Check
      className={cn(
        "absolute h-5 w-5 transition-[opacity,filter,scale] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)]",
        state === "done" ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]",
      )}
    />
    <Download
      className={cn(
        "h-5 w-5 transition-[opacity,filter,scale] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)]",
        state === "idle" ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]",
      )}
    />
  </span>
);

const SopGeneratorPage = () => {
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [exportState, setExportState] = useState<"idle" | "working" | "done">("idle");

  useEffect(() => {
    void trackMarketingEvent({
      eventType: "page_view",
      pageSlug: PAGE.slug,
      dedupeKey: `page_view:${PAGE.slug}:session`,
    });
  }, []);

  const numberedSteps = useMemo(() => lines(draft.steps), [draft.steps]);
  const update = (field: keyof SopDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));

  const completeExport = (format: "docx" | "pdf") => {
    void trackMarketingEvent({ eventType: "tool_export", pageSlug: PAGE.slug, metadata: { format } });
    setExportState("done");
    window.setTimeout(() => setExportState("idle"), 1400);
  };

  const exportDocx = async () => {
    setExportState("working");
    try {
      const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import("docx");
      const bulletParagraphs = (heading: string, values: string[]) => [
        new Paragraph({ text: heading, heading: HeadingLevel.HEADING_2 }),
        ...values.map((value) => new Paragraph({ text: value, bullet: { level: 0 } })),
      ];
      const document = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({ text: draft.title || "Maintenance standard operating procedure", heading: HeadingLevel.TITLE }),
            new Paragraph({ children: [new TextRun({ text: "Controlled draft — verify and approve before use", bold: true })] }),
            new Paragraph({ text: `Asset / system: ${draft.asset || "Not specified"}` }),
            new Paragraph({ text: `Qualified role: ${draft.qualifiedRole || "Not specified"}` }),
            new Paragraph({ text: "Purpose and scope", heading: HeadingLevel.HEADING_2 }),
            new Paragraph(draft.purpose || "Not specified"),
            ...bulletParagraphs("Hazards and energy sources", lines(draft.hazards)),
            ...bulletParagraphs("Required PPE", lines(draft.ppe)),
            ...bulletParagraphs("Tools, parts, and references", lines(draft.tools)),
            new Paragraph({ text: "Procedure", heading: HeadingLevel.HEADING_2 }),
            ...numberedSteps.map((step) => new Paragraph({ text: step, numbering: { reference: "sop-steps", level: 0 } })),
            new Paragraph({ text: "Acceptance criteria", heading: HeadingLevel.HEADING_2 }),
            new Paragraph(draft.acceptance || "Not specified"),
            new Paragraph({ text: "Stop-work and escalation criteria", heading: HeadingLevel.HEADING_2 }),
            new Paragraph(draft.escalation || "Not specified"),
            new Paragraph({ text: "Review and approval", heading: HeadingLevel.HEADING_2 }),
            new Paragraph(draft.approver || "Not specified"),
            new Paragraph("Document owner: ____________________    Revision: ______    Effective date: __________"),
            new Paragraph("Approved by: _______________________    Signature/date: __________________________"),
          ],
        }],
        numbering: {
          config: [{
            reference: "sop-steps",
            levels: [{ level: 0, format: "decimal", text: "%1.", alignment: "start" }],
          }],
        },
      });
      const blob = await Packer.toBlob(document);
      const objectUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = objectUrl;
      link.download = `${safeFilename(draft.title)}.docx`;
      link.click();
      window.URL.revokeObjectURL(objectUrl);
      completeExport("docx");
    } catch {
      setExportState("idle");
    }
  };

  const exportPdf = async () => {
    setExportState("working");
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "pt", format: "letter" });
      const margin = 54;
      const width = 504;
      let y = 58;
      const ensureSpace = (height = 32) => {
        if (y + height > 740) {
          pdf.addPage();
          y = 58;
        }
      };
      const addText = (text: string, size = 10, bold = false, gap = 7) => {
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
        const wrapped = pdf.splitTextToSize(text || "Not specified", width) as string[];
        ensureSpace(wrapped.length * (size + 3) + gap);
        pdf.text(wrapped, margin, y);
        y += wrapped.length * (size + 3) + gap;
      };
      const addHeading = (heading: string) => {
        ensureSpace(28);
        y += 5;
        addText(heading, 13, true, 6);
      };
      addText(draft.title || "Maintenance standard operating procedure", 19, true, 9);
      addText("CONTROLLED DRAFT — VERIFY AND APPROVE BEFORE USE", 9, true, 12);
      addText(`Asset / system: ${draft.asset || "Not specified"}`);
      addText(`Qualified role: ${draft.qualifiedRole || "Not specified"}`);
      addHeading("Purpose and scope");
      addText(draft.purpose);
      for (const [heading, values] of [
        ["Hazards and energy sources", lines(draft.hazards)],
        ["Required PPE", lines(draft.ppe)],
        ["Tools, parts, and references", lines(draft.tools)],
      ] as const) {
        addHeading(heading);
        values.forEach((value) => addText(`• ${value}`));
      }
      addHeading("Procedure");
      numberedSteps.forEach((step, index) => addText(`${index + 1}. ${step}`));
      addHeading("Acceptance criteria");
      addText(draft.acceptance);
      addHeading("Stop-work and escalation criteria");
      addText(draft.escalation);
      addHeading("Review and approval");
      addText(draft.approver);
      addText("Document owner: ____________________    Revision: ______    Effective date: __________", 9);
      addText("Approved by: _______________________    Signature/date: __________________________", 9);
      pdf.save(`${safeFilename(draft.title)}.pdf`);
      completeExport("pdf");
    } catch {
      setExportState("idle");
    }
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PAGE.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
  const pageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: PAGE.h1,
    url: CANONICAL_URL,
    description: PAGE.metaDescription,
    isPartOf: { "@id": "https://maintenease.com/#website" },
  };

  const fields: Array<{ field: keyof SopDraft; label: string; hint: string; rows?: number }> = [
    { field: "title", label: "Task title", hint: "Use one observable maintenance task." },
    { field: "asset", label: "Asset or system", hint: "Include the stable asset ID and location." },
    { field: "purpose", label: "Purpose and scope", hint: "Define what is included, excluded, and expected." , rows: 3 },
    { field: "qualifiedRole", label: "Qualified role", hint: "Name the training or authorization required." },
    { field: "hazards", label: "Hazards and energy sources", hint: "One hazard or energy source per line.", rows: 5 },
    { field: "ppe", label: "Required PPE", hint: "One item per line; follow the approved hazard assessment.", rows: 4 },
    { field: "tools", label: "Tools, parts, and references", hint: "One item or controlled document per line.", rows: 5 },
    { field: "steps", label: "Ordered procedure steps", hint: "One action per line. Include isolation, verification, restoration, and records.", rows: 9 },
    { field: "acceptance", label: "Acceptance criteria", hint: "State measurable pass conditions.", rows: 4 },
    { field: "escalation", label: "Stop-work and escalation criteria", hint: "Define when the technician must stop and who decides next.", rows: 4 },
    { field: "approver", label: "Review and approval roles", hint: "Name the document owner and required reviewers.", rows: 3 },
  ];

  return (
    <MarketingLayout>
      <Helmet>
        <title>{PAGE.metaTitle}</title>
        <meta name="description" content={PAGE.metaDescription} />
        <link rel="canonical" href={CANONICAL_URL} />
        <meta property="og:title" content={PAGE.metaTitle} />
        <meta property="og:description" content={PAGE.metaDescription} />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE.metaTitle} />
        <meta name="twitter:description" content={PAGE.metaDescription} />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
        <script type="application/ld+json">{JSON.stringify(pageLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>
      <MarketingJsonLd />

      <section className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
        <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/templates" className="transition-colors duration-150 hover:text-primary">Templates</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-foreground">Maintenance SOP generator</span>
        </nav>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{PAGE.eyebrow}</p>
        <h1 className="mt-3 max-w-4xl font-headline text-4xl font-bold tracking-normal text-foreground text-balance md:text-6xl">{PAGE.h1}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">{PAGE.intro}</p>
        <div className="mt-7 flex max-w-3xl items-start gap-3 rounded-2xl bg-amber-50 p-4 text-amber-950 shadow-[0_0_0_1px_rgba(120,53,15,0.12),0_2px_8px_rgba(120,53,15,0.06)] dark:bg-amber-950/30 dark:text-amber-100">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-pretty"><strong>Controlled draft:</strong> a qualified owner must validate safety, technical, manufacturer, and regulatory requirements before anyone uses the generated procedure.</p>
        </div>
      </section>

      <section className="container mx-auto grid max-w-7xl gap-8 px-4 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="rounded-[28px] bg-card p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.05)] md:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <h2 className="font-headline text-2xl font-semibold text-foreground text-balance">Build the controlled draft</h2>
              <p className="text-sm text-muted-foreground text-pretty">Replace the example with your approved site information.</p>
            </div>
          </div>
          <div className="mt-7 space-y-6">
            {fields.map(({ field, label, hint, rows }) => (
              <div key={field}>
                <Label htmlFor={field} className="font-semibold text-foreground">{label}</Label>
                <p id={`${field}-hint`} className="mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">{hint}</p>
                {rows ? (
                  <Textarea id={field} value={draft[field]} onChange={(event) => update(field, event.target.value)} rows={rows} aria-describedby={`${field}-hint`} className="mt-2 rounded-xl" />
                ) : (
                  <Input id={field} value={draft[field]} onChange={(event) => update(field, event.target.value)} aria-describedby={`${field}-hint`} className="mt-2 h-11 rounded-xl" />
                )}
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="rounded-[28px] bg-slate-950 p-5 text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_55px_rgba(15,23,42,0.22)] md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Live SOP preview</p>
            <h2 className="mt-3 font-headline text-2xl font-semibold text-white text-balance">{draft.title || "Untitled maintenance procedure"}</h2>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-400">Asset / system</dt><dd className="mt-1 text-pretty">{draft.asset || "Not specified"}</dd></div>
              <div><dt className="text-slate-400">Qualified role</dt><dd className="mt-1 text-pretty">{draft.qualifiedRole || "Not specified"}</dd></div>
            </dl>
            <div className="mt-6 space-y-6 text-sm leading-relaxed">
              <div><h3 className="font-semibold text-teal-300">Purpose and scope</h3><p className="mt-2 whitespace-pre-line text-slate-200 text-pretty">{draft.purpose || "Not specified"}</p></div>
              {[["Hazards", draft.hazards], ["Required PPE", draft.ppe], ["Tools and references", draft.tools]].map(([heading, value]) => (
                <div key={heading}>
                  <h3 className="font-semibold text-teal-300">{heading}</h3>
                  <ul className="mt-2 space-y-1 text-slate-200">{lines(value).map((item) => <li key={item}>• {item}</li>)}</ul>
                </div>
              ))}
              <div>
                <h3 className="font-semibold text-teal-300">Procedure</h3>
                <ol className="mt-2 space-y-2 text-slate-200">{numberedSteps.map((step, index) => <li key={`${index}-${step}`} className="flex gap-3"><span className="tabular-nums text-slate-500">{index + 1}.</span><span className="text-pretty">{step}</span></li>)}</ol>
              </div>
              <div><h3 className="font-semibold text-teal-300">Acceptance criteria</h3><p className="mt-2 text-slate-200 text-pretty">{draft.acceptance || "Not specified"}</p></div>
              <div><h3 className="font-semibold text-teal-300">Stop-work and escalation</h3><p className="mt-2 text-slate-200 text-pretty">{draft.escalation || "Not specified"}</p></div>
              <div><h3 className="font-semibold text-teal-300">Review and approval</h3><p className="mt-2 text-slate-200 text-pretty">{draft.approver || "Not specified"}</p></div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button onClick={exportDocx} disabled={exportState === "working"} className="min-h-12"><ExportIcon state={exportState} />Export DOCX</Button>
            <Button onClick={exportPdf} disabled={exportState === "working"} variant="outline" className="min-h-12"><ExportIcon state={exportState} />Export PDF</Button>
          </div>
        </aside>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid gap-5 md:grid-cols-3">
            {PAGE.sections.map((section) => <article key={section.heading} className="rounded-2xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]"><h2 className="font-headline text-xl font-semibold text-foreground text-balance">{section.heading}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{section.body}</p></article>)}
          </div>
          <h2 className="mt-14 font-headline text-3xl font-bold text-foreground text-balance">Frequently asked questions</h2>
          <div className="mt-7 space-y-4">{PAGE.faqs.map((faq) => <article key={faq.q} className="rounded-2xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]"><h3 className="font-semibold text-foreground text-balance">{faq.q}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{faq.a}</p></article>)}</div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">{PAGE.related.map((item) => <Link key={item.href} to={item.href} className="group flex min-h-28 flex-col justify-between rounded-2xl bg-card p-5 font-semibold text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] transition-[box-shadow,transform,color] duration-150 hover:text-primary hover:shadow-md active:scale-[0.96]"><span className="text-balance">{item.label}</span><ArrowRight className="mt-4 h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" /></Link>)}</div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default SopGeneratorPage;
