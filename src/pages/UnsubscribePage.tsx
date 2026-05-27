import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State = "validating" | "ready" | "submitting" | "success" | "already" | "invalid" | "error";

const UnsubscribePage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>("validating");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      setMessage("Missing unsubscribe token.");
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } },
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setState("invalid");
          setMessage(json?.error || "This unsubscribe link is invalid or expired.");
          return;
        }
        if (json?.valid === false && json?.reason === "already_unsubscribed") {
          setState("already");
          return;
        }
        setState("ready");
      } catch {
        setState("error");
        setMessage("We couldn't reach the server. Please try again.");
      }
    })();
  }, [token]);

  const handleConfirm = async () => {
    setState("submitting");
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
          body: JSON.stringify({ token }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMessage(json?.error || "Failed to unsubscribe.");
        return;
      }
      if (json?.reason === "already_unsubscribed") setState("already");
      else setState("success");
    } catch {
      setState("error");
      setMessage("We couldn't reach the server. Please try again.");
    }
  };

  return (
    <>
      <Helmet>
        <title>Unsubscribe | MaintenEase</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-6 p-8 border rounded-lg bg-card text-center">
          <h1 className="text-2xl font-semibold">Unsubscribe from emails</h1>
          {state === "validating" && (
            <p className="text-sm text-muted-foreground">Validating link...</p>
          )}
          {state === "ready" && (
            <>
              <p className="text-sm text-muted-foreground">
                Click below to stop receiving non-essential emails from MaintenEase.
              </p>
              <Button className="w-full" onClick={handleConfirm}>Confirm unsubscribe</Button>
            </>
          )}
          {state === "submitting" && (
            <p className="text-sm text-muted-foreground">Processing...</p>
          )}
          {state === "success" && (
            <p className="text-sm">You have been unsubscribed. Sorry to see you go!</p>
          )}
          {state === "already" && (
            <p className="text-sm">This email is already unsubscribed.</p>
          )}
          {(state === "invalid" || state === "error") && (
            <p className="text-sm text-destructive">{message}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UnsubscribePage;