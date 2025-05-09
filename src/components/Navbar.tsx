
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a href="/" className="flex items-center">
          <span className="text-2xl font-bold text-fiix-600">Fiix</span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-6">
            <a href="#features" className="text-gray-700 hover:text-fiix-600 font-medium transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-700 hover:text-fiix-600 font-medium transition-colors">Testimonials</a>
            <a href="#pricing" className="text-gray-700 hover:text-fiix-600 font-medium transition-colors">Pricing</a>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-fiix-600 text-fiix-600 hover:bg-fiix-50">
              Log In
            </Button>
            <Button className="bg-fiix-600 hover:bg-fiix-700 text-white">
              Get Started
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white absolute w-full p-4 shadow-lg animate-fade-in">
          <div className="flex flex-col space-y-4">
            <a href="#features" className="text-gray-700 hover:text-fiix-600 font-medium py-2 transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-700 hover:text-fiix-600 font-medium py-2 transition-colors">Testimonials</a>
            <a href="#pricing" className="text-gray-700 hover:text-fiix-600 font-medium py-2 transition-colors">Pricing</a>
            <div className="flex flex-col space-y-3 pt-2">
              <Button variant="outline" className="border-fiix-600 text-fiix-600 hover:bg-fiix-50 w-full">
                Log In
              </Button>
              <Button className="bg-fiix-600 hover:bg-fiix-700 text-white w-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
