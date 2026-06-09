import * as React from "react";

import { cn } from "@/lib/cn";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border bg-white px-3.5 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-primary focus:ring-3 focus:ring-indigo-100",
        className,
      )}
      {...props}
    />
  );
}
