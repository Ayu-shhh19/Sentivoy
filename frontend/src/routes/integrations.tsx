import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Plus } from "lucide-react";
import { PageShell } from "@/components/sentinel/PageShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Log Anomaly Sentinel" },
      { name: "description", content: "Connect SIEM, cloud, and identity sources." },
    ],
  }),
  component: IntegrationsPage,
});

const integrations = [
  { name: "AWS CloudTrail", category: "Cloud", connected: true, events: "1.2M / day", color: "oklch(0.78 0.15 60)" },
  { name: "Okta", category: "Identity", connected: true, events: "84K / day", color: "oklch(0.58 0.19 260)" },
  { name: "GitHub Audit", category: "DevOps", connected: true, events: "12K / day", color: "oklch(0.30 0.03 264)" },
  { name: "Datadog", category: "Observability", connected: true, events: "412K / day", color: "oklch(0.62 0.18 300)" },
  { name: "Slack", category: "Notifications", connected: true, events: "—", color: "oklch(0.68 0.16 152)" },
  { name: "PagerDuty", category: "On-call", connected: true, events: "—", color: "oklch(0.68 0.16 152)" },
  { name: "Google Workspace", category: "Identity", connected: false, events: "Not connected", color: "oklch(0.58 0.19 260)" },
  { name: "Azure AD", category: "Identity", connected: false, events: "Not connected", color: "oklch(0.58 0.19 260)" },
  { name: "Splunk", category: "SIEM", connected: false, events: "Not connected", color: "oklch(0.62 0.24 22)" },
  { name: "Crowdstrike", category: "EDR", connected: false, events: "Not connected", color: "oklch(0.62 0.24 22)" },
  { name: "Cloudflare", category: "Edge", connected: false, events: "Not connected", color: "oklch(0.78 0.15 78)" },
  { name: "Jira", category: "Ticketing", connected: false, events: "Not connected", color: "oklch(0.58 0.19 260)" },
];

function IntegrationsPage() {
  const connected = integrations.filter((i) => i.connected).length;

  return (
    <PageShell
      title="Integrations"
      description={`${connected} of ${integrations.length} sources connected.`}
      actions={
        <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition">
          <Plus className="h-3.5 w-3.5" /> Add source
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {integrations.map((i) => (
          <div key={i.name} className="card-hover bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between">
              <div
                className="h-10 w-10 rounded-xl grid place-items-center text-white text-[15px] font-bold"
                style={{ background: i.color }}
              >
                {i.name[0]}
              </div>
              {i.connected ? (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md bg-success/10 text-success">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </span>
              ) : (
                <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                  Available
                </span>
              )}
            </div>
            <div className="mt-4 text-[14px] font-semibold text-foreground">{i.name}</div>
            <div className="text-[11px] text-muted-foreground">{i.category}</div>
            <div className="mt-3 text-[12px] text-muted-foreground tabular-nums">{i.events}</div>
            <button
              className={cn(
                "mt-3 w-full h-8 rounded-lg text-[12px] font-semibold transition",
                i.connected
                  ? "border border-border hover:bg-muted text-foreground"
                  : "bg-foreground text-background hover:opacity-90",
              )}
            >
              {i.connected ? "Configure" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
