
import React from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus } from "lucide-react";

interface EmptyWorkOrdersStateProps {
  onCreateWorkOrder: () => void;
}

const EmptyWorkOrdersState: React.FC<EmptyWorkOrdersStateProps> = ({ onCreateWorkOrder }) => {
  return (
    <div className="text-center py-16 bg-card rounded-3xl border-2 border-border">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <ClipboardList className="h-8 w-8 text-muted-foreground" strokeWidth={2} />
      </div>
      <h3 className="font-display font-bold text-xl text-foreground">No jobs yet</h3>
      <p className="mt-2 text-base text-muted-foreground font-medium max-w-md mx-auto px-4">
        When something needs fixing or checking, add it here so your team knows.
      </p>
      <Button
        variant="accent"
        size="lg"
        className="mt-6"
        onClick={onCreateWorkOrder}
      >
        <Plus className="mr-2 h-5 w-5" />
        Report a Problem
      </Button>
    </div>
  );
};

export default EmptyWorkOrdersState;
