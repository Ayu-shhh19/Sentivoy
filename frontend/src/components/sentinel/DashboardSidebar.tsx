import { useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Globe2,
  LayoutDashboard,
  LogOut,
  Plug,
  ScrollText,
  Settings,
  ShieldCheck,
  Siren,
  UserCog,
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/sidebarContext";
import { useAuth } from "@/lib/authContext";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SentivoyLogo } from "@/components/brand/SentivoyLogo";

const groups = [
  {
    label: "General",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/alerts", label: "Alerts", icon: AlertTriangle },
      { to: "/live-logs", label: "Live Logs", icon: ScrollText },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/threat-analytics", label: "Threat Analytics", icon: Activity },
      { to: "/ueba", label: "User Behavior", icon: UserCog },
      { to: "/geo", label: "Geo Intelligence", icon: Globe2 },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/incident-response", label: "Incident Response", icon: Siren },
      { to: "/integrations", label: "Integrations", icon: Plug },
    ],
  },
];

function SidebarBody({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  return (
    <div className="flex h-full flex-col bg-white">
      <div
        className={cn(
          "flex h-[62px] shrink-0 items-center border-b border-[#edf0f5]",
          collapsed ? "justify-center" : "px-5",
        )}
      >
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 text-[#393197]"
        >
          <SentivoyLogo compact={collapsed} className="sidebar-brand" />
        </Link>
      </div>
      <nav
        aria-label="Main navigation"
        className={cn("scrollbar-thin flex-1 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")}
      >
        {groups.map((group, index) => (
          <div key={group.label} className={cn(index > 0 && "mt-5 border-t border-[#edf0f5] pt-4")}>
            {!collapsed && (
              <div className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.11em] text-[#a0a7b5]">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to as "/"}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "mb-0.5 flex h-9 items-center rounded-[6px] text-[12px] font-medium transition-colors",
                    collapsed ? "justify-center" : "gap-2.5 px-2.5",
                    active
                      ? "bg-[#f2f4fb] text-[#203148]"
                      : "text-[#5a6171] hover:bg-[#f6f7fb] hover:text-[#26263c]",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[15px] w-[15px] shrink-0",
                      active ? "text-[#544cc2]" : "text-[#727b8b]",
                    )}
                    strokeWidth={1.8}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
        <div className="mt-5 border-t border-[#edf0f5] pt-4">
          {!collapsed && (
            <div className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.11em] text-[#a0a7b5]">
              Support
            </div>
          )}
          <Link
            to="/settings"
            onClick={onNavigate}
            title={collapsed ? "Settings" : undefined}
            className={cn(
              "mb-0.5 flex h-9 items-center rounded-[6px] text-[12px] font-medium text-[#5a6171] hover:bg-[#f6f7fb]",
              pathname === "/settings" && "bg-[#f2f4fb] text-primary",
              collapsed ? "justify-center" : "gap-2.5 px-2.5",
            )}
          >
            <Settings className="h-[15px] w-[15px] text-[#727b8b]" />
            {!collapsed && "Settings"}
          </Link>
        </div>
      </nav>
      <div className={cn("border-t border-[#edf0f5]", collapsed ? "p-2" : "p-3")}>
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 rounded-[7px] bg-[#f7f8fc] p-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[6px] bg-[#ddf6f5] text-[#129b9b]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold text-[#20243b]">
                Security workspace
              </div>
              <div className="text-[10px] text-[#8790a0]">Monitoring active</div>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut()}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "flex h-8 w-full items-center rounded-[6px] text-[11px] text-[#687184] hover:bg-[#f7f8fc] hover:text-[#343552]",
            collapsed ? "justify-center" : "gap-2 px-2.5",
          )}
        >
          <LogOut className="h-[14px] w-[14px]" />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const { pathname } = useLocation();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  useEffect(() => setMobileOpen(false), [pathname, setMobileOpen]);
  return (
    <>
      <aside
        className={cn(
          "workspace-sidebar sticky top-0 hidden h-screen shrink-0 border-r border-[#e8ebf2] bg-white transition-[width] duration-200 md:block",
          collapsed ? "w-[68px]" : "w-[218px]",
        )}
      >
        <SidebarBody collapsed={collapsed} />
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "absolute grid h-6 w-6 place-items-center rounded border border-[#e9ecf2] bg-white text-[#9aa3b1] hover:text-[#554cc2]",
            collapsed ? "-right-3 top-[19px]" : "right-2.5 top-[19px]",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[244px] border-r border-[#e8ebf2] bg-white p-0">
          <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
          <SheetDescription className="sr-only">Navigate to your security tools.</SheetDescription>
          <SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
