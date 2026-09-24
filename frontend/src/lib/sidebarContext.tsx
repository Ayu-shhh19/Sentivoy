import { useShallow } from "zustand/react/shallow";
import { useUIStore } from "./uiStore";

export function useSidebar() {
  return useUIStore(
    useShallow(({ collapsed, mobileOpen, toggleCollapsed, setMobileOpen }) => ({
      collapsed,
      mobileOpen,
      toggleCollapsed,
      setMobileOpen,
    })),
  );
}
