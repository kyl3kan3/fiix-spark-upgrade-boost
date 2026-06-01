
import React from "react";
import { Mail, Phone, Building2 } from "lucide-react";

interface MemberInfoProps {
 member: {
 name: string;
 role: string;
 email: string;
 phone: string;
 joined: string;
 lastActive: string;
 online?: boolean;
 companyName?: string;
 };
 roleColorMap: Record<string, string>;
}

const ROLE_PILL: Record<string, string> = {
 admin: "bg-destructive/10 text-destructive",
 administrator: "bg-destructive/10 text-destructive",
 manager: "bg-primary/10 text-primary",
 technician: "bg-success/10 text-success",
 viewer: "bg-muted text-muted-foreground",
};

const MemberInfo: React.FC<MemberInfoProps> = ({ member, roleColorMap }) => {
 const pillClass = ROLE_PILL[member.role] ?? "bg-muted text-muted-foreground";
 return (
 <div className="w-full">
 <h3 className="font-headline text-lg font-semibold text-foreground leading-tight">{member.name}</h3>
 <p className="text-sm font-medium text-primary mt-0.5">
 {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
 </p>
 <div className="mt-3 flex flex-col gap-1.5">
 {member.email && (
 <a href={`mailto:${member.email}`} className="text-xs flex items-center justify-center gap-1.5 text-muted-foreground hover:text-primary transition-colors truncate">
 <Mail className="h-3 w-3 shrink-0" />
 <span className="truncate">{member.email}</span>
 </a>
 )}
 {member.phone && (
 <a href={`tel:${member.phone}`} className="text-xs flex items-center justify-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
 <Phone className="h-3 w-3 shrink-0" />
 {member.phone}
 </a>
 )}
 {member.companyName && (
 <div className="text-xs flex items-center justify-center gap-1.5 text-muted-foreground">
 <Building2 className="h-3 w-3 shrink-0" />
 {member.companyName}
 </div>
 )}
 </div>
 </div>
 );
};

export default MemberInfo;
