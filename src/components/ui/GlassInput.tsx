import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    "flex h-11 w-full rounded-xl border border-border bg-input px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
                    {
                        "border-destructive/50 focus:ring-destructive": error,
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
GlassInput.displayName = "GlassInput";

export { GlassInput };
