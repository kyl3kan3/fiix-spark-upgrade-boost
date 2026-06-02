export type DailyPoint = { date: string; count: number };

export interface AnalyticsResponse {
  days: number;
  totals: {
    total_users: number;
    total_companies: number;
    total_leads: number;
    total_locations: number;
    total_assets: number;
    total_work_orders: number;
    new_companies_in_range: number;
    incomplete_signups: number;
    incomplete_signups_disposable: number;
    active_subscriptions: number;
    live_subscriptions: number;
    trialing_subscriptions: number;
    canceled_subscriptions: number;
    past_due_subscriptions: number;
  };
  byTier: { tier: string; count: number }[];
  signupsDaily: DailyPoint[];
  subsCreatedDaily: DailyPoint[];
  trialsStartedDaily: DailyPoint[];
  cancelsDaily: DailyPoint[];
  leadsDaily: DailyPoint[];
  eventsDaily: DailyPoint[];
  visitorsDaily: DailyPoint[];
  companiesCreatedDaily: DailyPoint[];
  uniqueVisitors: number;
  eventBreakdown: { event_type: string; count: number }[];
  topPages: { page_slug: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  trialsEndingSoon: {
    company_id: string;
    company_name: string;
    tier: string;
    trial_ends_at: string;
    days_remaining: number;
  }[];
  recentCompanies: { id: string; name: string; created_at: string }[];
  incompleteSignups: {
    id: string;
    email: string;
    created_at: string;
    age_hours: number;
    disposable: boolean;
  }[];
  generatedAt: string;
}

export const RANGE_OPTIONS = [1, 7, 14, 30, 60, 90] as const;

export const TIER_COLORS: Record<string, string> = {
  starter: "#3B82F6",
  pro: "#8B5CF6",
  business: "#10B981",
};

export const fmtDate = (s: string) => s.slice(5);
