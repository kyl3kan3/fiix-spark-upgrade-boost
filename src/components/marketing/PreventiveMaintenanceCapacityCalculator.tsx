import { useMemo, useState } from "react";
import { Calculator, Gauge, UsersRound, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackMarketingEvent } from "@/lib/analytics/marketingEvents";

type CalculatorInputs = {
  assets: number;
  intervalDays: number;
  taskHours: number;
  technicians: number;
  productiveHoursPerWeek: number;
};

const DEFAULTS: CalculatorInputs = {
  assets: 40,
  intervalDays: 90,
  taskHours: 1.25,
  technicians: 3,
  productiveHoursPerWeek: 24,
};

const positiveNumber = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const PreventiveMaintenanceCapacityCalculator = () => {
  const [draft, setDraft] = useState<Record<keyof CalculatorInputs, string>>({
    assets: String(DEFAULTS.assets),
    intervalDays: String(DEFAULTS.intervalDays),
    taskHours: String(DEFAULTS.taskHours),
    technicians: String(DEFAULTS.technicians),
    productiveHoursPerWeek: String(DEFAULTS.productiveHoursPerWeek),
  });
  const [inputs, setInputs] = useState(DEFAULTS);

  const results = useMemo(() => {
    const eventsPerMonth = inputs.assets * (30.44 / inputs.intervalDays);
    const pmHoursPerMonth = eventsPerMonth * inputs.taskHours;
    const teamCapacityPerMonth = inputs.technicians * inputs.productiveHoursPerWeek * 4.33;
    const pmLoad = teamCapacityPerMonth > 0 ? (pmHoursPerMonth / teamCapacityPerMonth) * 100 : 0;
    return {
      eventsPerMonth,
      pmHoursPerMonth,
      teamCapacityPerMonth,
      remainingHours: teamCapacityPerMonth - pmHoursPerMonth,
      pmLoad,
    };
  }, [inputs]);

  const update = (field: keyof CalculatorInputs) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }));
  };

  const calculate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: CalculatorInputs = {
      assets: positiveNumber(draft.assets, DEFAULTS.assets),
      intervalDays: positiveNumber(draft.intervalDays, DEFAULTS.intervalDays),
      taskHours: positiveNumber(draft.taskHours, DEFAULTS.taskHours),
      technicians: positiveNumber(draft.technicians, DEFAULTS.technicians),
      productiveHoursPerWeek: positiveNumber(
        draft.productiveHoursPerWeek,
        DEFAULTS.productiveHoursPerWeek,
      ),
    };
    setInputs(next);
    const estimatedPmHoursMonthly = next.assets * (30.44 / next.intervalDays) * next.taskHours;
    const estimatedCapacityMonthly = next.technicians * next.productiveHoursPerWeek * 4.33;
    const estimatedPmLoadPercent = (estimatedPmHoursMonthly / estimatedCapacityMonthly) * 100;
    void trackMarketingEvent({
      eventType: "calculator_complete",
      pageSlug: "preventive-maintenance",
      metadata: {
        ...next,
        estimated_pm_hours_monthly: Number(estimatedPmHoursMonthly.toFixed(1)),
        estimated_pm_load_percent: Number(estimatedPmLoadPercent.toFixed(1)),
        pm_load_band: estimatedPmLoadPercent > 100 ? "over_capacity" : estimatedPmLoadPercent > 70 ? "high" : "available",
      },
    });
  };

  const loadLabel = results.pmLoad > 100
    ? "PM demand exceeds the entered capacity"
    : results.pmLoad > 70
      ? "PM demand uses most of the entered capacity"
      : "PM demand fits within the entered capacity";

  return (
    <section
      className="mt-6 rounded-3xl bg-card p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] sm:p-7"
      aria-labelledby="pm-capacity-calculator-title"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Calculator className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 id="pm-capacity-calculator-title" className="text-xl font-semibold text-foreground text-balance">
            Preventive maintenance labor-capacity calculator
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
            Estimate the recurring PM hours created by one asset group. Productive hours should exclude meetings,
            training, breaks, leave, and other time that cannot be scheduled.
          </p>
        </div>
      </div>

      <form onSubmit={calculate} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="pm-assets">Assets on this schedule</Label>
          <Input id="pm-assets" type="number" min="1" step="1" value={draft.assets} onChange={update("assets")} className="mt-2 min-h-11 tabular-nums" />
        </div>
        <div>
          <Label htmlFor="pm-interval">Interval in days</Label>
          <Input id="pm-interval" type="number" min="1" step="1" value={draft.intervalDays} onChange={update("intervalDays")} className="mt-2 min-h-11 tabular-nums" />
        </div>
        <div>
          <Label htmlFor="pm-hours">Average hours per PM</Label>
          <Input id="pm-hours" type="number" min="0.1" step="0.05" value={draft.taskHours} onChange={update("taskHours")} className="mt-2 min-h-11 tabular-nums" />
        </div>
        <div>
          <Label htmlFor="pm-techs">Technicians available</Label>
          <Input id="pm-techs" type="number" min="1" step="1" value={draft.technicians} onChange={update("technicians")} className="mt-2 min-h-11 tabular-nums" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pm-productive-hours">Productive maintenance hours per technician each week</Label>
          <Input id="pm-productive-hours" type="number" min="1" step="0.5" value={draft.productiveHoursPerWeek} onChange={update("productiveHoursPerWeek")} className="mt-2 min-h-11 tabular-nums" />
        </div>
        <Button type="submit" className="min-h-11 transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.96] sm:col-span-2">
          Recalculate PM capacity
        </Button>
      </form>

      <div className="mt-6 grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-2xl bg-muted/50 p-4">
          <Wrench className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="mt-3 text-2xl font-bold text-foreground tabular-nums">{results.eventsPerMonth.toFixed(1)}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">PM events per month</p>
        </div>
        <div className="rounded-2xl bg-muted/50 p-4">
          <UsersRound className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="mt-3 text-2xl font-bold text-foreground tabular-nums">{results.pmHoursPerMonth.toFixed(1)}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">PM labor hours per month</p>
        </div>
        <div className="rounded-2xl bg-muted/50 p-4">
          <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="mt-3 text-2xl font-bold text-foreground tabular-nums">{results.pmLoad.toFixed(0)}%</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Entered capacity assigned to this PM group</p>
        </div>
      </div>

      <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${results.pmLoad > 100 ? "bg-destructive/10 text-destructive" : "bg-primary/5 text-foreground"}`}>
        {loadLabel}. {Math.abs(results.remainingHours).toFixed(1)} hours per month are {results.remainingHours >= 0 ? "left for other planned and corrective work" : "over capacity"}.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Planning estimate only. Validate task duration, travel, seasonal work, on-call coverage, skill mix, and emergency reserve with your own history.
      </p>
    </section>
  );
};

export default PreventiveMaintenanceCapacityCalculator;
