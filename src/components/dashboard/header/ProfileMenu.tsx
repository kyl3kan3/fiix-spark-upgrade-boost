
import React from "react";
import { Link } from "react-router-dom";
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
        <DropdownMenuItem>
          <Link to="/profile" className="flex items-center w-full cursor-pointer">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/profile?tab=settings" className="flex items-center w-full cursor-pointer">
            <Settings size={16} className="mr-2" />
            Settings
          </Link>
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
