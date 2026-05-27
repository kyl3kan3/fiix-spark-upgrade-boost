import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

let scriptLoadingPromise: Promise<void> | null = null;

const loadTurnstileScript = () => {
  if (scriptLoadingPromise) return scriptLoadingPromise;
  scriptLoadingPromise = new Promise<void>((resolve) => {
    if (typeof window === "undefined") return resolve();
    if (window.turnstile) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile-loader="1"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    s.dataset.turnstileLoader = "1";
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
  return scriptLoadingPromise;
};

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ onVerify, onExpire }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-turnstile-config");
        if (cancelled) return;
        if (error || !data?.siteKey) {
          setError("Verification unavailable");
          return;
        }
        setSiteKey(data.siteKey as string);
      } catch {
        if (!cancelled) setError("Verification unavailable");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let removed = false;
    (async () => {
      await loadTurnstileScript();
      if (removed || !window.turnstile || !containerRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onVerify(token),
        "expired-callback": () => onExpire?.(),
        "error-callback": () => onExpire?.(),
        theme: "auto",
        appearance: "always",
      });
    })();
    return () => {
      removed = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* noop */
        }
      }
    };
  }, [siteKey, onVerify, onExpire]);

  if (error) {
    return <p className="text-xs text-muted-foreground">{error}</p>;
  }

  return <div ref={containerRef} />;
};

export default TurnstileWidget;