
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/maintenease-logo.png";

const Footer = () => {
 const currentYear = new Date().getFullYear();
 const location = useLocation();
 
 // Show full marketing footer on landing/feature and SEO marketing routes
 const p = location.pathname;
 const showFullFooter =
 p === "/landing" ||
 p.startsWith("/feature") ||
 p.startsWith("/learn") ||
 p.startsWith("/solutions");
 
 if (!showFullFooter) {
 // Simple footer for main application pages
 return (
 <footer className="bg-muted border-t border-border py-4">
 <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center text-sm text-foreground">
 <span>&copy; {currentYear} Decent4. All rights reserved.</span>
 <span className="hidden sm:inline">·</span>
 <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
 <Link to="/terms" className="hover:text-foreground">Terms</Link>
 <Link to="/refund-policy" className="hover:text-foreground">Refunds</Link>
 </div>
 </footer>
 );
 }

 const footerLinks = [
 {
 title: "Product",
 links: [
 { label: "Features", to: "#" },
 { label: "Pricing", to: "/pricing" },
 { label: "Request Portal", to: "/solutions/maintenance-request-portal" },
 { label: "Integrations", to: "#" },
 { label: "Updates", to: "#" },
 { label: "Roadmap", to: "#" },
 ],
 },
 {
 title: "Resources",
 links: [
 { label: "Glossary", to: "/learn" },
 { label: "Solutions", to: "/solutions" },
 { label: "API", to: "#" },
 { label: "Status", to: "#" },
 { label: "Help Center", to: "#" },
 ],
 },
 {
 title: "Company",
 links: [
 { label: "About", to: "#" },
 { label: "Blog", to: "#" },
 { label: "Careers", to: "#" },
 { label: "Customers", to: "#" },
 { label: "Contact", to: "#" },
 ],
 },
 {
 title: "Legal",
 links: [
 { label: "Privacy", to: "/privacy" },
 { label: "Terms", to: "/terms" },
 { label: "Refund Policy", to: "/refund-policy" },
 ],
 },
 ];

 return (
 <footer className="bg-muted border-t border-border">
 <div className="container mx-auto px-4 py-12 md:py-16">
 <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
 <div className="col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <img src={logo} alt="MaintenEase" className="h-9 w-9" />
            <span className="text-2xl font-bold text-maintenease-600">MaintenEase</span>
          </div>
 <p className="text-foreground mb-6 max-w-xs">
 Modern maintenance management software that helps teams organize, track, and optimize their operations.
 </p>
 <div className="flex space-x-4">
 <a href="#" className="text-muted-foreground hover:text-maintenease-600" aria-label="Twitter">
 <Twitter className="h-5 w-5" />
 </a>
 <a href="#" className="text-muted-foreground hover:text-maintenease-600" aria-label="Facebook">
 <Facebook className="h-5 w-5" />
 </a>
 <a href="#" className="text-muted-foreground hover:text-maintenease-600" aria-label="Instagram">
 <Instagram className="h-5 w-5" />
 </a>
 <a href="#" className="text-muted-foreground hover:text-maintenease-600" aria-label="LinkedIn">
 <Linkedin className="h-5 w-5" />
 </a>
 </div>
 </div>

 {footerLinks.map((column, idx) => (
 <div key={idx}>
 <h3 className="font-semibold text-foreground mb-4">{column.title}</h3>
 <ul className="space-y-3">
 {column.links.map((link, linkIdx) => (
 <li key={linkIdx}>
 {link.to.startsWith("/") ? (
 <Link to={link.to} className="text-foreground hover:text-maintenease-600 transition-colors">
 {link.label}
 </Link>
 ) : (
 <a href={link.to} className="text-foreground hover:text-maintenease-600 transition-colors">
 {link.label}
 </a>
 )}
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>

 <div className="mt-12 pt-8 border-t border-border">
 <div className="flex flex-col md:flex-row justify-between items-center">
 <p className="text-muted-foreground text-sm mb-4 md:mb-0">
 &copy; {currentYear} Decent4. All rights reserved.
 </p>
 <div className="flex space-x-6">
 <Link to="/privacy" className="text-muted-foreground hover:text-foreground text-sm">
 Privacy Policy
 </Link>
 <Link to="/terms" className="text-muted-foreground hover:text-foreground text-sm">
 Terms of Service
 </Link>
 <Link to="/refund-policy" className="text-muted-foreground hover:text-foreground text-sm">
 Refund Policy
 </Link>
 </div>
 </div>
 </div>
 </div>
 </footer>
 );
};

export default Footer;
