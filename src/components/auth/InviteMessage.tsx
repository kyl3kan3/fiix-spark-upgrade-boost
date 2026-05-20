
import { useEffect, useState } from "react";

const InviteMessage = () => {
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("pending_invite_token") : null
  );
  const [company, setCompany] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("pending_invite_company") : null
  );

  useEffect(() => {
    const onCompany = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setCompany(detail);
    };
    const onStorage = () => {
      setToken(localStorage.getItem("pending_invite_token"));
      setCompany(localStorage.getItem("pending_invite_company"));
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
