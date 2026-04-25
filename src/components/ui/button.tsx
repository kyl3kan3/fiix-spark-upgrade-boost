import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-[13px] font-medium font-display tracking-tight ring-offset-background transition-[background,border,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background hover:bg-foreground/85 border border-foreground",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 border border-accent",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive",
        outline:
          "border border-foreground/80 bg-transparent text-foreground hover:bg-foreground hover:text-background",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost:
          "text-foreground hover:bg-foreground/5 border border-transparent",
        link:
          "text-foreground underline-offset-4 hover:underline border border-transparent",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-[12px]",
        lg: "h-11 px-6 text-sm",
        icon: "h-9 w-9",
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
