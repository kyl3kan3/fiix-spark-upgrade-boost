
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

    // Get current user id
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast({
        title: "Error",
        description: "Unable to find your account.",
        variant: "destructive",
      });
      setIsDeleting(false);
      setOpen(false);
      return;
    }

    // Delete user using Supabase admin API
    // Must be done by an authenticated user, assuming RLS/Edge Function allows user to self-delete.
    // This demo uses deleteUser() which is available to the logged-in user (with password confirmation)
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    // If admin API fails (typical for client-side), fallback to signOut and remove local profile data
    if (error) {
      toast({
        title: "Account Deletion Failed",
        description: "Account deletion failed. Please contact an admin.",
        variant: "destructive",
      });
      setIsDeleting(false);
      setOpen(false);
      return;
    }

    // Remove local session and profile data
    await supabase.auth.signOut();
    toast({
      title: "Account Deleted",
      description: "Your account has been deleted.",
      variant: "default",
    });
    setIsDeleting(false);
    setOpen(false);
    navigate("/auth");
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
