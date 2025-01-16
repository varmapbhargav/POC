import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'gradient' | 'outline' | 'ghost';
  spin?: boolean;
}

const iconVariants = {
  default: "text-white/70 hover:text-white transition-colors",
  gradient: [
    "relative isolate",
    "before:absolute before:inset-0 before:rounded-full",
    "before:bg-gradient-to-r before:from-primary-gradient-start before:to-primary-gradient-end",
    "before:opacity-0 hover:before:opacity-20",
    "before:transition-opacity",
  ].join(" "),
  outline: [
    "relative isolate",
    "after:absolute after:inset-0 after:rounded-full",
    "after:border after:border-white/20",
    "after:opacity-0 hover:after:opacity-100",
    "after:transition-opacity",
  ].join(" "),
  ghost: "text-white/50 hover:text-white transition-colors",
};

const spinAnimation = {
  animate: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export function Icon({
  icon: IconComponent,
  size = 24,
  strokeWidth = 1.5,
  variant = 'default',
  spin = false,
  className,
  ...props
}: IconProps) {
  return (
    <motion.div
      className={cn(
        "relative inline-flex items-center justify-center",
        iconVariants[variant],
        className
      )}
      {...(spin && spinAnimation)}
      {...props}
    >
      <IconComponent
        size={size}
        strokeWidth={strokeWidth}
        className="relative z-10 transition-transform group-hover:scale-110"
      />
    </motion.div>
  );
}

interface AnimatedIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'gradient' | 'outline' | 'ghost';
  spin?: boolean;
}

const buttonSizes = {
  sm: {
    button: "h-8 w-8 rounded-lg",
    icon: 16,
  },
  default: {
    button: "h-10 w-10 rounded-xl",
    icon: 20,
  },
  lg: {
    button: "h-12 w-12 rounded-xl",
    icon: 24,
  },
};

const buttonVariants = {
  default: [
    "bg-white/10 hover:bg-white/20",
    "dark:bg-black/10 dark:hover:bg-black/20",
  ].join(" "),
  gradient: [
    "relative isolate overflow-hidden",
    "before:absolute before:inset-0",
    "before:bg-gradient-to-r before:from-primary-gradient-start before:to-primary-gradient-end",
    "before:opacity-10 hover:before:opacity-20",
    "before:transition-opacity",
  ].join(" "),
  outline: [
    "border border-white/20",
    "hover:bg-white/10 dark:hover:bg-black/10",
  ].join(" "),
  ghost: "hover:bg-white/10 dark:hover:bg-black/10",
};

export function AnimatedIconButton({
  icon: IconComponent,
  size = 'default',
  variant = 'default',
  spin = false,
  className,
  ...props
}: AnimatedIconButtonProps) {
  return (
    <motion.button
      className={cn(
        "relative inline-flex items-center justify-center",
        "transition-all duration-200",
        "active:scale-95",
        "disabled:pointer-events-none disabled:opacity-50",
        buttonSizes[size].button,
        buttonVariants[variant],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <Icon
        icon={IconComponent}
        size={buttonSizes[size].icon}
        variant={variant}
        spin={spin}
      />
    </motion.button>
  );
}
