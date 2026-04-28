import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Mono code shown above title, e.g. "DSH · 001" */
  code?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Optional KPI / meta strip rendered below the title row */
  meta?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  code, title, description, actions, meta, className,
}) => {
  return (
    <div className={cn("hairline-b bg-background", className)}>
      <div className="px-4 md:px-6 lg:px-8 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="font-display text-2xl md:text-3xl lg:text-[34px] font-extrabold tracking-tight leading-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-base text-muted-foreground max-w-2xl font-medium">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
        {meta && <div className="mt-4">{meta}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
