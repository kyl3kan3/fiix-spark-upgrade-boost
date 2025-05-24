
import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSignOut } from "@/hooks/auth/actions/useSignOut";

const SignOutButton: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, isLoading } = useSignOut();
  
  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      navigate("/auth");
    }
  };

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={handleSignOut}
      disabled={isLoading}
    >
      <LogOut className="h-4 w-4" /> 
      {isLoading ? "Signing out..." : "Sign out"}
    </Button>
  );
};

export default SignOutButton;
