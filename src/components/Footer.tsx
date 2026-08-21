
import { Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
 const currentYear = new Date().getFullYear();
 const location = useLocation();
 
 // Show full marketing footer on landing/feature and SEO marketing routes
 const p = location.pathname;
 const showFullFooter =
 p === "/landing" ||
 p.startsWith("/feature") ||
 p.startsWith("/learn") ||
 p.startsWith("/solutions") ||
 p.startsWith("/compare") ||
 p.startsWith("/templates") ||
p === "/about" ||
p === "/editorial-policy" ||
 p === "/mcp" ||
 p === "/support";
 
 if (!showFullFooter) {
 // Simple footer for main application pages
 return (
  <footer className="bg-muted/50 border-t border-border py-4">
  <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
      <span>&copy; {currentYear} Decent4. All rights reserved.</span>
      <span className="hidden sm:inline">·</span>
      <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
      <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
      <Link to="/refund-policy" className="hover:text-foreground transition-colors">Refunds</Link>
      <span className="hidden sm:inline">·</span>
      <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
      <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
    </div>
  </div>
  </footer>
 );
 }

 const footerLinks = [
 {
 title: "Product",
 links: [
 { label: "Features", to: "/features" },
 { label: "Pricing", to: "/pricing" },
 { label: "Request Portal", to: "/solutions/maintenance-request-portal" },
 ],
 },
 {
 title: "Resources",
 links: [
 { label: "Glossary", to: "/learn" },
 { label: "Free Templates", to: "/templates" },
 { label: "MCP for AI", to: "/mcp" },
 { label: "Solutions", to: "/solutions" },
 { label: "Maintenance Simplified", to: "/maintenance-simplified" },
 { label: "Compare CMMS", to: "/compare" },
 { label: "Cost Calculator", to: "/cmms-cost-calculator" },
 { label: "MCP server card", to: "https://maintenease.com/.well-known/mcp/server-card.json" },
 { label: "Support", to: "/support" },
 ],
 },
 {
 title: "Company",
 links: [
 { label: "Why MaintenEase", to: "/landing" },
 { label: "About", to: "/about" },
 { label: "Blog", to: "/blog" },
 { label: "Editorial Policy", to: "/editorial-policy" },
          { label: "Contact", to: "mailto:info@decent4.com" },
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
 <footer className="bg-foreground text-background border-t border-border/20">
 <div className="container mx-auto px-4 py-12 md:py-16">
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
 <div className="col-span-2">
           <Link to="/" aria-label="MaintenEase home" className="mb-4 inline-flex items-center gap-2">
             <Building2 className="h-6 w-6 text-background/80" strokeWidth={1.5} />
             <span className="text-2xl font-bold text-background font-headline">MaintenEase</span>
           </Link>
 <p className="text-background/85 mb-6 max-w-xs text-sm leading-relaxed">
 Modern maintenance management software that helps teams organize, track, and optimize their operations.
 </p>
 <p className="text-background/70 text-sm">Operated by Decent4 · <a className="underline underline-offset-4 hover:text-background" href="mailto:info@decent4.com">info@decent4.com</a></p>
 </div>

 {footerLinks.map((column, idx) => (
 <div key={idx}>
 <h3 className="font-semibold text-background mb-4 text-sm uppercase tracking-wide">{column.title}</h3>
 <ul className="space-y-3">
 {column.links.map((link, linkIdx) => (
 <li key={linkIdx}>
 {link.to.startsWith("/") ? (
 <Link to={link.to} className="text-background/85 hover:text-background transition-colors text-sm">
 {link.label}
 </Link>
 ) : (
 <a href={link.to} className="text-background/85 hover:text-background transition-colors text-sm">
 {link.label}
 </a>
 )}
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>

  <div className="mt-12 pt-8 border-t border-background/10">
  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
  <p className="text-background/80 text-sm mb-0">
  &copy; {currentYear} Decent4. All rights reserved.
  </p>
  <div className="flex space-x-6">
  <Link to="/privacy" className="text-background/80 hover:text-background text-sm transition-colors">
  Privacy Policy
  </Link>
  <Link to="/terms" className="text-background/80 hover:text-background text-sm transition-colors">
  Terms of Service
  </Link>
  <Link to="/refund-policy" className="text-background/80 hover:text-background text-sm transition-colors">
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
