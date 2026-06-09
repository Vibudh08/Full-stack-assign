"use client";

import { create } from "zustand";

import type { User } from "@/types/api";

type AuthState = {
  accessToken: string | null;
  user: User | null;
  initialized: boolean;
  setSession: (accessToken: string, user?: User | null) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  setInitialized: (initialized: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  initialized: false,
  setSession: (accessToken, user) =>
    set((state) => ({
      accessToken,
      user: user === undefined ? state.user : user,
    })),
  setUser: (user) => set({ user }),
  clearSession: () => set({ accessToken: null, user: null }),
  setInitialized: (initialized) => set({ initialized }),
}));
