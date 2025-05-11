
import React from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger
} from "@/components/ui/dialog";
import AddTeamMemberDialog from "./AddTeamMemberDialog";

const TeamHeader = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-500">Manage your maintenance team and permissions</p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-maintenease-600 hover:bg-maintenease-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </DialogTrigger>
        <AddTeamMemberDialog />
      </Dialog>
    </div>
  );
};

export default TeamHeader;
