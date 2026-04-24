import { Search, Bell, ChevronDown, Calendar } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function TopHeader() {
  const [range, setRange] = useState("24h");
  const ranges = ["24h", "7d", "30d", "Custom"];

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-3 px-6 h-16">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs, IPs, users…"
            className="w-full h-9 pl-9 pr-16 rounded-lg bg-muted/60 border border-transparent focus:border-border focus:bg-card text-sm placeholder:text-muted-foreground outline-none transition"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-card border border-border text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center bg-muted/60 rounded-lg p-0.5">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-2.5 h-7 text-xs font-medium rounded-md flex items-center gap-1 transition",
                  range === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r === "Custom" && <Calendar className="h-3 w-3" />}
                {r}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 h-8 rounded-full bg-success/10 border border-success/20">
            <span className="live-dot" />
            <span className="text-[11px] font-semibold text-success">Monitoring</span>
          </div>

          <button className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-muted transition">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-critical ring-2 ring-background" />
          </button>

          <button className="flex items-center gap-2 pl-1 pr-2 h-9 rounded-full hover:bg-muted transition">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-[oklch(0.46_0.20_270)] grid place-items-center text-primary-foreground text-[11px] font-semibold">
              AC
            </div>
            <div className="hidden md:block leading-tight text-left">
              <div className="text-xs font-semibold text-foreground">Alex Chen</div>
              <div className="text-[10px] text-muted-foreground">Security Lead</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
