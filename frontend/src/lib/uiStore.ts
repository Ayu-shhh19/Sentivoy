import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AlertStatus, Severity } from "@/lib/types";

type UIState = {
  collapsed: boolean;
  mobileOpen: boolean;
  smoothScroll: boolean;
  animations: boolean;
  navigationSearch: string;
  alertSearch: string;
  alertStatus: AlertStatus | "All";
  alertSeverity: Severity | "All";
  logSearch: string;
  logLevel: "all" | "info" | "warn" | "error" | "critical";
  logPaused: boolean;
  settingsSection: string;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
  setPreference: (key: "smoothScroll" | "animations", value: boolean) => void;
  setNavigationSearch: (value: string) => void;
  setAlertSearch: (value: string) => void;
  setAlertStatus: (value: UIState["alertStatus"]) => void;
  setAlertSeverity: (value: UIState["alertSeverity"]) => void;
  setLogSearch: (value: string) => void;
  setLogLevel: (value: UIState["logLevel"]) => void;
  toggleLogPaused: () => void;
  setSettingsSection: (value: string) => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      smoothScroll: true,
      animations: true,
      navigationSearch: "",
      alertSearch: "",
      alertStatus: "All",
      alertSeverity: "All",
      logSearch: "",
      logLevel: "all",
      logPaused: false,
      settingsSection: "general",
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      setMobileOpen: (mobileOpen) => set({ mobileOpen }),
      setPreference: (key, value) => set({ [key]: value }),
      setNavigationSearch: (navigationSearch) => set({ navigationSearch }),
      setAlertSearch: (alertSearch) => set({ alertSearch }),
      setAlertStatus: (alertStatus) => set({ alertStatus }),
      setAlertSeverity: (alertSeverity) => set({ alertSeverity }),
      setLogSearch: (logSearch) => set({ logSearch }),
      setLogLevel: (logLevel) => set({ logLevel }),
      toggleLogPaused: () => set((state) => ({ logPaused: !state.logPaused })),
      setSettingsSection: (settingsSection) => set({ settingsSection }),
    }),
    {
      name: "sentivoy-ui-v1",
      skipHydration: true,
      partialize: ({ collapsed, smoothScroll, animations }) => ({
        collapsed,
        smoothScroll,
        animations,
      }),
    },
  ),
);
