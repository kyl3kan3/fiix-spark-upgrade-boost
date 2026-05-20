
import React from "react";
import { 
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteWorkOrderDialogProps {
 isOpen: boolean;
 onClose: () => void;
 onDelete: () => void;
 isDeleting?: boolean;
}

export const DeleteWorkOrderDialog: React.FC<DeleteWorkOrderDialogProps> = ({ 
 isOpen, 
 onClose, 
 onDelete,
 isDeleting = false,
}) => {
 return (
 <Dialog open={isOpen} onOpenChange={onClose}>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Delete Work Order</DialogTitle>
 <DialogDescription>
 Are you sure you want to delete this work order? This action cannot be undone.
 </DialogDescription>
 </DialogHeader>
 <DialogFooter>
 <Button 
 variant="outline" 
 onClick={onClose}
 disabled={isDeleting}
 >
 Cancel
 </Button>
 <Button 
 variant="destructive" 
 onClick={onDelete}
 disabled={isDeleting}
 >
 {isDeleting ? "Deleting…" : "Delete"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 );
};
