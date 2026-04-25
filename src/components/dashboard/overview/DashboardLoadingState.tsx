import React from "react";

const DashboardLoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background bg-blueprint-grid">
      <div className="ticket-card-accent px-8 py-7 text-center max-w-sm">
        <div className="label-eyebrow mb-3">SYS · INIT</div>
        <div className="font-display text-xl font-semibold mb-1">Preparing workspace</div>
        <div className="text-sm text-muted-foreground mb-5">
          Loading operations data
        </div>
        <div className="h-1 bg-muted overflow-hidden">
          <div className="h-full w-1/3 bg-accent animate-[loading_1.2s_ease-in-out_infinite]" />
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
