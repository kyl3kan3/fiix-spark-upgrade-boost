
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AuthenticatedMessageProps {
  onSignOut: () => void;
}

const AuthenticatedMessage = ({ onSignOut }: AuthenticatedMessageProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
      <p className="text-green-700">
        You are already signed in.
      </p>
      <div className="mt-2 flex justify-between">
        <Button 
          variant="outline" 
          className="text-sm"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </Button>
        <Button 
          variant="outline" 
          className="text-sm text-red-500 border-red-200"
          onClick={onSignOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default AuthenticatedMessage;
