/**
 * Pure math behind the /cmms-cost-calculator page.
 *
 * Competitor per-user prices come from src/data/comparisons.ts (the same
 * figures, with the same "publicly listed 2026 tiers, illustrative" caveat,
 * used by FlatFeeAdvantage and the /compare pages) so every surface tells one
 * consistent story. Deliberately honest: some per-seat rivals cost less at
 * certain team sizes, so savings go negative and the UI shows it alongside
 * each rival's crossover team size.
 */
import { comparisons } from "@/data/comparisons";
import { getMaintenEaseTeamPrice } from "@/data/productCatalog";

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
  /** Lowest published MaintenEase monthly plan that covers the seat count. */
  maintenease: number;
  mainteneasePlan: string;
  mainteneaseExtraSeats: number;
  /** One row per competitor, most expensive first. */
  vendors: VendorCost[];
  /** Largest monthly figure on the board (for scaling bars). */
  maxMonthly: number;
  /** Annual savings vs the priciest rival at this team size. */
  bestAnnualSavings: number;
  /** True when every listed rival costs more than the applicable account plan. */
  beatsAllVendors: boolean;
}

export const clampTeamSize = (n: number): number => {
  if (!Number.isFinite(n)) return DEFAULT_TEAM_SIZE;
  return Math.min(MAX_TEAM_SIZE, Math.max(MIN_TEAM_SIZE, Math.round(n)));
};

/** First team size where the listed per-user plan costs more than MaintenEase. */
export const breakevenTeamSize = (perUser: number): number => {
  for (let teamSize = MIN_TEAM_SIZE; teamSize <= MAX_TEAM_SIZE; teamSize += 1) {
    if (teamSize * perUser > getMaintenEaseTeamPrice(teamSize).monthlyPrice) {
      return teamSize;
    }
  }
  return MAX_TEAM_SIZE + 1;
};

export function computeCmmsCosts(rawTeamSize: number): CmmsCostResult {
  const teamSize = clampTeamSize(rawTeamSize);
  const maintenease = getMaintenEaseTeamPrice(teamSize);

  const vendors: VendorCost[] = comparisons
    .map((c) => {
      const monthly = c.competitorPricePerUser * teamSize;
      return {
        name: c.competitor,
        plan: c.competitorPlan,
        perUser: c.competitorPricePerUser,
        monthly,
        monthlySavings: monthly - maintenease.monthlyPrice,
        breakevenTeamSize: breakevenTeamSize(c.competitorPricePerUser),
      };
    })
    .sort((a, b) => b.monthly - a.monthly);

  const maxMonthly = Math.max(maintenease.monthlyPrice, ...vendors.map((v) => v.monthly));

  return {
    teamSize,
    maintenease: maintenease.monthlyPrice,
    mainteneasePlan: maintenease.plan.name,
    mainteneaseExtraSeats: maintenease.extraSeats,
    vendors,
    maxMonthly,
    bestAnnualSavings: Math.max(0, ...vendors.map((v) => v.monthlySavings)) * 12,
    beatsAllVendors: vendors.every((v) => v.monthlySavings > 0),
  };
}

export const formatUsd = (n: number): string =>
  `$${Math.round(Math.abs(n)).toLocaleString("en-US")}`;
