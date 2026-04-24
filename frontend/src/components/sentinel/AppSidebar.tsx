import {
  Shield,
  LayoutDashboard,
  Activity,
  ScrollText,
  AlertTriangle,
  UserCog,
  Globe2,
  Siren,
  Plug,
  Settings,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const nav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/threat-analytics", label: "Threat Analytics", icon: Activity },
  { to: "/live-logs", label: "Live Logs", icon: ScrollText },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/ueba", label: "User Behavior", icon: UserCog },
  { to: "/geo", label: "Geo Intelligence", icon: Globe2 },
  { to: "/incident-response", label: "Incident Response", icon: Siren },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-[248px] shrink-0 border-r border-border bg-sidebar h-screen sticky top-0">
      <div className="px-5 pt-6 pb-5 flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-sm">
          <Shield className="h-4.5 w-4.5" strokeWidth={2.4} />
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-tight text-sidebar-foreground">
            Log Anomaly
          </div>
          <div className="text-[13px] font-semibold tracking-tight text-sidebar-foreground -mt-0.5">
            Sentinel
          </div>
        </div>
      </div>

      <nav className="px-3 flex-1 space-y-0.5 overflow-y-auto scrollbar-thin">
        <div className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Overview
        </div>
        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to as "/"}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-muted",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
              <span>{item.label}</span>
              {item.label === "Alerts" && (
                <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-critical/10 text-critical">
                  7
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 space-y-2">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-primary to-[oklch(0.46_0.20_270)] text-primary-foreground relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-xl" />
          <Sparkles className="h-4 w-4 mb-2" />
          <div className="text-[13px] font-semibold leading-tight">Upgrade to Enterprise</div>
          <div className="text-[11px] opacity-80 mt-1 leading-snug">
            Unlimited log ingestion + AI playbooks.
          </div>
          <button className="mt-3 text-[11px] font-semibold bg-white text-primary px-2.5 py-1.5 rounded-md hover:bg-white/90 transition">
            See plans
          </button>
        </div>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition">
          <HelpCircle className="h-4 w-4" />
          Help & Support
        </button>
      </div>
    </aside>
  );
}
