
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  
  // Only show footer on landing page or feature demo pages
  const showFullFooter = location.pathname === "/landing" || location.pathname.startsWith("/feature");
  
  if (!showFullFooter) {
    // Simple footer for main application pages
    return (
      <footer className="bg-gray-50 border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {currentYear} MaintenEase Software. All rights reserved.
        </div>
      </footer>
    );
  }

  const footerLinks = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Integrations", "Updates", "Roadmap"],
    },
    {
      title: "Resources",
      links: ["Documentation", "Guides", "API", "Status", "Help Center"],
    },
    {
      title: "Company",
      links: ["About", "Blog", "Careers", "Customers", "Contact"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Security", "Cookies"],
    },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="mb-4">
              <span className="text-2xl font-bold text-maintenease-600">MaintenEase</span>
            </div>
            <p className="text-gray-600 mb-6 max-w-xs">
              Modern maintenance management software that helps teams organize, track, and optimize their operations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-maintenease-600" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-maintenease-600" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-maintenease-600" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-maintenease-600" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {footerLinks.map((column, idx) => (
            <div key={idx}>
              <h3 className="font-semibold text-gray-900 mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a href="#" className="text-gray-600 hover:text-maintenease-600 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {currentYear} MaintenEase Software. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
