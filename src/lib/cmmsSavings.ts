/**
 * Pure math behind the /cmms-cost-calculator page.
 *
 * Competitor per-user prices come from src/data/comparisons.ts (the same
 * figures, with the same "publicly listed 2026 tiers, illustrative" caveat,
 * used by FlatFeeAdvantage and the /compare pages) so every surface tells one
 * consistent story. Deliberately honest: for small teams some per-seat rivals
 * cost LESS than the flat fee — savings go negative and the UI shows it,
 * along with each rival's breakeven team size.
 */
import { comparisons, MAINTENEASE_PRO } from "@/data/comparisons";

export const MIN_TEAM_SIZE = 1;
export const MAX_TEAM_SIZE = 50;
export const DEFAULT_TEAM_SIZE = 8;

export interface VendorCost {
  name: string;
  plan: string;
  perUser: number;
  /** Monthly cost for the chosen team on this vendor's listed per-user price. */
  monthly: number;
  /** Monthly saving on MaintenEase vs this vendor. Negative = vendor is cheaper. */
  monthlySavings: number;
  /** Smallest team size at which MaintenEase becomes cheaper than this vendor. */
  breakevenTeamSize: number;
}

export interface CmmsCostResult {
  teamSize: number;
  /** MaintenEase Pro flat monthly price. */
  maintenease: number;
  /** One row per competitor, most expensive first. */
  vendors: VendorCost[];
  /** Largest monthly figure on the board (for scaling bars). */
  maxMonthly: number;
  /** Annual savings vs the priciest rival at this team size. */
  bestAnnualSavings: number;
  /** True once every listed rival costs more than the flat fee. */
  beatsAllVendors: boolean;
}

export const clampTeamSize = (n: number): number => {
  if (!Number.isFinite(n)) return DEFAULT_TEAM_SIZE;
  return Math.min(MAX_TEAM_SIZE, Math.max(MIN_TEAM_SIZE, Math.round(n)));
};

/** Cheapest team size where flat beats per-user: smallest n with n*perUser > flat. */
export const breakevenTeamSize = (perUser: number): number =>
  Math.floor(MAINTENEASE_PRO / perUser) + 1;

export function computeCmmsCosts(rawTeamSize: number): CmmsCostResult {
  const teamSize = clampTeamSize(rawTeamSize);

  const vendors: VendorCost[] = comparisons
    .map((c) => {
      const monthly = c.competitorPricePerUser * teamSize;
      return {
        name: c.competitor,
        plan: c.competitorPlan,
        perUser: c.competitorPricePerUser,
        monthly,
        monthlySavings: monthly - MAINTENEASE_PRO,
        breakevenTeamSize: breakevenTeamSize(c.competitorPricePerUser),
      };
    })
    .sort((a, b) => b.monthly - a.monthly);

  const maxMonthly = Math.max(MAINTENEASE_PRO, ...vendors.map((v) => v.monthly));

  return {
    teamSize,
    maintenease: MAINTENEASE_PRO,
    vendors,
    maxMonthly,
    bestAnnualSavings: Math.max(0, ...vendors.map((v) => v.monthlySavings)) * 12,
    beatsAllVendors: vendors.every((v) => v.monthlySavings > 0),
  };
}

export const formatUsd = (n: number): string =>
  `$${Math.round(Math.abs(n)).toLocaleString("en-US")}`;
