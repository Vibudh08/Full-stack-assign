import { CheckCircle2, CircleDot, ClipboardList, Target } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TaskMetrics as TaskMetricsData } from "@/types/api";

const metricDefinitions = [
  {
    label: "Total tasks",
    key: "total",
    icon: ClipboardList,
    tone: "bg-indigo-50 text-primary",
  },
  {
    label: "Completed",
    key: "completed",
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Pending",
    key: "pending",
    icon: CircleDot,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    label: "Completion",
    key: "completionPercentage",
    icon: Target,
    tone: "bg-violet-50 text-violet-600",
  },
] as const;

export function TaskMetrics({
  metrics,
  loading,
}: {
  metrics?: TaskMetricsData;
  loading: boolean;
}) {
  return (
    <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {loading
        ? metricDefinitions.map(({ label }) => (
            <Skeleton key={label} className="h-28" />
          ))
        : metricDefinitions.map(({ label, key, icon: Icon, tone }) => {
            const value = metrics?.[key] ?? 0;

            return (
              <Card key={label} className="p-4 sm:p-5">
                <div
                  className={`grid size-9 place-items-center rounded-xl ${tone}`}
                >
                  <Icon className="size-4" />
                </div>
                <p className="mt-4 text-2xl font-bold">
                  {key === "completionPercentage" ? `${value}%` : value}
                </p>
                <p className="mt-1 text-xs font-medium text-muted sm:text-sm">
                  {label}
                </p>
              </Card>
            );
          })}
    </section>
  );
}
