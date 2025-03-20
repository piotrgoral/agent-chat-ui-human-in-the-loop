import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      style={{
        resize: "none", // Prevents expansion beyond the set height
        maxHeight: "6rem", // Adjust based on the line height (approx. 4 lines)
        overflowY: "auto", // Enables scrolling inside when text exceeds max height
        lineHeight: "1.5rem", // Adjust line height for better spacing
      }}
      {...props}
    />
  );
}

export { Textarea };
