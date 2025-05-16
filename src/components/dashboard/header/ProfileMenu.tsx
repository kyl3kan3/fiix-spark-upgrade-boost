
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileMenuProps {
  userName: string;
  onLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ userName, onLogout }) => {
  const navigate = useNavigate();
  
  const handleProfileClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="p-1 sm:flex gap-2 items-center justify-between"
        >
          <Avatar className="h-8 w-8 border">
            <AvatarImage alt={userName} />
            <AvatarFallback className="text-xs bg-maintenease-50 text-maintenease-600">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex items-center gap-1">
            <span className="text-sm font-medium line-clamp-1">
              {userName}
            </span>
            <ChevronDown size={16} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={(e) => handleProfileClick(e, "/profile")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => handleProfileClick(e, "/profile?tab=settings")}>
          <Settings size={16} className="mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut size={16} className="mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
