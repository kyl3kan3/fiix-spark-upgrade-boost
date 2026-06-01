import { Link, useLocation } from 'react-router-dom';
import MaterialIcon from '@/components/ui/material-icon';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  // Show full marketing footer on landing/feature and SEO marketing routes
  const p = location.pathname;
  const showFullFooter =
    p === "/" ||
    p === "/landing" ||
    p.startsWith("/feature") ||
    p.startsWith("/learn") ||
    p.startsWith("/solutions") ||
    p === "/pricing";

  if (!showFullFooter) {
    // Simple footer for main application pages
    return (
      <footer className="bg-muted/50 border-t border-border py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center text-sm text-muted-foreground">
          <span>&copy; {currentYear} Decent4. All rights reserved.</span>
          <span className="hidden sm:inline">·</span>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="/refund-policy" className="hover:text-foreground transition-colors">Refunds</Link>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full py-12 bg-on-background dark:bg-on-secondary-fixed text-on-primary dark:text-on-secondary border-t border-outline/20 font-body-md text-body-md transition-all duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center px-container_padding max-w-7xl mx-auto gap-gutter">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="font-headline-md text-headline-md font-bold text-surface-bright flex items-center gap-2">
            <MaterialIcon name="domain" filled className="text-surface-bright" />
            MaintenEase
          </div>
          <div className="font-label-sm text-label-sm text-outline-variant dark:text-secondary-fixed-dim">
            © {currentYear} MaintenEase CMMS. Precision Facility Management.
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 font-label-sm text-label-sm">
          <Link to="/pricing" className="text-outline-variant dark:text-secondary-fixed-dim hover:text-surface-bright hover:underline transition-colors">Product</Link>
          <Link to="/solutions" className="text-outline-variant dark:text-secondary-fixed-dim hover:text-surface-bright hover:underline transition-colors">Solutions</Link>
          <Link to="/privacy" className="text-outline-variant dark:text-secondary-fixed-dim hover:text-surface-bright hover:underline transition-colors">Privacy</Link>
          <a href="#" className="text-outline-variant dark:text-secondary-fixed-dim hover:text-surface-bright hover:underline transition-colors">Compliance</a>
          <a href="#" className="text-outline-variant dark:text-secondary-fixed-dim hover:text-surface-bright hover:underline transition-colors">Status</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
