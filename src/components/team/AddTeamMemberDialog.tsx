
import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const AddTeamMemberDialog = () => {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Team Member</DialogTitle>
        <DialogDescription>
          Enter the details of the new team member to invite them to the platform.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-sm font-medium col-span-1">Name</label>
          <Input className="col-span-3" placeholder="Full name" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-sm font-medium col-span-1">Email</label>
          <Input className="col-span-3" type="email" placeholder="email@example.com" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-sm font-medium col-span-1">Role</label>
          <Select defaultValue="technician">
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="administrator">Administrator</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="technician">Technician</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button>Send Invitation</Button>
      </div>
    </DialogContent>
  );
};

export default AddTeamMemberDialog;
