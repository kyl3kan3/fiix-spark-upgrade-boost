
import React from "react";
import { Button } from "@/components/ui/button";

interface ProfileActionsProps {
  editMode: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: (e: React.FormEvent) => Promise<boolean>;
  onCancel: () => void;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  editMode,
  isSaving,
  onEdit,
  onSave,
  onCancel,
}) => {
  if (editMode) {
    return (
      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={isSaving}
          onClick={onSave}
          aria-label="Save changes"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSaving}
          aria-label="Cancel editing"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" onClick={onEdit}>
      Edit Profile
    </Button>
  );
};
