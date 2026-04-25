import { Button } from "@/components/ui/button";
import { AUTH_HEADERS } from "@/constants/authConstants";

interface AuthHeaderProps {
  isSignUp: boolean;
  onBackToDashboard?: () => void;
  showBackButton?: boolean;
}

const AuthHeader = ({
  isSignUp,
  onBackToDashboard,
  showBackButton = false,
}: AuthHeaderProps) => {
  return (
    <div className="flex justify-between items-start gap-4">
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-bold tracking-tight leading-none">
          {isSignUp ? AUTH_HEADERS.SIGN_UP : AUTH_HEADERS.SIGN_IN}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isSignUp
            ? "Provision a new operations account."
            : "Resume your shift."}
        </p>
      </div>
      {showBackButton && onBackToDashboard && (
        <Button variant="outline" onClick={onBackToDashboard} size="sm">
          Back
        </Button>
      )}
    </div>
  );
};

export default AuthHeader;
