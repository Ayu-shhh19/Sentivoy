import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { usePageReveal } from "@/hooks/usePageReveal";

export function AppFrame({
  children,
  search,
  onSearchChange,
}: {
  children: ReactNode;
  search?: string;
  onSearchChange?: (value: string) => void;
}) {
  const pathname = usePathname();
  const ref = usePageReveal<HTMLElement>(pathname, ":scope > *");
  return (
    <div className="workspace-shell dashboard-reference">
      <a href="#page-content" className="skip-link">
        Skip to content
      </a>
      <DashboardSidebar />
      <div className="workspace-body">
        <DashboardHeader search={search} onSearchChange={onSearchChange} />
        <main id="page-content" ref={ref} className="workspace-content">
          {children}
        </main>
      </div>
    </div>
  );
}
