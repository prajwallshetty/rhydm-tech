"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Shared UI state for the admin shell. The sidebar and the header both need to
 * read and toggle the same collapse/drawer state, so it lives in one store
 * rather than local component state (which is why the header's menu button
 * previously did nothing — it had no state to drive).
 *
 * `collapsed` (desktop icon-only rail) is persisted; `mobileOpen` (the overlay
 * drawer) is deliberately ephemeral — a refresh should never restore an open
 * overlay.
 */
type AdminUiState = {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (value: boolean) => void;
  setMobileOpen: (value: boolean) => void;
};

export const useAdminUi = create<AdminUiState>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (value) => set({ collapsed: value }),
      setMobileOpen: (value) => set({ mobileOpen: value }),
    }),
    {
      name: "rhydm.admin.ui",
      // Only the durable preference is persisted; the drawer stays ephemeral.
      partialize: (s) => ({ collapsed: s.collapsed }),
    },
  ),
);
