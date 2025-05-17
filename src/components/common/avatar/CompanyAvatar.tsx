
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2 } from "lucide-react";

interface CompanyAvatarProps {
  logoUrl?: string | null;
  companyName?: string;
  size?: "sm" | "md" | "lg";
}

export const CompanyAvatar: React.FC<CompanyAvatarProps> = ({ 
  logoUrl, 
  companyName = "Company",
  size = "md"
}) => {
  // Calculate size class based on the size prop
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16"
  }[size];
  
  // Get initials for the fallback
  const initials = companyName
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Avatar className={sizeClass}>
      {logoUrl && <AvatarImage src={logoUrl} alt={companyName} />}
      <AvatarFallback className="bg-maintenease-100 text-maintenease-800">
        {logoUrl ? null : initials || <Building2 className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
};
