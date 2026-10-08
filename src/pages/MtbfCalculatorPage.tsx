import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Gauge, RotateCcw } from "lucide-react";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TRIAL_CANCEL_BY_DAY, TRIAL_DAYS } from "@/constants/trial";
import { SECOND_PASS_TOOL_PAGES } from "@/data/secondPassTools";
import { trackMarketingEvent } from "@/lib/analytics/marketingEvents";
import {
  computeMtbf,
  DEFAULT_MTBF_INPUT,
  formatHours,
  formatPercent,
  formatRate,
  MISSION_PRESETS,
  parseNumberField,
  type MtbfField,
  type MtbfMode,
} from "@/lib/mtbf";

const PAGE = SECOND_PASS_TOOL_PAGES.find((page) => page.slug === "mtbf-calculator")!;
const ORIGIN = "https://maintenease.com";
const CANONICAL_URL = `${ORIGIN}${PAGE.path}`;
const CARD = "rounded-[28px] bg-card shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.05)]";
const TILE = "rounded-2xl bg-background p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]";

type RawFields = Record<MtbfField, string>;

const toRaw = (value: number | null) => (value === null ? "" : String(value));
const INITIAL_RAW: RawFields = {
  operatingHours: toRaw(DEFAULT_MTBF_INPUT.operatingHours),
  hoursPerDay: toRaw(DEFAULT_MTBF_INPUT.hoursPerDay),
  days: toRaw(DEFAULT_MTBF_INPUT.days),
  machines: toRaw(DEFAULT_MTBF_INPUT.machines),
  failures: toRaw(DEFAULT_MTBF_INPUT.failures),
  downtimeHours: toRaw(DEFAULT_MTBF_INPUT.downtimeHours),
};

type FieldProps = {
  field: MtbfField;
  label: string;
  hint?: string;
  unit?: string;
  value: string;
  error?: string;
  integer?: boolean;
  onChange: (field: MtbfField, value: string) => void;
};

