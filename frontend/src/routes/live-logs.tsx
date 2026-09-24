"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Search, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/sentinel/PageShell";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/authContext";
import { API_URL } from "@/lib/api";
import { useUIStore } from "@/lib/uiStore";

type Level = "info" | "warn" | "error" | "critical";
interface LogLine {
  id: string;
  ts: string;
  level: Level;
  source: string;
  msg: string;
}

const levelStyle: Record<Level, string> = {
  info: "text-muted-foreground",
  warn: "text-[oklch(0.55_0.13_70)]",
  error: "text-critical",
  critical: "text-critical font-semibold",
};

const levelDot: Record<Level, string> = {
  info: "bg-muted-foreground/40",
  warn: "bg-warning",
  error: "bg-critical",
  critical: "bg-critical",
};

export default function LiveLogsPage() {
  const { session } = useAuth();
  const paused = useUIStore((state) => state.logPaused);
  const togglePaused = useUIStore((state) => state.toggleLogPaused);
  const filter = useUIStore((state) => state.logSearch);
  const setFilter = useUIStore((state) => state.setLogSearch);
  const levelFilter = useUIStore((state) => state.logLevel);
  const setLevelFilter = useUIStore((state) => state.setLogLevel);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: fetchedLogs } = useQuery<LogLine[]>({
    queryKey: ["liveLogs"],
    queryFn: async () => {
      if (!session?.access_token) throw new Error("No session");
      const res = await fetch(`${API_URL}/api/live-logs?limit=50`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      return data.reverse(); // backend sorts desc, we want oldest first for appending
    },
    enabled: !!session?.access_token && !paused,
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (fetchedLogs && !paused) {
      setLogs((prev) => {
        // Merge without duplicating IDs
        const existingIds = new Set(prev.map((l) => l.id));
        const newLogs = fetchedLogs.filter((l) => !existingIds.has(l.id));
        if (newLogs.length === 0) return prev;

        // Ensure timestamp is parsed properly for display
        const displayLogs = newLogs.map((l) => ({
          ...l,
          ts: l.ts ? new Date(l.ts).toLocaleTimeString() : new Date().toLocaleTimeString(),
        }));

        return [...prev, ...displayLogs].slice(-200);
      });
    }
  }, [fetchedLogs, paused]);

  useEffect(() => {
    if (!paused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, paused]);

  const filtered = logs.filter((l) => {
    if (levelFilter !== "all" && l.level !== levelFilter) return false;
    if (filter && !`${l.source} ${l.msg}`.toLowerCase().includes(filter.toLowerCase()))
      return false;
    return true;
  });

  const counts = {
    all: logs.length,
    info: logs.filter((l) => l.level === "info").length,
    warn: logs.filter((l) => l.level === "warn").length,
    error: logs.filter((l) => l.level === "error").length,
    critical: logs.filter((l) => l.level === "critical").length,
  };

  return (
    <PageShell
      title="Live Logs"
      description="Stream raw log events from every connected source in real time."
      actions={
        <>
          <button
            onClick={togglePaused}
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-[13px] font-medium transition",
              paused
                ? "border-success/30 bg-success/10 text-success hover:bg-success/15"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            {paused ? (
              <>
                <Play className="h-3.5 w-3.5" /> Resume
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5" /> Pause
              </>
            )}
          </button>
          <button
            onClick={() => setLogs([])}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-[13px] font-medium hover:bg-muted transition"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </>
      }
    >
      <div className="bg-card border border-border rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter logs by source or message…"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/60 border border-transparent focus:border-border focus:bg-card text-sm outline-none transition"
            />
          </div>
          <div className="flex flex-wrap items-center bg-muted/60 rounded-lg p-0.5">
            {(["all", "info", "warn", "error", "critical"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                className={cn(
                  "px-2.5 h-7 text-[11px] font-semibold rounded-md capitalize transition flex items-center gap-1.5",
                  levelFilter === l
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l !== "all" && (
                  <span className={cn("h-1.5 w-1.5 rounded-full", levelDot[l as Level])} />
                )}
                {l} <span className="text-muted-foreground/70 tabular-nums">({counts[l]})</span>
              </button>
            ))}
          </div>
          {!paused && (
            <div className="ml-auto flex items-center gap-1.5 text-[11px] text-success font-semibold">
              <span className="live-dot" /> Streaming
            </div>
          )}
        </div>

        <div
          ref={scrollRef}
          data-lenis-prevent
          className="log-stream font-mono text-[12px] h-[560px] overflow-y-auto scrollbar-thin"
        >
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-[13px]">
              No logs match your filter.
            </div>
          ) : (
            filtered.map((l) => (
              <div key={l.id} className="log-row px-4 py-2 flex items-start gap-3 transition">
                <span className="log-time tabular-nums shrink-0">{l.ts}</span>
                <span
                  className={cn(
                    "uppercase text-[10px] font-bold w-16 shrink-0 mt-0.5",
                    levelStyle[l.level],
                  )}
                >
                  [{l.level}]
                </span>
                <span className="log-source shrink-0">{l.source}</span>
                <span className="log-message break-all">{l.msg}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}
