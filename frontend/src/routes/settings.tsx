import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Shield, Users, Key, Database, Sparkles } from "lucide-react";
import { PageShell } from "@/components/sentinel/PageShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Log Anomaly Sentinel" },
      { name: "description", content: "Configure detection rules, members, and billing." },
    ],
  }),
  component: SettingsPage,
});

const sections = [
  { id: "general", label: "General", icon: Sparkles },
  { id: "detection", label: "Detection rules", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "members", label: "Team", icon: Users },
  { id: "api", label: "API keys", icon: Key },
  { id: "data", label: "Data retention", icon: Database },
] as const;

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn(
        "h-5 w-9 rounded-full p-0.5 transition relative",
        on ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "block h-4 w-4 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

function SettingsPage() {
  const [active, setActive] = useState<(typeof sections)[number]["id"]>("general");
  const [toggles, setToggles] = useState({
    realtime: true,
    aiTriage: true,
    autoBlock: false,
    weeklyReport: true,
    sso: true,
    mfaRequired: true,
  });

  const update = (k: keyof typeof toggles) => (v: boolean) => setToggles((p) => ({ ...p, [k]: v }));

  const settingItems: Record<string, { label: string; sub: string; key: keyof typeof toggles }[]> = {
    general: [
      { label: "Real-time monitoring", sub: "Stream events from all connected sources.", key: "realtime" },
      { label: "Sentinel AI triage", sub: "Let AI auto-classify low-confidence alerts.", key: "aiTriage" },
      { label: "Weekly executive report", sub: "Email summary every Monday at 8am.", key: "weeklyReport" },
    ],
    detection: [
      { label: "Auto-block hostile IPs", sub: "Push offending IPs to edge firewall.", key: "autoBlock" },
      { label: "Real-time monitoring", sub: "Stream events from all connected sources.", key: "realtime" },
    ],
    notifications: [
      { label: "Weekly executive report", sub: "Email summary every Monday at 8am.", key: "weeklyReport" },
    ],
    members: [
      { label: "Require MFA for all members", sub: "Enforced on next login.", key: "mfaRequired" },
      { label: "SSO enabled (Okta)", sub: "Members sign in via SSO.", key: "sso" },
    ],
    api: [],
    data: [],
  };

  return (
    <PageShell title="Settings" description="Workspace configuration.">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
        <nav className="bg-card border border-border rounded-2xl p-2 h-fit shadow-[var(--shadow-soft)]">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition",
                  active === s.id ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-4">
          {active === "api" ? (
            <div className="bg-card border border-border rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden">
              <div className="p-5 pb-3 flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold text-foreground">API Keys</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Programmatic access tokens</div>
                </div>
                <button className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold hover:bg-primary/90">
                  New key
                </button>
              </div>
              <div className="divide-y divide-border">
                {[
                  { name: "ci-deploy", created: "Jan 4, 2026", last: "12 min ago" },
                  { name: "datadog-bridge", created: "Dec 18, 2025", last: "2 h ago" },
                  { name: "legacy-export", created: "Sep 11, 2025", last: "3 days ago" },
                ].map((k) => (
                  <div key={k.name} className="p-4 flex items-center justify-between text-[13px]">
                    <div>
                      <div className="font-mono font-semibold text-foreground">{k.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Created {k.created} · Last used {k.last}</div>
                    </div>
                    <button className="text-[12px] font-semibold text-critical hover:underline">Revoke</button>
                  </div>
                ))}
              </div>
            </div>
          ) : active === "data" ? (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-soft)]">
              <div className="text-[15px] font-semibold text-foreground">Data Retention</div>
              <div className="text-xs text-muted-foreground mt-0.5">How long Sentinel keeps your logs</div>
              <div className="mt-5 space-y-4">
                {[
                  { label: "Raw logs", value: "30 days" },
                  { label: "Anomaly events", value: "180 days" },
                  { label: "Incidents & post-mortems", value: "Forever" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <div className="text-[13.5px] font-medium text-foreground">{r.label}</div>
                    </div>
                    <select className="h-8 px-3 rounded-lg border border-border bg-card text-[12px] font-medium">
                      <option>{r.value}</option>
                      <option>7 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl shadow-[var(--shadow-soft)] divide-y divide-border">
              {(settingItems[active] ?? []).map((item) => (
                <div key={item.label} className="p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium text-foreground">{item.label}</div>
                    <div className="text-[11.5px] text-muted-foreground mt-0.5">{item.sub}</div>
                  </div>
                  <Toggle on={toggles[item.key]} onChange={update(item.key)} />
                </div>
              ))}
              {(settingItems[active] ?? []).length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">Nothing to configure here.</div>
              )}
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-soft)]">
            <div className="text-[15px] font-semibold text-foreground">Workspace</div>
            <div className="text-xs text-muted-foreground mt-0.5">Acme Corp · Plan: Growth</div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-[12.5px]">
              <div>
                <div className="text-muted-foreground">Logs ingested</div>
                <div className="text-[15px] font-semibold text-foreground tabular-nums">38.4M / 50M</div>
              </div>
              <div>
                <div className="text-muted-foreground">Members</div>
                <div className="text-[15px] font-semibold text-foreground tabular-nums">12 / 25</div>
              </div>
              <div>
                <div className="text-muted-foreground">Data sources</div>
                <div className="text-[15px] font-semibold text-foreground tabular-nums">6 / 20</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
