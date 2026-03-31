"use client";

import { create } from "zustand";

import type { SectionId } from "@/lib/section-types";

type ShellStore = {
  activeSection: SectionId;
  setActiveSection: (section: SectionId) => void;
};

export const useShellStore = create<ShellStore>((set) => ({
  activeSection: "home",
  setActiveSection: (section) => set({ activeSection: section })
}));
