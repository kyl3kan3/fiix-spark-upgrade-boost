import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
 const location = useLocation();
 useEffect(() => {
 console.error("404 Error: User attempted to access non-existent route:", location.pathname);
 }, [location.pathname]);

 return (
 <div className="min-h-screen flex items-center justify-center bg-background bg-blueprint-grid p-6">
 <Helmet>
 <title>Page not found | MaintenEase</title>
 <meta name="description" content="The page you're looking for doesn't exist. Return to the MaintenEase dashboard or visit the homepage to find what you need." />
 <meta name="robots" content="noindex" />
 </Helmet>
 <div className="ticket-card-accent p-8 max-w-md w-full">
 <div className="label-eyebrow mb-3 flex items-center justify-between">
 <span>ERR · 404</span>
 <span className="text-destructive">●</span>
 </div>
 <h1 className="font-display text-7xl font-bold leading-none tracking-normal mb-2">404</h1>
 <div className="divider-ticked my-4" />
 <p className="font-display text-lg font-semibold mb-1">Page not found</p>
 <p className="text-sm text-muted-foreground mb-1">
 Path <span className="font-mono text-foreground">{location.pathname}</span> is not on file.
 </p>
 <p className="text-xs text-muted-foreground mb-6">
 The page may have moved, been renamed, or never existed.
 </p>
 <div className="flex flex-col sm:flex-row gap-2">
 <Button variant="outline" asChild className="flex-1">
 <Link to="/dashboard">Back to Dashboard</Link>
 </Button>
 <Button variant="accent" asChild className="flex-1">
 <Link to="/">Return Home</Link>
 </Button>
 </div>
 </div>
 </div>
 );
};

export default NotFound;
