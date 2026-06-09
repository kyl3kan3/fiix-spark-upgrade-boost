import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryErrorStateProps {
 title?: string;
 error?: unknown;
 onRetry?: () => void;
 className?: string;
}

/**
 * Inline error state for failed data fetches. Use instead of letting a
 * failed query render as an empty state, which reads as "no data".
 */
const QueryErrorState: React.FC<QueryErrorStateProps> = ({
 title = "Couldn't load data",
 error,
 onRetry,
 className = "",
}) => {
 const message =
 error instanceof Error && error.message
 ? error.message
 : "Something went wrong while loading. Please try again.";

 return (
 <div className={`flex flex-col items-center justify-center py-10 text-center ${className}`}>
 <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
 <p className="font-medium text-foreground">{title}</p>
 <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>
 {onRetry && (
 <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
 <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
 Try again
 </Button>
 )}
 </div>
 );
};

export default QueryErrorState;
