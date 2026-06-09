import * as React from "react";

import { cn } from "@/lib/cn";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-primary focus:ring-3 focus:ring-indigo-100",
        className,
      )}
      {...props}
    />
  );
}
