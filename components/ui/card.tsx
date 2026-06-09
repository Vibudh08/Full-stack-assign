import * as React from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-2xl border bg-card shadow-sm", className)}
      {...props}
    />
  );
}
