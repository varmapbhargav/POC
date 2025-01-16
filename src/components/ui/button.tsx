import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background",
    "transition-all duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-95",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end",
          "text-white shadow-lg shadow-primary/20",
          "hover:shadow-primary/30 hover:from-primary-gradient-end hover:to-primary-gradient-start",
          "backdrop-blur-sm",
          "relative overflow-hidden group",
          "before:absolute before:inset-0 before:bg-[length:200%_200%] before:bg-gradient-to-r",
          "before:from-white/0 before:via-white/10 before:to-white/0",
          "before:animate-shimmer before:opacity-0 hover:before:opacity-100",
        ].join(" "),
        destructive: [
          "bg-gradient-to-r from-red-500 to-rose-500",
          "text-white shadow-lg shadow-red-500/20",
          "hover:shadow-red-500/30 hover:from-rose-500 hover:to-red-500",
          "backdrop-blur-sm",
          "relative overflow-hidden group",
          "before:absolute before:inset-0 before:bg-[length:200%_200%] before:bg-gradient-to-r",
          "before:from-white/0 before:via-white/10 before:to-white/0",
          "before:animate-shimmer before:opacity-0 hover:before:opacity-100",
        ].join(" "),
        outline: [
          "border border-white/20 bg-white/5",
          "hover:bg-white/10 dark:bg-black/5 dark:hover:bg-black/10",
          "backdrop-blur-sm text-white shadow-lg",
          "relative overflow-hidden group",
          "after:absolute after:inset-0 after:rounded-[inherit]",
          "after:border-white/20 after:border after:opacity-0",
          "hover:after:opacity-100 after:transition-opacity",
        ].join(" "),
        secondary: [
          "bg-gradient-to-r from-secondary-gradient-start to-secondary-gradient-end",
          "text-white shadow-lg shadow-secondary/20",
          "hover:shadow-secondary/30 hover:from-secondary-gradient-end hover:to-secondary-gradient-start",
          "backdrop-blur-sm",
          "relative overflow-hidden group",
          "before:absolute before:inset-0 before:bg-[length:200%_200%] before:bg-gradient-to-r",
          "before:from-white/0 before:via-white/10 before:to-white/0",
          "before:animate-shimmer before:opacity-0 hover:before:opacity-100",
        ].join(" "),
        ghost: [
          "bg-white/5 hover:bg-white/10",
          "dark:bg-black/5 dark:hover:bg-black/10",
          "backdrop-blur-sm text-white hover:text-white",
          "relative overflow-hidden group",
          "after:absolute after:inset-0 after:rounded-[inherit]",
          "after:border-white/10 after:border after:opacity-0",
          "hover:after:opacity-100 after:transition-opacity",
        ].join(" "),
        link: [
          "text-white/70 underline-offset-4",
          "hover:text-white hover:underline",
          "relative overflow-hidden",
          "after:absolute after:bottom-0 after:left-0 after:w-full after:h-px",
          "after:bg-current after:origin-left after:scale-x-0",
          "hover:after:scale-x-100 after:transition-transform",
        ].join(" "),
        glass: [
          "bg-white/10 dark:bg-black/10",
          "backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/20",
          "text-white shadow-lg border border-white/10",
          "relative overflow-hidden group",
          "before:absolute before:inset-0 before:bg-gradient-to-r",
          "before:from-transparent before:via-white/5 before:to-transparent",
          "before:translate-x-[-100%] hover:before:translate-x-[100%]",
          "before:transition-transform before:duration-500",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        icon: [
          "h-10 w-10 rounded-xl",
          "group relative isolate",
          "after:absolute after:inset-0 after:rounded-[inherit]",
          "after:border-white/10 after:border after:opacity-0",
          "hover:after:opacity-100 after:transition-opacity",
          "[&>svg]:relative [&>svg]:z-10",
          "[&>svg]:transition-transform",
          "hover:[&>svg]:scale-110",
        ].join(" "),
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
