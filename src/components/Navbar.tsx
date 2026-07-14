
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, User, Building2 } from "lucide-react";
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
    "text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg px-3 py-2 transition-colors";

  return (
    <nav
      className={`fixed w-full z-50 transition-[background-color,box-shadow,padding] duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-md py-2'
          : 'bg-background/95 backdrop-blur-md shadow-sm py-3'
      } border-b border-border/50`}
    >
      <div className="container mx-auto px-4 max-w-7xl flex justify-between items-center gap-3">
        <a href="/" className="flex items-center gap-2 min-w-0 shrink">
          <Building2 className="h-6 w-6 text-primary shrink-0" strokeWidth={1.5} />
          <span className="text-xl font-bold text-primary truncate leading-none font-headline">
            MaintenEase
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-1">
            <a href="/solutions" className={navLinkClass}>Solutions</a>
            <a href="/features" className={navLinkClass}>Features</a>
            <a href="/pricing" className={navLinkClass}>Pricing</a>
            <a href="/blog" className={navLinkClass}>Blog</a>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/5"
                >
                  Dashboard
                </Button>
                <Button
                  onClick={() => navigate("/profile")}
                  className="bg-primary text-primary-foreground hover:bg-primary-variant flex items-center gap-2"
                >
                  <User size={15} />
                  Profile
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="text-primary font-semibold hover:bg-primary/5">
                    Log In
                  </Button>
                </Link>
                <Link to="/auth?signup=true">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary-variant uppercase tracking-wide text-xs font-bold px-6">
                    Start free trial
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-primary shrink-0 -mr-1 p-1"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background absolute left-0 right-0 w-full p-4 shadow-lg border-t border-border">
          <div className="flex flex-col space-y-1">
            <a href="/solutions" className="text-muted-foreground hover:text-primary font-medium py-2.5 border-b border-border/50 text-sm">Solutions</a>
            <a href="/features" className="text-muted-foreground hover:text-primary font-medium py-2.5 border-b border-border/50 text-sm">Features</a>
            <a href="/pricing" className="text-muted-foreground hover:text-primary font-medium py-2.5 border-b border-border/50 text-sm">Pricing</a>
            <a href="/blog" className="text-muted-foreground hover:text-primary font-medium py-2.5 border-b border-border/50 text-sm">Blog</a>
            <div className="flex flex-col gap-2 pt-3">
              {isLoggedIn ? (
                <>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    variant="outline"
                    className="border-primary/20 text-primary hover:bg-primary/5 w-full"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={() => navigate("/profile")}
                    className="bg-primary text-primary-foreground w-full flex items-center justify-center gap-2"
                  >
                    <User size={15} />
                    Profile
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="w-full">
                    <Button variant="outline" className="border-primary text-primary w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/auth?signup=true" className="w-full">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary-variant w-full uppercase tracking-wide text-xs font-bold">
                      Start free trial
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
