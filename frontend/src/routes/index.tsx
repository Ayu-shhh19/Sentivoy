import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { useAuth } from "@/lib/authContext";
import type { AlertRow } from "@/lib/mockData";
import { useDashboardData } from "@/hooks/useDashboardData";

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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<AlertRow | null>(null);
  
  const { data: dashboardData, isLoading, error } = useDashboardData();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth" });
    }
  }, [authLoading, user, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <div className="text-muted-foreground text-sm">
          {authLoading ? "Authenticating..." : "Loading dashboard data..."}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-destructive/10 border border-destructive rounded-xl p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-bold text-destructive mb-2">Error Loading Data</h2>
          <p className="text-sm text-destructive/80 font-mono mb-4">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-muted-foreground">No data available.</div>
      </div>
    );
  }

  const { metrics, trend, threatPatterns, geoOrigins, alerts } = dashboardData;

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
            <div className="xl:col-span-2"><AnomalyTrend data={trend} /></div>
            <div className="xl:col-span-1"><ThreatPatterns data={threatPatterns} /></div>
          </div>

          {/* Geo + AI + Repeat */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2"><GeoThreatMap data={geoOrigins} /></div>
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
