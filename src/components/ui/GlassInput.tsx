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
                    "flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                    {
                        "border-red-500/50 focus:ring-red-500/50": error,
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
