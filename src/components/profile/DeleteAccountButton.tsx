
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Ban } from "lucide-react";

const DeleteAccountButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    setIsDeleting(true);

    // Get current session to get the jwt token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      toast({
        title: "Error",
        description: "No user session found.",
        variant: "destructive",
      });
      setIsDeleting(false);
      setOpen(false);
      return;
    }

    try {
      const res = await fetch("https://gowdckitwgmctqlpqzod.functions.supabase.co/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        }
      });

      const body = await res.json();

      if (res.ok && body.success) {
        // Clear all local storage items
        localStorage.clear();
        
        // User deleted successfully - global sign out
        await supabase.auth.signOut({ scope: 'global' });
        
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted.",
          variant: "default",
        });
        
        setIsDeleting(false);
        setOpen(false);
        
        // Use direct location change instead of navigate to ensure complete reload
        window.location.href = "/auth";
      } else {
        toast({
          title: "Account Deletion Failed",
          description: body.error || "Could not delete your account.",
          variant: "destructive",
        });
        setIsDeleting(false);
        setOpen(false);
      }
    } catch (err: any) {
      toast({
        title: "Network Error",
        description: err.message || "Failed to connect to server.",
        variant: "destructive",
      });
      setIsDeleting(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-full flex items-center gap-2 mt-4"
        >
          <Ban className="w-4 h-4" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-red-600 font-medium mb-2">
            This action is irreversible. All your data will be permanently deleted.
          </p>
          <p>
            Are you sure you want to continue?
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountButton;
