import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
 "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-base font-bold font-display ring-offset-background transition-[box-shadow,transform,background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 text-center",
 {
 variants: {
 variant: {
 default:
 "bg-primary text-primary-foreground shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5",
 accent:
 "bg-accent text-accent-foreground shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5",
 primary:
 "bg-primary text-primary-foreground shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5",
 destructive:
 "bg-destructive text-destructive-foreground shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5",
 outline:
 "bg-card text-foreground border-2 border-border hover:bg-secondary hover:border-primary",
 secondary:
 "bg-secondary text-secondary-foreground hover:bg-muted border-2 border-border",
 ghost:
 "text-foreground hover:bg-secondary rounded-2xl",
 link:
 "text-primary underline-offset-4 hover:underline font-bold",
 },
 size: {
 default: "h-12 px-6 py-2",
 sm: "h-10 px-4 text-sm rounded-xl",
 lg: "h-14 px-8 text-lg rounded-2xl",
 icon: "h-12 w-12 px-0",
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
const TAP_SCALE = "active:scale-[0.96]"

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
