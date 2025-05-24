
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
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-extrabold text-gray-900">
        {isSignUp ? AUTH_HEADERS.SIGN_UP : AUTH_HEADERS.SIGN_IN}
      </h2>
      {showBackButton && onBackToDashboard && (
        <Button 
          variant="outline" 
          onClick={onBackToDashboard}
          className="text-sm"
        >
          Back to Dashboard
        </Button>
      )}
    </div>
  );
};

export default AuthHeader;
