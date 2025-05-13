
import { Button } from "@/components/ui/button";

interface AuthHeaderProps {
  isSignUp: boolean;
  onBackToDashboard?: () => void;  // Make this optional
  showBackButton?: boolean;       // Add new prop to control visibility
}

const AuthHeader = ({ 
  isSignUp, 
  onBackToDashboard,
  showBackButton = false  // Default to false
}: AuthHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-extrabold text-gray-900">
        {isSignUp ? "Create your account" : "Sign in to your account"}
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
