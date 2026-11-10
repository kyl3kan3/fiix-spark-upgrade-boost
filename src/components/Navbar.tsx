
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import BrandMark from "@/components/shell/BrandMark";
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };

    checkAuth();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navLinkClass =
    "text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2 transition-colors duration-150";

  return (
    <nav
      className={`fixed w-full z-50 bg-card border-b border-border transition-[box-shadow,padding] duration-200 ${
        isScrolled ? 'shadow-md py-2' : 'py-3'
      }`}
    >
      <div className="container mx-auto px-4 max-w-7xl flex justify-between items-center gap-3">
        <Link to="/" aria-label="MaintenEase home" className="flex items-center gap-2 min-w-0 shrink">
          <BrandMark />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-1">
            <Link to="/solutions" className={navLinkClass}>Solutions</Link>
            <Link to="/templates" className={navLinkClass}>Templates</Link>
            <Link to="/mcp" className={navLinkClass}>MCP</Link>
            <Link to="/features" className={navLinkClass}>Features</Link>
            <Link to="/pricing" className={navLinkClass}>Pricing</Link>
            <Link to="/blog" className={navLinkClass}>Blog</Link>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                >
                  Dashboard
                </Button>
                <Button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2"
                >
                  <User size={15} />
                  Profile
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth?signup=true">Start free trial</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground shrink-0 -mr-1 p-1 rounded-md hover:bg-muted"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card absolute left-0 right-0 w-full p-4 shadow-lg border-t border-border">
          <div className="flex flex-col space-y-1">
            <a href="/solutions" className="text-foreground font-medium py-3 border-b border-border text-sm">Solutions</a>
            <a href="/templates" className="text-foreground font-medium py-3 border-b border-border text-sm">Templates</a>
            <a href="/mcp" className="text-foreground font-medium py-3 border-b border-border text-sm">MCP</a>
            <a href="/features" className="text-foreground font-medium py-3 border-b border-border text-sm">Features</a>
            <a href="/pricing" className="text-foreground font-medium py-3 border-b border-border text-sm">Pricing</a>
            <a href="/blog" className="text-foreground font-medium py-3 border-b border-border text-sm">Blog</a>
            <div className="flex flex-col gap-2 pt-3">
              {isLoggedIn ? (
                <>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    variant="outline"
                    className="w-full"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <User size={15} />
                    Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/auth">Log In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/auth?signup=true">Start free trial</Link>
                  </Button>
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
