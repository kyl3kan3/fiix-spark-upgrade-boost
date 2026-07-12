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
        <h2 className="font-headline text-3xl font-bold tracking-normal text-foreground leading-tight">
          {isSignUp ? AUTH_HEADERS.SIGN_UP : "Welcome back"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isSignUp
            ? "Start managing your facilities with precision."
            : "Enter your credentials to access your dashboard."}
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