const NumberField = ({ field, label, hint, unit, value, error, integer, onChange }: FieldProps) => {
  const id = `mtbf-${field}`;
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="font-semibold text-foreground">{label}</Label>
      {hint ? <p id={`${id}-hint`} className="mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">{hint}</p> : null}
      <div className="relative mt-2">
        <Input
          id={id}
          type="text"
          inputMode={integer ? "numeric" : "decimal"}
          autoComplete="off"
          enterKeyHint="next"
          value={value}
          onChange={(event) => onChange(field, event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-12 rounded-xl text-base tabular-nums ${unit ? "pr-14" : ""} ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />
        {unit ? <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-muted-foreground" aria-hidden="true">{unit}</span> : null}
      </div>
      {error ? <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
};

const MtbfCalculatorPage = () => {
  const [mode, setMode] = useState<MtbfMode>(DEFAULT_MTBF_INPUT.mode);
  const [raw, setRaw] = useState<RawFields>(INITIAL_RAW);
  const [missionHours, setMissionHours] = useState<number>(DEFAULT_MTBF_INPUT.missionHours);
  const trackedUse = useRef(false);
  const resultHeadingId = useId();

  useEffect(() => {
    void trackMarketingEvent({
      eventType: "page_view",
      pageSlug: PAGE.slug,
      dedupeKey: `page_view:${PAGE.slug}:session`,
    });
  }, []);

  const result = useMemo(
    () =>
      computeMtbf({
        mode,
        operatingHours: parseNumberField(raw.operatingHours),
        hoursPerDay: parseNumberField(raw.hoursPerDay),
        days: parseNumberField(raw.days),
        machines: parseNumberField(raw.machines),
        failures: parseNumberField(raw.failures),
        downtimeHours: parseNumberField(raw.downtimeHours),
        missionHours,
      }),
    [mode, raw, missionHours],
  );

  const markUsed = () => {
    if (trackedUse.current) return;
    trackedUse.current = true;
    // Records that the tool was used and in which mode. Input values are never sent.
    void trackMarketingEvent({
      eventType: "tool_use",
      pageSlug: PAGE.slug,
      metadata: { mode },
      dedupeKey: `tool_use:${PAGE.slug}:session`,
    });
  };

  const updateField = (field: MtbfField, value: string) => {
    setRaw((current) => ({ ...current, [field]: value }));
    markUsed();
  };

  const reset = () => {
    setMode(DEFAULT_MTBF_INPUT.mode);
    setRaw(INITIAL_RAW);
    setMissionHours(DEFAULT_MTBF_INPUT.missionHours);
  };

  const errors = result.status === "invalid" ? result.errors : {};

  const breadcrumbs = [...(PAGE.breadcrumbs ?? []), { label: PAGE.h1, href: PAGE.path }];
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
        {/* WebPage, FAQPage and BreadcrumbList JSON-LD ship once in the prerendered HTML
            (scripts/prerender.ts). Repeating them here would duplicate each type after hydration. */}
      </Helmet>
      <MarketingJsonLd />

      <section className="container mx-auto max-w-6xl px-4 pb-8 pt-10 md:pb-12 md:pt-16">
        <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {index < breadcrumbs.length - 1 ? (
                  <Link to={crumb.href} className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-primary">{crumb.label}</Link>
                ) : (
                  <span className="text-foreground" aria-current="page">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{PAGE.eyebrow}</p>
        <h1 className="mt-3 max-w-4xl font-headline text-4xl font-bold tracking-normal text-foreground text-balance md:text-6xl">{PAGE.h1}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">{PAGE.intro}</p>
      </section>

      <section id="mtbf-calculator" className="container mx-auto max-w-6xl px-4 pb-16" aria-label="MTBF calculator">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-8">
          <form className={`${CARD} p-5 md:p-7`} onSubmit={(event) => event.preventDefault()} noValidate>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Gauge className="h-5 w-5" aria-hidden="true" /></span>
              <div>
                <h2 className="font-headline text-2xl font-semibold text-foreground text-balance">Your numbers</h2>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">Use one asset, or a group of identical ones, over one period.</p>
              </div>
            </div>

            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-foreground">How do you know run time?</legend>
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(value) => {
                  if (value === "hours" || value === "schedule") {
                    setMode(value);
                    markUsed();
                  }
                }}
                className="mt-2 flex gap-1 rounded-xl bg-muted p-1"
              >
                <ToggleGroupItem value="hours" className="h-11 flex-1 rounded-lg text-sm font-semibold data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm">
                  Operating hours
                </ToggleGroupItem>
                <ToggleGroupItem value="schedule" className="h-11 flex-1 rounded-lg text-sm font-semibold data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm">
                  Run schedule
                </ToggleGroupItem>
              </ToggleGroup>
            </fieldset>

            <div className="mt-6 space-y-5">
              {mode === "hours" ? (
                <NumberField
                  field="operatingHours"
                  label="Total operating hours"
                  hint="Hours the asset was running or ready to run. Exclude time it was down for repair."
                  unit="h"
                  value={raw.operatingHours}
                  error={errors.operatingHours}
                  onChange={updateField}
                />
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <NumberField field="hoursPerDay" label="Hours / day" unit="h" value={raw.hoursPerDay} error={errors.hoursPerDay} onChange={updateField} />
                  <NumberField field="days" label="Days" value={raw.days} error={errors.days} integer onChange={updateField} />
                  <NumberField field="machines" label="Machines" value={raw.machines} error={errors.machines} integer onChange={updateField} />
                </div>
              )}

              <NumberField
                field="failures"
                label="Failures in that period"
                hint="Breakdowns that stopped the asset and needed corrective work. Planned PM stops do not count."
                value={raw.failures}
                error={errors.failures}
                integer
                onChange={updateField}
              />

              <NumberField
                field="downtimeHours"
                label="Total repair downtime (optional)"
                hint={mode === "schedule"
                  ? "All failure downtime across the machines. It is removed from scheduled time and adds MTTR and availability."
                  : "All failure downtime in the period. Adds MTTR and availability."}
                unit="h"
                value={raw.downtimeHours}
                error={errors.downtimeHours}
                onChange={updateField}
              />
            </div>

            <Button type="button" variant="ghost" onClick={reset} className="mt-5 min-h-11 px-3">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />Reset example
            </Button>
          </form>

          <div className="lg:sticky lg:top-28">
            <div className={`${CARD} p-5 md:p-7`} aria-labelledby={resultHeadingId}>
              <h2 id={resultHeadingId} className="font-sans text-sm font-semibold uppercase tracking-wide text-muted-foreground">Result</h2>

              <div aria-live="polite" aria-atomic="true">
                {result.status === "invalid" ? (
                  <p className="mt-4 rounded-2xl bg-muted/60 p-5 text-sm leading-relaxed text-muted-foreground text-pretty">
                    Fix the highlighted field and the result appears here.
                  </p>
                ) : null}

                {result.status === "no-failures" ? (
                  <div className="mt-4 rounded-2xl bg-muted/60 p-5">
                    <p className="font-headline text-2xl font-semibold text-foreground text-balance">No failures, so no average yet</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                      The asset logged {formatHours(result.operatingHours)} operating hours without a failure. MTBF needs at least one failure to divide by. Keep logging run time, and the first failure gives you a real number.
                    </p>
                  </div>
                ) : null}

                {result.status === "ok" ? (
                  <>
                    <p className="mt-3 text-sm font-medium text-foreground">Mean time between failures</p>
                    <p className="mt-1 font-sans text-5xl font-bold tracking-tight text-foreground tabular-nums md:text-6xl">
                      {formatHours(result.mtbfHours)}
                      <span className="ml-2 text-xl font-semibold text-muted-foreground md:text-2xl">hours</span>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                      {result.mtbfOperatingDays !== null
                        ? `About ${formatRate(result.mtbfOperatingDays)} days of running per machine at ${raw.hoursPerDay.trim()} h/day.`
                        : "Average operating time from one failure to the next."}
                    </p>

                    <div className="mt-4 rounded-xl bg-muted/60 px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {result.scheduledHours !== null && result.scheduledHours !== result.operatingHours ? (
                        <p>{formatHours(result.scheduledHours)} h scheduled − {formatHours(result.scheduledHours - result.operatingHours)} h downtime = {formatHours(result.operatingHours)} h</p>
                      ) : null}
                      <p>{formatHours(result.operatingHours)} h ÷ {result.failures} failure{result.failures === 1 ? "" : "s"} = <span className="font-semibold text-foreground">{formatHours(result.mtbfHours)} h MTBF</span></p>
                    </div>

                    <dl className="mt-5 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
                      <div className={TILE}>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Failure rate</dt>
                        <dd className="mt-1 text-2xl font-bold text-foreground tabular-nums">{formatRate(result.failuresPer1000Hours)}</dd>
                        <dd className="text-xs text-muted-foreground">per 1,000 operating h</dd>
                      </div>
                      <div className={TILE}>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">MTTR</dt>
                        {result.mttrHours !== null ? (
                          <>
                            <dd className="mt-1 text-2xl font-bold text-foreground tabular-nums">{formatHours(result.mttrHours)} h</dd>
                            <dd className="text-xs text-muted-foreground">mean time to repair</dd>
                          </>
                        ) : (
                          <dd className="mt-1 text-sm text-muted-foreground text-pretty">Add repair downtime to see it</dd>
                        )}
                      </div>
                      <div className={`${TILE} min-[360px]:col-span-2`}>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Availability</dt>
                        {result.availability !== null ? (
                          <>
                            <dd className="mt-1 text-2xl font-bold text-foreground tabular-nums">{formatPercent(result.availability, 2)}</dd>
                            <dd className="text-xs text-muted-foreground text-pretty">MTBF ÷ (MTBF + MTTR). Failure downtime only; planned stops lower it further.</dd>
                          </>
                        ) : (
                          <dd className="mt-1 text-sm text-muted-foreground text-pretty">Add repair downtime to see it</dd>
                        )}
                      </div>
                      <div className={`${TILE} min-[360px]:col-span-2`}>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chance of no failure</dt>
                        <dd className="mt-1 flex flex-wrap items-baseline gap-x-2">
                          <span className="text-2xl font-bold text-foreground tabular-nums">{formatPercent(result.reliability, result.reliability > 0.99 ? 2 : 0)}</span>
                          <span className="text-sm text-muted-foreground">over the next {missionHours} operating hours</span>
                        </dd>
                        <dd className="mt-3">
                          <ToggleGroup
                            type="single"
                            value={String(missionHours)}
                            onValueChange={(value) => value && setMissionHours(Number(value))}
                            className="flex gap-1 rounded-xl bg-muted p-1"
                            aria-label="Operating hours ahead"
                          >
                            {MISSION_PRESETS.map((hours) => (
                              <ToggleGroupItem key={hours} value={String(hours)} className="h-10 flex-1 rounded-lg px-2 text-sm font-semibold tabular-nums data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm">
                                {hours} h
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </dd>
                        <dd className="mt-2 text-xs leading-relaxed text-muted-foreground text-pretty">Uses e^(-t ÷ MTBF), which assumes random failures at a steady rate. Wear-out parts fail more predictably than this.</dd>
                      </div>
                    </dl>
                  </>
                ) : null}
              </div>

              <div className="mt-6 rounded-2xl p-5 text-primary-foreground md:p-6" style={{ background: "linear-gradient(135deg, hsl(226 100% 28%), hsl(226 100% 18%))" }} data-cta-location="mtbf-calculator-result">
                <p className="font-headline text-xl font-semibold text-balance">Get MTBF without the spreadsheet</p>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85 text-pretty">
                  Log each failure against the asset in MaintenEase and its MTBF updates automatically, next to a 0 to 100 failure-risk score that flags machines trending the wrong way.
                </p>
                <Button asChild size="lg" className="mt-4 min-h-12 w-full bg-background font-semibold text-primary shadow-md hover:bg-background/90 sm:w-auto">
                  <Link to="/auth?signup=true">Start {TRIAL_DAYS}-day free trial <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" /></Link>
                </Button>
                <p className="mt-3 text-xs leading-relaxed text-primary-foreground/70 text-pretty">
                  MTBF tracking and risk scores are on Pro and Business plans. Card required; cancel before day {TRIAL_CANCEL_BY_DAY} to avoid a charge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid gap-5 md:grid-cols-3">
            {PAGE.sections.map((section) => (
              <article key={section.heading} className="rounded-2xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                <h2 className="font-headline text-xl font-semibold text-foreground text-balance">{section.heading}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{section.body}</p>
              </article>
            ))}
          </div>

          <h2 className="mt-14 font-headline text-3xl font-bold text-foreground text-balance">Frequently asked questions</h2>
          <div className="mt-7 space-y-4">
            {PAGE.faqs.map((faq) => (
              <article key={faq.q} className="rounded-2xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                <h3 className="font-semibold text-foreground text-balance">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{faq.a}</p>
              </article>
            ))}
          </div>

          <h2 className="mt-14 font-headline text-2xl font-semibold text-foreground text-balance">Keep going</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PAGE.related.map((item) => (
              <Link key={item.href} to={item.href} className="group flex min-h-28 flex-col justify-between rounded-2xl bg-card p-5 font-semibold text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] transition-[box-shadow,transform,color] duration-150 hover:text-primary hover:shadow-md active:scale-[0.96]">
                <span className="text-balance">{item.label}</span>
                <ArrowRight className="mt-4 h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default MtbfCalculatorPage;
