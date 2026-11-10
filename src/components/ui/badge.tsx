import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
 "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-semibold leading-5 tabular-nums transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
 {
 variants: {
 variant: {
 default:
 "border-foreground/80 bg-foreground text-background",
 secondary:
 "border-border bg-muted text-foreground",
 outline:
 "border-border bg-transparent text-foreground",
 accent:
 "border-foreground/15 bg-highlight text-highlight-foreground",
 success:
 "border-success/35 bg-success/10 text-success",
 warning:
 "border-warning/40 bg-warning/10 text-warning",
 info:
 "border-info/40 bg-info/10 text-info",
 destructive:
 "border-destructive/40 bg-destructive/10 text-destructive",
 muted:
 "border-border bg-muted text-muted-foreground",
 },
 },
 defaultVariants: { variant: "default" },
 }
)

export interface BadgeProps
 extends React.HTMLAttributes<HTMLDivElement>,
 VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
 return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
