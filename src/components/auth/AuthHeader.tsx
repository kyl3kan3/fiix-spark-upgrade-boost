
import { Button } from "@/components/ui/button";

interface AuthHeaderProps {
  isSignUp: boolean;
  onBackToDashboard?: () => void;  // Make this optional
  showBackButton?: boolean;
}

const AuthHeader = ({ 
  isSignUp, 
  onBackToDashboard,
  showBackButton = false
}: AuthHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-3xl font-extrabold bg-gradient-to-br from-[#9b87f5] via-[#d6bcfa] to-[#1a1f2c] bg-clip-text text-transparent transition-all duration-300
      animate-fade-in
      ">
        {isSignUp ? "Create your account" : "Sign in to your account"}
      </h2>
      {showBackButton && onBackToDashboard && (
        <Button 
          variant="outline"
          onClick={onBackToDashboard}
          className="text-sm border border-[#d6bcfa] text-[#9b87f5] hover:border-[#9b87f5] bg-white/80 hover:bg-[#f7f1ff] shadow-sm
            animate-fade-in transition-all duration-300"
        >
          Back to Dashboard
        </Button>
      )}
    </div>
  );
};

export default AuthHeader;
