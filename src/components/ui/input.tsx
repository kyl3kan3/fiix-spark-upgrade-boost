import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
 ({ className, type, ...props }, ref) => {
 return (
 <input
 type={type}
 className={cn(
 "flex h-10 w-full py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground rounded-md border border-input bg-card px-3 text-sm ring-offset-background placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-150 hover:border-foreground/60 focus-visible:outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
 className
 )}
 ref={ref}
 {...props}
 />
 )
 }
)
Input.displayName = "Input"

export { Input }
