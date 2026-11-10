import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
 "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-center",
 {
 variants: {
 variant: {
 default:
 "bg-primary text-primary-foreground hover:bg-primary-variant",
 // Same as default. Signal yellow is reserved for the nav rail and the
 // marketing hero; page-level actions are always safety blue.
 accent:
 "bg-primary text-primary-foreground hover:bg-primary-variant",
 primary:
 "bg-primary text-primary-foreground hover:bg-primary-variant",
 destructive:
 "bg-destructive text-destructive-foreground hover:brightness-90",
 outline:
 "bg-card text-foreground border border-input hover:bg-muted hover:border-foreground/60",
 secondary:
 "bg-muted text-foreground border border-border hover:bg-border/70",
 ghost:
 "text-foreground hover:bg-muted",
 link:
 "text-primary underline-offset-4 hover:underline",
 },
 size: {
 default: "h-10 px-4",
 sm: "h-9 px-3",
 lg: "h-12 px-6 text-base",
 icon: "h-10 w-10 px-0",
 },
 },
 defaultVariants: {
 variant: "default",
 size: "default",
 },
 }
)

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
 VariantProps<typeof buttonVariants> {
 asChild?: boolean
 /** Disable the tactile scale-on-press (e.g. where the motion would distract). */
 static?: boolean
}

/** Subtle tactile feedback on press; interruptible via the transform transition. */
const TAP_SCALE = "active:scale-[0.96] motion-reduce:active:scale-100"

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, static: isStatic = false, ...props }, ref) => {
 const Comp = asChild ? Slot : "button"
 return (
 <Comp
 className={cn(buttonVariants({ variant, size }), !isStatic && TAP_SCALE, className)}
 ref={ref}
 {...props}
 />
 )
 }
)
Button.displayName = "Button"

export { Button, buttonVariants }
