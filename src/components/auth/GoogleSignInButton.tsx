import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

interface GoogleSignInButtonProps {
  label?: string;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  label = "Continue with Google",
  disabled,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed", { description: result.error.message });
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      window.location.assign("/dashboard");
    } catch (err: any) {
      toast.error("Google sign-in failed", { description: err?.message });
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
      disabled={disabled || loading}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.2-5.5 4.2-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.4 14.7 2.4 12 2.4 6.7 2.4 2.5 6.6 2.5 12s4.2 9.6 9.5 9.6c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
        />
      </svg>
      {loading ? "Redirecting..." : label}
    </Button>
  );
};

export default GoogleSignInButton;