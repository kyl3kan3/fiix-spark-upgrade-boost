
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };

    checkAuth();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white shadow-sm py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a href="/" className="flex items-center">
          <span className="text-2xl font-bold text-maintenease-600">MaintenEase</span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-6">
            <a href="#features" className="text-gray-700 hover:text-maintenease-600 font-medium transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-700 hover:text-maintenease-600 font-medium transition-colors">Testimonials</a>
            <a href="#pricing" className="text-gray-700 hover:text-maintenease-600 font-medium transition-colors">Pricing</a>
          </div>
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Button onClick={handleDashboardClick} variant="outline" className="border-maintenease-600 text-maintenease-600 hover:bg-maintenease-50">
                  Dashboard
                </Button>
                <Button onClick={handleProfileClick} className="flex items-center gap-2 bg-maintenease-600 hover:bg-maintenease-700 text-white">
                  <User size={16} />
                  Profile
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" className="border-maintenease-600 text-maintenease-600 hover:bg-maintenease-50">
                    Log In
                  </Button>
                </Link>
                <Link to="/auth?signup=true">
                  <Button className="bg-maintenease-600 hover:bg-maintenease-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700" 
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white absolute w-full p-4 shadow-lg animate-fade-in">
          <div className="flex flex-col space-y-4">
            <a href="#features" className="text-gray-700 hover:text-maintenease-600 font-medium py-2 transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-700 hover:text-maintenease-600 font-medium py-2 transition-colors">Testimonials</a>
            <a href="#pricing" className="text-gray-700 hover:text-maintenease-600 font-medium py-2 transition-colors">Pricing</a>
            <div className="flex flex-col space-y-3 pt-2">
              {isLoggedIn ? (
                <>
                  <Button onClick={handleDashboardClick} variant="outline" className="border-maintenease-600 text-maintenease-600 hover:bg-maintenease-50 w-full">
                    Dashboard
                  </Button>
                  <Button onClick={handleProfileClick} className="bg-maintenease-600 hover:bg-maintenease-700 text-white w-full flex items-center justify-center gap-2">
                    <User size={16} />
                    Profile
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="w-full">
                    <Button variant="outline" className="border-maintenease-600 text-maintenease-600 hover:bg-maintenease-50 w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/auth?signup=true" className="w-full">
                    <Button className="bg-maintenease-600 hover:bg-maintenease-700 text-white w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
