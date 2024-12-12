import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full border-b px-3 py-1 text-base transition-colors",
          // Default styles
          "border-input bg-transparent placeholder:text-muted-foreground",
          // Styles for focus state
          "focus-visible:outline-none focus-visible:border-primary",
          // Error state styles
          props["aria-invalid"] && "border-b-2 border-b-destructive",
          // Disabled styles
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
