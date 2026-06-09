import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TaskStatus } from "@/types/api";

const statusFilters = ["all", "pending", "completed"] as const;

export function TaskToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: {
  search: string;
  status: TaskStatus | "all";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TaskStatus | "all") => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          className="border-0 bg-slate-50 pl-9 shadow-none"
          placeholder="Search tasks..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {statusFilters.map((value) => (
          <Button
            key={value}
            size="sm"
            variant={status === value ? "default" : "ghost"}
            className="capitalize"
            onClick={() => onStatusChange(value)}
          >
            {value}
          </Button>
        ))}
      </div>
    </div>
  );
}
