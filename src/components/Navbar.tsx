
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MaterialIcon from '@/components/ui/material-icon';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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

  return (
    <nav
      className={`docked full-width top-0 sticky bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md border-b border-outline-variant/30 dark:border-outline/30 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}
      id="main-nav"
    >
      <div className="flex justify-between items-center w-full px-container_padding max-w-7xl mx-auto h-16">
        {/* Brand Logo */}
        <a
          className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary flex items-center gap-2"
          href="/"
        >
          <MaterialIcon name="domain" filled className="text-primary" />
          MaintenEase
        </a>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <a
            className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary hover:bg-primary/5 dark:hover:bg-primary-fixed/10 rounded-lg px-3 py-2 transition-colors"
            href="/solutions"
          >
            Solutions
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary hover:bg-primary/5 dark:hover:bg-primary-fixed/10 rounded-lg px-3 py-2 transition-colors"
            href="/#features"
          >
            Features
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary hover:bg-primary/5 dark:hover:bg-primary-fixed/10 rounded-lg px-3 py-2 transition-colors"
            href="/pricing"
          >
            Pricing
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary hover:bg-primary/5 dark:hover:bg-primary-fixed/10 rounded-lg px-3 py-2 transition-colors"
            href="#resources"
          >
            Resources
          </a>
        </div>

        {/* Trailing Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="font-label-md text-label-md text-primary hover:underline px-4 py-2"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="font-label-md text-label-md bg-primary text-on-primary px-6 py-3 rounded-lg hover:bg-primary-container transition-colors uppercase active:scale-95 transition-transform"
              >
                Profile
              </button>
            </>
          ) : (
            <>
              <Link
                className="font-label-md text-label-md text-primary hover:underline px-4 py-2"
                to="/auth"
              >
                Log In
              </Link>
              <Link
                className="font-label-md text-label-md bg-primary text-on-primary px-6 py-3 rounded-lg hover:bg-primary-container transition-colors uppercase active:scale-95 transition-transform"
                to="/auth?signup=true"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          aria-label="Toggle Menu"
          className="md:hidden text-primary p-2"
          onClick={toggleMobileMenu}
        >
          <MaterialIcon name="menu" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-outline-variant/30">
          <div className="flex flex-col px-container_padding py-4 gap-4">
            <a
              className="font-label-md text-label-md text-on-surface-variant py-2 border-b border-outline-variant/10"
              href="/solutions"
            >
              Solutions
            </a>
            <a
              className="font-label-md text-label-md text-on-surface-variant py-2 border-b border-outline-variant/10"
              href="/#features"
            >
              Features
            </a>
            <a
              className="font-label-md text-label-md text-on-surface-variant py-2 border-b border-outline-variant/10"
              href="/pricing"
            >
              Pricing
            </a>
            <a
              className="font-label-md text-label-md text-on-surface-variant py-2"
              href="#resources"
            >
              Resources
            </a>
            <div className="flex flex-col gap-2 mt-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="font-label-md text-label-md text-primary py-2 text-center border border-primary rounded-lg"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="font-label-md text-label-md bg-primary text-on-primary py-3 rounded-lg text-center uppercase"
                  >
                    Profile
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="font-label-md text-label-md text-primary py-2 text-center border border-primary rounded-lg"
                    to="/auth"
                  >
                    Log In
                  </Link>
                  <Link
                    className="font-label-md text-label-md bg-primary text-on-primary py-3 rounded-lg text-center uppercase"
                    to="/auth?signup=true"
                  >
                    Get Started
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
