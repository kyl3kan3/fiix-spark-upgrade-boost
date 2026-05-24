import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import { Sentry } from "@/lib/sentry";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  error: Error | null;
  eventId: string | null;
}

/**
 * Root error boundary. Catches render-time exceptions that escape any
 * lower boundary and shows a recoverable "something went wrong" screen
 * instead of a blank page. Errors are forwarded to logger.error so they
 * still surface in production. Retry reloads the app — every route is
 * lazy-loaded so a fresh import is cheap.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, eventId: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, eventId: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error("[ErrorBoundary]", error, info.componentStack);
    const eventId = Sentry.captureException(error, {
      contexts: { react: { componentStack: info.componentStack } },
      tags: { source: "react_error_boundary" },
    });
    this.setState({ eventId });
  }

  private handleRetry = () => {
    // Clear the error so children re-render fresh. Routes are lazy-loaded
    // so re-importing a clean chunk is cheap and usually succeeds.
    this.setState({ error: null, eventId: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.assign("/");
  };

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    const { error, eventId } = this.state;
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-5 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              We hit an unexpected error while rendering this page. The issue has been
              logged and our team has been notified.
            </p>
          </div>
          <details className="rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground">
              Technical details
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words">
              {error.message}
            </pre>
            {eventId && (
              <p className="mt-2 font-mono text-[10px]">Event ID: {eventId}</p>
            )}
          </details>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={this.handleRetry}>Try again</Button>
            <Button variant="outline" onClick={this.handleReload}>
              Reload page
            </Button>
            <Button variant="ghost" onClick={this.handleGoHome}>
              Go home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
