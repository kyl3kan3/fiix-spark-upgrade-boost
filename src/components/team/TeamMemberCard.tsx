
import React, { useState } from "react";
import { Mail, Phone, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UserRoleSelector from "./UserRoleSelector";
import UserInfoEditor from "./UserInfoEditor";

interface TeamMemberProps {
  member: {
    id: string | number;
    name: string;
    role: string;
    email: string;
    phone: string;
    avatar: string;
    joined: string;
    lastActive: string;
  };
  roleColorMap: Record<string, string>;
  onMemberUpdated: () => void;
}

const TeamMemberCard: React.FC<TeamMemberProps> = ({ member, roleColorMap, onMemberUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleRoleUpdated = () => {
    console.log("Role updated for member:", member.id, "- triggering refresh");
    // Make sure to call the parent's onMemberUpdated function to refresh the list
    onMemberUpdated();
  };

  return (
    <div className="card overflow-hidden border rounded-lg" key={`member-${member.id}-${member.role}`}>
      <div className="p-6 relative">
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-3 top-3"
          onClick={() => setIsEditing(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-maintenease-100 text-maintenease-600 flex items-center justify-center font-bold text-lg">
            {member.avatar}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{member.name}</h3>
            <Badge className={`${roleColorMap[member.role]} mt-1 font-normal`}>
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            </Badge>
            <div className="mt-3 flex flex-col gap-1">
              <a href={`mailto:${member.email}`} className="text-sm flex items-center text-blue-600 hover:underline">
                <Mail className="h-3 w-3 mr-1" />
                {member.email}
              </a>
              <a href={`tel:${member.phone}`} className="text-sm flex items-center text-blue-600 hover:underline">
                <Phone className="h-3 w-3 mr-1" />
                {member.phone}
              </a>
              <div className="text-xs text-gray-500 mt-2">
                <div>Joined: {member.joined}</div>
                <div>Last active: {member.lastActive}</div>
              </div>
            </div>
          </div>
        </div>
        
        <UserInfoEditor
          open={isEditing}
          onOpenChange={setIsEditing}
          user={{
            id: member.id.toString(),
            name: member.name,
            email: member.email,
            phone: member.phone,
          }}
          onUserUpdated={onMemberUpdated}
        />
      </div>
      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-medium">Role Access</span>
        <UserRoleSelector 
          userId={member.id.toString()} 
          currentRole={member.role} 
          onRoleUpdated={handleRoleUpdated}
        />
      </div>
    </div>
  );
};

export default TeamMemberCard;
