import React from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Root-level error boundary. Catches render-time exceptions that escape
 * any lower boundary and shows a "something went wrong" screen instead of
 * a blank page. Reloads the app on retry rather than trying to recover
 * in place — every route is lazy-loaded so a fresh import is cheap.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            The page crashed while rendering. The error has been logged. Reload to try again.
          </p>
          <pre className="rounded bg-muted p-3 text-left text-xs overflow-auto max-h-40">
            {this.state.error.message}
          </pre>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </div>
    );
  }
}
