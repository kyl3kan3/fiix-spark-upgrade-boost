import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import type { AnalyticsResponse } from "./types";

interface UseAdminAnalyticsResult {
  isSuperAdmin: boolean | null;
  data: AnalyticsResponse | null;
  loading: boolean;
  error: string | null;
  days: number;
  setDays: (n: number) => void;
  refresh: () => void;
}

export function useAdminAnalytics(): UseAdminAnalyticsResult {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) { setIsSuperAdmin(false); return; }
      const { data, error } = await supabase.rpc("is_super_admin", { _user_id: user.id });
      if (!cancelled) setIsSuperAdmin(!error && data === true);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const load = async (range: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("admin-analytics", {
        body: {},
        method: "GET",
        // @ts-expect-error supabase-js v2 supports query through invoke options
        query: { days: String(range) },
      });
      if (fnErr) throw fnErr;
      setData(res as AnalyticsResponse);
    } catch (_e) {
      try {
        const session = (await supabase.auth.getSession()).data.session;
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const url = `https://${projectId}.supabase.co/functions/v1/admin-analytics?days=${range}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError((err as Error).message ?? "Failed to load analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) load(days);
  }, [days, isSuperAdmin]);

  return { isSuperAdmin, data, loading, error, days, setDays, refresh: () => load(days) };
}
