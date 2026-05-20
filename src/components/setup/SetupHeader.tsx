
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
 <div className="mb-8 bg-card dark:bg-card p-6 rounded-lg shadow-sm border border-border dark:border-border">
 <div className="flex justify-between items-center mb-2">
 <h1 className="text-2xl font-bold text-foreground dark:text-muted-foreground">{title}</h1>
 <Button 
 variant="outline" 
 size="sm" 
 onClick={handleLogout}
 className="flex items-center gap-1 border-border dark:border-gray-600 text-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-card"
 >
 <LogOut className="h-4 w-4" />
 Sign out
 </Button>
 </div>
 {subtitle && <p className="text-muted-foreground dark:text-muted-foreground">{subtitle}</p>}
 </div>
 );
};

export default SetupHeader;
