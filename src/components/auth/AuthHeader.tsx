
import { Button } from "@/components/ui/button";

interface AuthHeaderProps {
  isSignUp: boolean;
  onBackToDashboard: () => void;
}

const AuthHeader = ({ isSignUp, onBackToDashboard }: AuthHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-extrabold text-gray-900">
        {isSignUp ? "Create your account" : "Sign in to your account"}
      </h2>
      <Button 
        variant="outline" 
        onClick={onBackToDashboard}
        className="text-sm"
      >
        Back to Dashboard
      </Button>
    </div>
  );
};

export default AuthHeader;
