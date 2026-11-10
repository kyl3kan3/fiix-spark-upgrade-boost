import React from "react";
import { cn } from "@/lib/utils";
import { PAGE_MAX_WIDTH } from "./PageContainer";

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
 <div className={cn("bg-transparent", className)}>
 <div className={cn("mx-auto w-full", PAGE_MAX_WIDTH, "px-4 md:px-6 lg:px-8 pt-6")}>
 <div className="flex items-start justify-between gap-4 flex-wrap">
 <div className="min-w-0">
 <h1 className="font-display text-2xl md:text-[28px] font-bold leading-tight">
 {title}
 </h1>
 {description && (
 <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
 {description}
 </p>
 )}
 </div>
 {actions && (
 <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">{actions}</div>
 )}
 </div>
 {meta && <div className="mt-4">{meta}</div>}
 </div>
 </div>
 );
};

export default PageHeader;
