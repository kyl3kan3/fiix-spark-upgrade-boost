
import React, { useState } from "react";
import { Mail, Phone, Edit, CircleCheck } from "lucide-react";
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
    firstName?: string;
    lastName?: string;
    online?: boolean;
  };
  roleColorMap: Record<string, string>;
  onMemberUpdated: (userId: string, updates: {
    firstName?: string;
    lastName?: string;
    role?: string;
    email?: string;
  }) => void;
}

const TeamMemberCard: React.FC<TeamMemberProps> = ({ member, roleColorMap, onMemberUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleRoleUpdated = (role: string) => {
    console.log("Role updated for member:", member.id, "to role:", role);
    // Call the parent's onMemberUpdated function
    onMemberUpdated(member.id.toString(), { role });
  };

  const handleUserInfoUpdated = (updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }) => {
    onMemberUpdated(member.id.toString(), updates);
    setIsEditing(false);
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
          <div className="h-12 w-12 rounded-full bg-maintenease-100 text-maintenease-600 flex items-center justify-center font-bold text-lg relative">
            {member.avatar}
            {member.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
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
                <div className="flex items-center">
                  Status: {member.online ? (
                    <span className="text-green-600 flex items-center ml-1">
                      <CircleCheck className="h-3 w-3 mr-1" />
                      Online
                    </span>
                  ) : (
                    <span className="text-gray-500 ml-1">Last active: {member.lastActive}</span>
                  )}
                </div>
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
            firstName: member.firstName,
            lastName: member.lastName,
          }}
          onUserUpdated={(updates) => handleUserInfoUpdated(updates)}
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
