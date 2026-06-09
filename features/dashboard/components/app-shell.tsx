"use client";

import {
  CheckSquare2,
  LayoutDashboard,
  Layers3,
  LogOut,
  Menu,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/services/auth-api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { cn } from "@/lib/cn";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      clearSession();
      router.replace("/login");
    }
  }

  return (
    <div className="min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-dvh w-[270px] -translate-x-full flex-col overflow-hidden border-r bg-white p-4 transition-transform lg:w-[244px] lg:translate-x-0",
          mobileOpen && "translate-x-0",
        )}
      >
        <div className="flex h-12 items-center justify-between px-2">
          <div className="flex items-center gap-3 text-lg font-bold">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-white">
              <Layers3 className="size-4" />
            </span>
            Taskflow
          </div>
          <button
            className="rounded-lg p-2 text-muted lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="mt-8 space-y-1.5">
          <NavItem
            active={pathname === "/dashboard"}
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            onClick={() => setMobileOpen(false)}
          />
          <NavItem
            active={pathname === "/tasks"}
            href="/tasks"
            icon={CheckSquare2}
            label="My tasks"
            onClick={() => setMobileOpen(false)}
          />
        </nav>
        <div className="mt-auto">
          <div className="mb-3 rounded-2xl bg-slate-50 p-3">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted hover:bg-red-50 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Log out
          </Button>
        </div>
      </aside>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="min-w-0 lg:ml-[244px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/90 pl-1 pr-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              className="rounded-lg p-2 text-muted"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2 font-bold">
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-white">
                <Layers3 className="size-4" />
              </span>
              Taskflow
            </div>
          </div>
          <div className="hidden lg:block">
            <p className="text-md font-semibold">Workspace</p>
            <p className="text-sm text-muted">Personal task dashboard</p>
          </div>
          <Button
            size="sm"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("taskflow:create-task"))
            }
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add task</span>
          </Button>
        </header>
        {children}
      </div>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  href,
  onClick,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  active?: boolean;
  href: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors",
        active
          ? "bg-indigo-50 text-primary"
          : "hover:bg-slate-100 hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
