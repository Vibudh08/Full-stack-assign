import type { Metadata } from "next";

import { Dashboard } from "@/features/tasks/components/dashboard";

export const metadata: Metadata = { title: "My tasks" };

export default function TasksPage() {
  return <Dashboard view="tasks" />;
}
