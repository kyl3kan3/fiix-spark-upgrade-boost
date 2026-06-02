
import React from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus } from "lucide-react";

interface EmptyWorkOrdersStateProps {
 onCreateWorkOrder: () => void;
}

const EmptyWorkOrdersState: React.FC<EmptyWorkOrdersStateProps> = ({ onCreateWorkOrder }) => {
 return (
 <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-border/60 shadow-sm">
 <div className="mx-auto h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
 <ClipboardList className="h-8 w-8 text-primary" strokeWidth={1.5} />
 </div>
 <h3 className="font-headline font-bold text-xl text-foreground mb-2">No work orders yet</h3>
 <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto px-4 leading-relaxed">
 When something needs fixing or checking, add it here so your team knows what to tackle.
 </p>
 <Button
 variant="default"
 size="lg"
 className="mt-8 gap-2 uppercase tracking-wide font-semibold px-8"
 onClick={onCreateWorkOrder}
 >
 <Plus className="h-4 w-4" />
 Report a Problem
 </Button>
 </div>
 );
};

export default EmptyWorkOrdersState;
