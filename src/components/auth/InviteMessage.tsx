
import { useEffect, useState } from "react";

const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const InviteMessage = () => {
  const [token, setToken] = useState<string | null>(() => safeGetItem("pending_invite_token"));
  const [company, setCompany] = useState<string | null>(() => safeGetItem("pending_invite_company"));

  useEffect(() => {
    const onCompany = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setCompany(detail);
    };
    const onStorage = () => {
      setToken(safeGetItem("pending_invite_token"));
      setCompany(safeGetItem("pending_invite_company"));
    };
    window.addEventListener("pending-invite-company-resolved", onCompany);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("pending-invite-company-resolved", onCompany);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!token) return null;

  return (
    <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 p-4">
      <p className="text-sm text-foreground">
        {company ? (
          <>
            You've been invited to join <span className="font-semibold">{company}</span>.
            Create your account below to accept the invitation.
          </>
        ) : (
          <>You're accepting an invitation. Create your account below to join the team.</>
        )}
      </p>
    </div>
  );
};

export default InviteMessage;
