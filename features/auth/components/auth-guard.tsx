"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { bootstrapSession } from "@/features/auth/services/auth-api";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, initialized, setUser, setInitialized } = useAuthStore();

  useEffect(() => {
    if (initialized) {
      if (!accessToken) router.replace("/login");
      return;
    }

    bootstrapSession()
      .then(setUser)
      .catch(() => router.replace("/login"))
      .finally(() => setInitialized(true));
  }, [accessToken, initialized, router, setInitialized, setUser]);

  if (!initialized || !accessToken) {
    return <DashboardSkeleton />;
  }

  return children;
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-[244px] border-r bg-white p-4 lg:flex lg:flex-col">
        <div className="flex h-12 items-center gap-3 px-2">
          <Skeleton className="size-9" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="mt-8 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="mt-auto space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </aside>
      <div className="lg:ml-[244px]">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-9 w-32 lg:w-40" />
          <Skeleton className="h-9 w-24" />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-4 h-9 w-64 max-w-full" />
          <Skeleton className="mt-3 h-5 w-96 max-w-full" />
          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28" />
            ))}
          </div>
          <Skeleton className="mt-7 h-16 w-full" />
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-40" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
