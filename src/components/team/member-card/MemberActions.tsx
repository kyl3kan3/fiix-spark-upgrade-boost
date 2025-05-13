
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface MemberActionsProps {
  onEditClick: () => void;
}

const MemberActions: React.FC<MemberActionsProps> = ({ onEditClick }) => {
  return (
    <Button
      size="icon"
      variant="ghost"
      className="absolute right-3 top-3"
      onClick={onEditClick}
    >
      <Edit className="h-4 w-4" />
    </Button>
  );
};

export default MemberActions;
