import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RANGE_OPTIONS } from "./types";

interface AnalyticsHeaderProps {
  days: number;
  setDays: (n: number) => void;
  loading: boolean;
  generatedAt?: string;
  onRefresh: () => void;
}

export function AnalyticsHeader({ days, setDays, loading, generatedAt, onRefresh }: AnalyticsHeaderProps) {
  const navigate = useNavigate();
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/dashboard")}
        className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Site Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Signups, subscriptions, marketing engagement across MaintenEase.
            {generatedAt && (
              <span className="ml-2">
                Updated {new Date(generatedAt).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border overflow-hidden">
            {RANGE_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={`px-3 py-1.5 text-sm transition ${
                  days === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted text-foreground"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-1 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>
    </>
  );
}
