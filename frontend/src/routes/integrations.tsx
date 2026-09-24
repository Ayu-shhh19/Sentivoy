import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUIStore } from "@/lib/uiStore";
import { CheckCircle2, Plus } from "lucide-react";
import { PageShell } from "@/components/sentinel/PageShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Sentivoy" },
      { name: "description", content: "Connect SIEM, cloud, and identity sources." },
    ],
  }),
  component: IntegrationsPage,
});

const integrations = [
  {
    name: "Sentivoy Cloud Node",
    category: "Edge",
    connected: true,
    events: "Processing",
    color: "#4782d5",
  },
  {
    name: "AWS CloudTrail",
    category: "Cloud",
    connected: false,
    events: "Not connected",
    color: "oklch(0.78 0.15 60)",
  },
  {
    name: "Okta",
    category: "Identity",
    connected: false,
    events: "Not connected",
    color: "#4782d5",
  },
  {
    name: "GitHub Audit",
    category: "DevOps",
    connected: false,
    events: "Not connected",
    color: "oklch(0.30 0.03 264)",
  },
  {
    name: "Datadog",
    category: "Observability",
    connected: false,
    events: "Not connected",
    color: "#7aabf0",
  },
  {
    name: "Slack",
    category: "Notifications",
    connected: false,
    events: "Not connected",
    color: "#29b8b4",
  },
  {
    name: "PagerDuty",
    category: "On-call",
    connected: false,
    events: "Not connected",
    color: "#29b8b4",
  },
  {
    name: "Google Workspace",
    category: "Identity",
    connected: false,
    events: "Not connected",
    color: "#4782d5",
  },
  {
    name: "Azure AD",
    category: "Identity",
    connected: false,
    events: "Not connected",
    color: "#4782d5",
  },
  {
    name: "Splunk",
    category: "SIEM",
    connected: false,
    events: "Not connected",
    color: "oklch(0.62 0.24 22)",
  },
  {
    name: "Crowdstrike",
    category: "EDR",
    connected: false,
    events: "Not connected",
    color: "oklch(0.62 0.24 22)",
  },
  {
    name: "Cloudflare",
    category: "Edge",
    connected: false,
    events: "Not connected",
    color: "oklch(0.78 0.15 78)",
  },
  {
    name: "Jira",
    category: "Ticketing",
    connected: false,
    events: "Not connected",
    color: "#4782d5",
  },
];

function IntegrationsPage() {
  const connected = integrations.filter((i) => i.connected).length;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<(typeof integrations)[number] | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const setSettingsSection = useUIStore((state) => state.setSettingsSection);
  const filtered = integrations.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || item.category === category),
  );

  return (
    <PageShell
      title="Integrations"
      description={`${connected} of ${integrations.length} sources connected.`}
      actions={
        <button
          onClick={() => searchRef.current?.focus()}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition"
        >
          <Plus className="h-3.5 w-3.5" /> Add source
        </button>
      }
    >
      <div className="surface p-3 flex flex-wrap items-center gap-3">
        <input
          ref={searchRef}
          aria-label="Search integrations"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Find a source..."
          className="min-w-[160px] flex-1 h-8 px-2 text-xs outline-none"
        />
        <select
          aria-label="Integration category"
          className="ui-button"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {["All", ...new Set(integrations.map((item) => item.category))].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((i) => (
          <div
            key={i.name}
            className="card-hover bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-soft)]"
          >
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
              onClick={() => setSelected(i)}
              className={cn(
                "mt-3 w-full h-8 rounded-lg text-[12px] font-semibold transition",
                i.connected
                  ? "border border-border hover:bg-muted text-foreground"
                  : "bg-foreground text-background hover:opacity-90",
              )}
            >
              {i.connected ? "Manage source" : "View setup"}
            </button>
          </div>
        ))}
      </div>
      {!filtered.length && (
        <div className="surface p-12 text-center text-sm text-muted-foreground">
          No sources match this search.
        </div>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogTitle>{selected?.name}</DialogTitle>
          <DialogDescription>
            {selected?.connected
              ? "Manage access to your Sentivoy ingestion endpoint with workspace API keys."
              : "This source is part of the integration catalog. Automatic connector setup is not available in this workspace yet."}
          </DialogDescription>
          {selected?.connected && (
            <Link
              to="/settings"
              onClick={() => setSettingsSection("api")}
              className="ui-button ui-button-primary"
            >
              Manage API keys
            </Link>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
