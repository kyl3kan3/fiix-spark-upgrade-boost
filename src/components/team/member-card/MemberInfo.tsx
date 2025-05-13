
import React from "react";
import { Mail, Phone, CircleCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MemberInfoProps {
  member: {
    name: string;
    role: string;
    email: string;
    phone: string;
    joined: string;
    lastActive: string;
    online?: boolean;
  };
  roleColorMap: Record<string, string>;
}

const MemberInfo: React.FC<MemberInfoProps> = ({ member, roleColorMap }) => {
  return (
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
          {member.phone || "No phone number"}
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
  );
};

export default MemberInfo;
