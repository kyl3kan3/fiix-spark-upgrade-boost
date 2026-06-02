
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

interface SetupHeaderProps {
  title: string;
  subtitle?: string;
}

const SetupHeader: React.FC<SetupHeaderProps> = ({ title, subtitle }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("You have been logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-primary leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="border-border text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default SetupHeader;
