
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

    try {
      console.log("[delete-account] starting");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("[delete-account] session", { hasSession: !!session, sessionError });

      if (sessionError || !session) {
        // No session — nothing to delete on the client side. Just bounce to /auth.
        localStorage.clear();
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        toast({
          title: "Signed out",
          description: "You were already signed out. Redirecting…",
        });
        setIsDeleting(false);
        setOpen(false);
        window.location.href = "/auth";
        return;
      }

      const { data: body, error: invokeError } = await supabase.functions.invoke(
        "delete-user",
        { method: "POST" }
      );
      console.log("[delete-account] invoke result", { body, invokeError });

      // Detect 401 from FunctionsHttpError — the user was already deleted in a
      // prior attempt and the stale JWT is no longer valid. Treat as success.
      const ctx: any = (invokeError as any)?.context;
      const status = ctx?.status ?? ctx?.response?.status;
      const alreadyDeleted = status === 401;

      if ((!invokeError && body?.success) || alreadyDeleted) {
 // Clear all local storage items
 localStorage.clear();
 
 // User deleted successfully - global sign out
 await supabase.auth.signOut({ scope: 'global' });
 
        toast({
          title: "Account Deleted",
          description: alreadyDeleted
            ? "Your account was already deleted. Signing you out."
            : "Your account has been deleted.",
 variant: "default",
 });
 
 setIsDeleting(false);
 setOpen(false);
 
 // Use direct location change instead of navigate to ensure complete reload
 window.location.href = "/auth";
      } else {
        toast({
          title: "Account Deletion Failed",
          description:
            (body as any)?.error || invokeError?.message || "Could not delete your account.",
          variant: "destructive",
        });
      }
 } catch (err: any) {
      console.error("[delete-account] error", err);
 toast({
 title: "Network Error",
 description: err.message || "Failed to connect to server.",
 variant: "destructive",
 });
    } finally {
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
