import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Download, Lightbulb, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SECOND_PASS_TOOL_PAGES } from "@/data/secondPassTools";
import { trackMarketingEvent } from "@/lib/analytics/marketingEvents";

const PAGE = SECOND_PASS_TOOL_PAGES.find((page) => page.slug === "root-cause-fishbone-generator")!;
const CANONICAL_URL = `https://maintenease.com${PAGE.path}`;

const CATEGORY_NAMES = ["People", "Machine", "Method", "Material", "Measurement", "Environment"] as const;
type CategoryName = typeof CATEGORY_NAMES[number];
type Causes = Record<CategoryName, string>;

const INITIAL_PROBLEM = "Pump P-07 trips on high vibration during loaded operation";
const INITIAL_CAUSES: Causes = {
  People: "Alignment check skipped after coupling work\nNew technician unfamiliar with baseline",
  Machine: "Bearing wear\nSoft foot\nCoupling misalignment",
  Method: "No post-repair vibration acceptance test\nLubrication interval not load-adjusted",
  Material: "Incorrect grease compatibility\nReplacement coupling tolerance",
  Measurement: "Sensor mounted at inconsistent point\nNo loaded baseline",
  Environment: "Foundation movement\nProcess piping strain\nHigher ambient temperature",
};

const splitCauses = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 4);
const xmlEscape = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[character]!));

