import * as React from "react"

import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({ className, ...props }, ref) => {
 return (
 <textarea
 className={cn(
 "flex min-h-[80px] w-full py-2 rounded-md border border-input bg-card px-3 text-sm ring-offset-background placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-150 hover:border-foreground/60 focus-visible:outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
 className
 )}
 ref={ref}
 {...props}
 />
 )
 }
)
Textarea.displayName = "Textarea"

export { Textarea }
