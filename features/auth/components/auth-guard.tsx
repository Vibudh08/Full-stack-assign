"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <LoaderCircle className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  return children;
}
