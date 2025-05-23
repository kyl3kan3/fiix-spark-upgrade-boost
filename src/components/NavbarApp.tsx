
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NavbarApp = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("You have been logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-maintenease-600">MaintenEase</span>
          </Link>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/dashboard"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-maintenease-600"
            >
              Dashboard
            </Link>
            <Link
              to="/work-orders"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-maintenease-600"
            >
              Work Orders
            </Link>
            <Link
              to="/assets"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-maintenease-600"
            >
              Assets
            </Link>
            <Link
              to="/inspections"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-maintenease-600"
            >
              Inspections
            </Link>
            <Link
              to="/calendar"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-maintenease-600"
            >
              Calendar
            </Link>
            <Link
              to="/reports"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-maintenease-600"
            >
              Reports
            </Link>
            <Link
              to="/chat"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-maintenease-600"
            >
              Chat
            </Link>
            <Link
              to="/locations"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-maintenease-600"
            >
              Locations
            </Link>
          </nav>

          {/* User menu */}
          <div className="hidden md:flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/team")}>
                  Team
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/help")}>
                  Help
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/setup")}>
                  Setup
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link
                to="/dashboard"
                className="px-3 py-2 text-base font-medium text-gray-700 hover:text-maintenease-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/work-orders"
                className="px-3 py-2 text-base font-medium text-gray-700 hover:text-maintenease-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Work Orders
              </Link>
              <Link
                to="/assets"
                className="px-3 py-2 text-base font-medium text-gray-700 hover:text-maintenease-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Assets
              </Link>
              <Link
                to="/inspections"
                className="px-3 py-2 text-base font-medium text-gray-700 hover:text-maintenease-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Inspections
              </Link>
              <Link
                to="/calendar"
                className="px-3 py-2 text-base font-medium text-gray-700 hover:text-maintenease-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Calendar
              </Link>
              <Link
                to="/reports"
                className="px-3 py-2 text-base font-medium text-gray-700 hover:text-maintenease-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Reports
              </Link>
              <Link
                to="/chat"
                className="px-3 py-2 text-base font-medium text-gray-700 hover:text-maintenease-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Chat
              </Link>
              <Link
                to="/locations"
                className="px-3 py-2 text-base font-medium text-gray-700 hover:text-maintenease-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Locations
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <Link
                  to="/profile"
                  className="px-3 py-2 text-base font-medium text-gray-700 hover:text-maintenease-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/team"
                  className="px-3 py-2 text-base font-medium text-gray-700 hover:text-maintenease-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Team
                </Link>
                <Link
                  to="/help"
                  className="px-3 py-2 text-base font-medium text-gray-700 hover:text-maintenease-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Help
                </Link>
                <Link
                  to="/setup"
                  className="px-3 py-2 text-base font-medium text-gray-700 hover:text-maintenease-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Setup
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavbarApp;
