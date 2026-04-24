import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Database, AlertTriangle, ShieldAlert, Flame, Ban, Plus, Download } from "lucide-react";
import { AppSidebar } from "@/components/sentinel/AppSidebar";
import { TopHeader } from "@/components/sentinel/TopHeader";
import { MetricCard } from "@/components/sentinel/MetricCard";
import { AnomalyTrend } from "@/components/sentinel/AnomalyTrend";
import { ThreatPatterns } from "@/components/sentinel/ThreatPatterns";
import { GeoThreatMap } from "@/components/sentinel/GeoThreatMap";
import { AIInsights } from "@/components/sentinel/AIInsights";
import { RepeatAttackRate } from "@/components/sentinel/RepeatAttackRate";
import { AlertsTable } from "@/components/sentinel/AlertsTable";
import { AlertDrawer } from "@/components/sentinel/AlertDrawer";
import { generateAlerts, type AlertRow } from "@/lib/mockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Sentivoy" },
      { name: "description", content: "AI-powered cybersecurity command center for log anomaly detection, threat analytics, and incident response." },
      { property: "og:title", content: "Sentivoy — AI Security Command Center" },
      { property: "og:description", content: "Monitor anomalies, threats, and AI-driven security insights in real time." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [selected, setSelected] = useState<AlertRow | null>(null);
  const [metrics, setMetrics] = useState({
    logs: 1284592,
    anomalies: 3241,
    critical: 47,
    threats: 128,
    blocked: 892,
  });

  useEffect(() => {
    setAlerts(generateAlerts(10));
  }, []);

  // Simulate live updates
  useEffect(() => {
    const id = setInterval(() => {
      setMetrics((m) => ({
        logs: m.logs + Math.floor(Math.random() * 240),
        anomalies: m.anomalies + Math.floor(Math.random() * 4),
        critical: Math.max(0, m.critical + (Math.random() < 0.2 ? 1 : 0)),
        threats: Math.max(0, m.threats + (Math.random() < 0.4 ? 1 : -1)),
        blocked: m.blocked + (Math.random() < 0.5 ? 1 : 0),
      }));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader />
        <main className="flex-1 p-5 md:p-7 space-y-5 max-w-[1600px] w-full mx-auto">
          {/* Title row */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Security Overview</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time anomaly detection across your environment.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-[13px] font-medium hover:bg-muted transition">
                <Plus className="h-3.5 w-3.5" /> Add widget
              </button>
              <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-foreground text-background text-[13px] font-semibold hover:opacity-90 transition">
                <Download className="h-3.5 w-3.5" /> Export report
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <MetricCard
              label="Total Logs Processed"
              value={metrics.logs}
              delta={12.4}
              icon={Database}
              tone="default"
              format={(n) => (n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toString())}
            />
            <MetricCard
              label="Anomalies Detected"
              value={metrics.anomalies}
              delta={8.2}
              icon={AlertTriangle}
              tone="warning"
            />
            <MetricCard
              label="Critical Alerts"
              value={metrics.critical}
              delta={-4.1}
              icon={ShieldAlert}
              tone="critical"
            />
            <MetricCard
              label="Active Threats"
              value={metrics.threats}
              delta={3.6}
              icon={Flame}
              tone="critical"
            />
            <MetricCard
              label="Blocked IPs"
              value={metrics.blocked}
              delta={15.7}
              icon={Ban}
              tone="success"
            />
          </div>

          {/* Trend + patterns */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2"><AnomalyTrend /></div>
            <div className="xl:col-span-1"><ThreatPatterns /></div>
          </div>

          {/* Geo + AI + Repeat */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2"><GeoThreatMap /></div>
            <div className="xl:col-span-1 grid grid-cols-1 gap-4">
              <AIInsights />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <AlertsTable alerts={alerts} onSelect={setSelected} />
            </div>
            <div className="xl:col-span-1">
              <RepeatAttackRate value={68} />
            </div>
          </div>

          <footer className="pt-2 pb-4 text-[11px] text-muted-foreground/70 text-center">
            Sentivoy v2.4 · models updated 4 min ago
          </footer>
        </main>
      </div>

      <AlertDrawer alert={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
