
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
  showBackButton = false
}: AuthHeaderProps) => {
  return (
    <div className="flex justify-between items-start gap-4">
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground leading-tight">
          {isSignUp ? AUTH_HEADERS.SIGN_UP : AUTH_HEADERS.SIGN_IN}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isSignUp
            ? "Get started in less than a minute."
            : "Welcome back. Pick up where you left off."}
        </p>
      </div>
      {showBackButton && onBackToDashboard && (
        <Button 
          variant="outline" 
          onClick={onBackToDashboard}
          size="sm"
          className="text-sm shrink-0"
        >
          Back to Dashboard
        </Button>
      )}
    </div>
  );
};

export default AuthHeader;
