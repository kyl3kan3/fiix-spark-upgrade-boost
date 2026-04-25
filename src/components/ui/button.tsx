import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-bold font-sans uppercase tracking-wider ring-offset-background transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] hover:-translate-x-[2px] hover:-translate-y-[2px]",
        accent:
          "bg-accent text-accent-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] hover:-translate-x-[2px] hover:-translate-y-[2px]",
        primary:
          "bg-primary text-primary-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] hover:-translate-x-[2px] hover:-translate-y-[2px]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] hover:-translate-x-[2px] hover:-translate-y-[2px]",
        outline:
          "bg-card text-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:bg-primary hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] hover:-translate-x-[2px] hover:-translate-y-[2px]",
        ghost:
          "border-transparent shadow-none text-foreground hover:bg-foreground hover:text-background active:translate-x-0 active:translate-y-0",
        link:
          "border-transparent shadow-none text-foreground underline underline-offset-4 decoration-2 decoration-primary hover:decoration-accent active:translate-x-0 active:translate-y-0",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-base",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
