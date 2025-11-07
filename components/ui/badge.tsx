import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-muted text-muted-foreground shadow hover:bg-muted/70",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/70",
        success:
          "border-transparent bg-green-500 text-primary-foreground hover:bg-green-500/70",
        accent:
          "border-transparent bg-blue-400 text-primary-foreground hover:bg-blue-400/70",
        destructive:
          "border-transparent bg-destructive text-primary-foreground shadow hover:bg-destructive/80",
        green: "bg-chart-2 border-transparent text-foreground shadow hover:opacity-80",
        blue: "bg-chart-3 border-transparent text-foreground shadow hover:opacity-80",
        yellow: "bg-chart-4 border-transparent text-foreground shadow hover:opacity-80",
        orange: "bg-chart-5 border-transparent text-foreground shadow hover:opacity-80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
