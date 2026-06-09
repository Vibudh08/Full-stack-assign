import { AuthGuard } from "@/features/auth/components/auth-guard";
import { AppShell } from "@/features/dashboard/components/app-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