const renderFishboneSvg = (problem: string, causes: Causes) => {
  const branchXs = [270, 510, 750];
  const branchMarkup = CATEGORY_NAMES.map((category, index) => {
    const top = index < 3;
    const branchIndex = index % 3;
    const spineX = branchXs[branchIndex];
    const endX = spineX - 92;
    const endY = top ? 104 : 496;
    const direction = top ? 1 : -1;
    const causeItems = splitCauses(causes[category]);
    const itemMarkup = causeItems.map((item, itemIndex) => {
      const y = top ? 145 + itemIndex * 42 : 455 - itemIndex * 42;
      const lineEndX = spineX - 34 - itemIndex * 14;
      const textY = y + (top ? -8 : 20);
      return `<line x1="${lineEndX - 105}" y1="${y}" x2="${lineEndX}" y2="${y}" stroke="#5eead4" stroke-width="2"/><text x="${lineEndX - 101}" y="${textY}" font-family="Arial, sans-serif" font-size="13" fill="#dbeafe">${xmlEscape(item.slice(0, 34))}</text>`;
    }).join("");
    return `<g><line x1="${endX}" y1="${endY}" x2="${spineX}" y2="300" stroke="#99f6e4" stroke-width="4" stroke-linecap="round"/><text x="${endX}" y="${endY + direction * -18}" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff">${category}</text>${itemMarkup}</g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1160 600" role="img" aria-labelledby="fishbone-title fishbone-desc"><title id="fishbone-title">Maintenance root-cause fishbone diagram</title><desc id="fishbone-desc">Potential causes grouped by People, Machine, Method, Material, Measurement, and Environment around the problem ${xmlEscape(problem)}</desc><rect width="1160" height="600" rx="28" fill="#07162f"/><text x="54" y="54" font-family="Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="2" fill="#5eead4">MAINTENANCE ROOT-CAUSE HYPOTHESES</text><line x1="112" y1="300" x2="904" y2="300" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><polygon points="904,300 878,284 878,316" fill="#ffffff"/>${branchMarkup}<rect x="910" y="234" width="218" height="132" rx="18" fill="#0f2a55" stroke="#5eead4" stroke-width="2"/><text x="1019" y="264" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#5eead4">PROBLEM</text><foreignObject x="930" y="278" width="178" height="72"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 15px/1.3 Arial,sans-serif;color:white;text-align:center;word-wrap:break-word">${xmlEscape(problem || "Define the observable problem")}</div></foreignObject><text x="54" y="562" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8">Candidate causes require evidence before they are confirmed as root causes.</text></svg>`;
};

const FishboneGeneratorPage = () => {
  const [problem, setProblem] = useState(INITIAL_PROBLEM);
  const [causes, setCauses] = useState<Causes>(INITIAL_CAUSES);
  const svgMarkup = useMemo(() => renderFishboneSvg(problem, causes), [problem, causes]);

  useEffect(() => {
    void trackMarketingEvent({
      eventType: "page_view",
      pageSlug: PAGE.slug,
      dedupeKey: `page_view:${PAGE.slug}:session`,
    });
  }, []);

  const exportSvg = () => {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = window.URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = objectUrl;
    link.download = "maintenance-root-cause-fishbone.svg";
    link.click();
    window.URL.revokeObjectURL(objectUrl);
    void trackMarketingEvent({ eventType: "tool_export", pageSlug: PAGE.slug, metadata: { format: "svg" } });
  };

  const reset = () => {
    setProblem(INITIAL_PROBLEM);
    setCauses(INITIAL_CAUSES);
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
          <Link to="/learn/root-cause-analysis" className="transition-colors duration-150 hover:text-primary">Root cause analysis</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-foreground">Fishbone generator</span>
        </nav>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{PAGE.eyebrow}</p>
        <h1 className="mt-3 max-w-4xl font-headline text-4xl font-bold tracking-normal text-foreground text-balance md:text-6xl">{PAGE.h1}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">{PAGE.intro}</p>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start">
          <div className="rounded-[28px] bg-card p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.05)] md:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Lightbulb className="h-5 w-5" aria-hidden="true" /></span>
              <div><h2 className="font-headline text-2xl font-semibold text-foreground text-balance">Map the hypotheses</h2><p className="mt-1 text-sm text-muted-foreground text-pretty">Keep the problem factual and put one candidate cause on each line.</p></div>
            </div>
            <div className="mt-7">
              <Label htmlFor="fishbone-problem" className="font-semibold text-foreground">Observable problem</Label>
              <p id="fishbone-problem-hint" className="mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">Include the asset, condition, operating state, and time window. Do not include a presumed cause.</p>
              <Input id="fishbone-problem" value={problem} onChange={(event) => setProblem(event.target.value)} aria-describedby="fishbone-problem-hint" className="mt-2 h-11 rounded-xl" />
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {CATEGORY_NAMES.map((category) => (
                <div key={category}>
                  <Label htmlFor={`category-${category}`} className="font-semibold text-foreground">{category}</Label>
                  <Textarea id={`category-${category}`} value={causes[category]} onChange={(event) => setCauses((current) => ({ ...current, [category]: event.target.value }))} rows={4} className="mt-2 rounded-xl" aria-label={`${category} candidate causes`} />
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" onClick={reset} className="mt-5 min-h-11 px-3"><RotateCcw className="h-4 w-4" aria-hidden="true" />Reset example</Button>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[28px] bg-slate-950 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_55px_rgba(15,23,42,0.22)] md:p-5">
              <div className="overflow-x-auto rounded-2xl bg-slate-950">
                <div className="min-w-[720px] lg:min-w-0 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">SVG stays sharp in presentations and can be attached to a work order or RCA record. Test each branch against evidence before confirming cause.</p>
              <Button type="button" onClick={exportSvg} className="min-h-12 shrink-0"><Download className="h-5 w-5" aria-hidden="true" />Export SVG</Button>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid gap-5 md:grid-cols-3">{PAGE.sections.map((section) => <article key={section.heading} className="rounded-2xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]"><h2 className="font-headline text-xl font-semibold text-foreground text-balance">{section.heading}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{section.body}</p></article>)}</div>
          <h2 className="mt-14 font-headline text-3xl font-bold text-foreground text-balance">Frequently asked questions</h2>
          <div className="mt-7 space-y-4">{PAGE.faqs.map((faq) => <article key={faq.q} className="rounded-2xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]"><h3 className="font-semibold text-foreground text-balance">{faq.q}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{faq.a}</p></article>)}</div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">{PAGE.related.map((item) => <Link key={item.href} to={item.href} className="group flex min-h-28 flex-col justify-between rounded-2xl bg-card p-5 font-semibold text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] transition-[box-shadow,transform,color] duration-150 hover:text-primary hover:shadow-md active:scale-[0.96]"><span className="text-balance">{item.label}</span><ArrowRight className="mt-4 h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" /></Link>)}</div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default FishboneGeneratorPage;
