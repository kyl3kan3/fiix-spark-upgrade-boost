
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AuthenticatedMessageProps {
 onSignOut: () => void;
}

const AuthenticatedMessage = ({ onSignOut }: AuthenticatedMessageProps) => {
 const navigate = useNavigate();
 
 return (
 <div className="bg-success/10 border border-success/30 rounded-md p-4 mb-4">
 <p className="text-success">
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
 className="text-sm text-destructive border-destructive/30"
 onClick={onSignOut}
 >
 Sign Out
 </Button>
 </div>
 </div>
 );
};

export default AuthenticatedMessage;
