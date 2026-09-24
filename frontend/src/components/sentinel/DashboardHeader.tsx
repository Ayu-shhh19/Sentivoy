import { Bell, ChevronDown, LogOut, Menu, Search, Settings, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSidebar } from "@/lib/sidebarContext";
import { useAuth } from "@/lib/authContext";
import { useUIStore } from "@/lib/uiStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const destinations = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/alerts", label: "Alerts" },
  { to: "/live-logs", label: "Live Logs" },
  { to: "/threat-analytics", label: "Threat Analytics" },
  { to: "/ueba", label: "User Behavior" },
  { to: "/geo", label: "Geo Intelligence" },
  { to: "/incident-response", label: "Incident Response" },
  { to: "/integrations", label: "Integrations" },
  { to: "/settings", label: "Settings" },
] as const;

export function DashboardHeader({
  search,
  onSearchChange,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
}) {
  const { setMobileOpen } = useSidebar();
  const { user, signOut } = useAuth();
  const navigationSearch = useUIStore((state) => state.navigationSearch);
  const setNavigationSearch = useUIStore((state) => state.setNavigationSearch);
  const [searchOpen, setSearchOpen] = useState(false);
  const name = String(
    user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Workspace",
  );
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const filtered = destinations.filter((page) =>
    page.label.toLowerCase().includes(navigationSearch.toLowerCase()),
  );
  const localSearch = onSearchChange !== undefined;

  return (
    <header className="workspace-header">
      <button
        className="icon-button mobile-nav-trigger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>
      <div className="header-search">
        <Search size={15} />
        <input
          type="search"
          aria-label={localSearch ? "Search alerts" : "Find a page"}
          placeholder={localSearch ? "Search alerts, users, IPs..." : "Find a page..."}
          value={search ?? navigationSearch}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setSearchOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setSearchOpen(false);
              event.currentTarget.blur();
            }
          }}
          onChange={(event) => (onSearchChange ?? setNavigationSearch)(event.target.value)}
        />
        {!localSearch && <span className="search-hint">Jump to</span>}
        {!localSearch && searchOpen && (
          <div className="page-search-results">
            <span className="eyebrow">Pages</span>
            {filtered.length ? (
              filtered.map((page) => (
                <Link
                  key={page.to}
                  href={page.to}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setNavigationSearch("");
                    setSearchOpen(false);
                  }}
                >
                  <span>{page.label}</span>
                  <ArrowUpRight size={13} />
                </Link>
              ))
            ) : (
              <p>No pages found.</p>
            )}
          </div>
        )}
      </div>
      <div className="header-right">
        <span className="workspace-status">
          <i />
          Security workspace
        </span>
        <Link href="/alerts" className="icon-button" aria-label="View alerts">
          <Bell size={17} />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="profile-trigger" aria-label="Account menu">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" referrerPolicy="no-referrer" />
              ) : (
                <span className="profile-initials">{initials}</span>
              )}
              <span className="profile-copy">
                <strong>{name}</strong>
                <small>Personal workspace</small>
              </span>
              <ChevronDown size={13} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <div className="px-2 py-2">
              <p className="truncate text-xs font-semibold">{name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings size={14} />
                Workspace settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                void signOut();
              }}
            >
              <LogOut size={14} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
