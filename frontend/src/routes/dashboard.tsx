"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Ban,
  CalendarDays,
  Download,
  Eye,
  Filter,
  Mail,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppFrame } from "@/components/sentinel/AppFrame";
import { PageDataState } from "@/components/sentinel/PageDataState";
import { useUIStore } from "@/lib/uiStore";
import { GeoThreatMap } from "@/components/sentinel/GeoThreatMap";
import { AIInsights } from "@/components/sentinel/AIInsights";
import { AlertDrawer } from "@/components/sentinel/AlertDrawer";
import { useAuth } from "@/lib/authContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { API_URL } from "@/lib/api";
import type { AlertRow, Severity } from "@/lib/types";

const number = new Intl.NumberFormat("en-US");
const flowColors = { other: "#62b9ef", critical: "#417fd5" };
const patternColors = ["#3974c7", "#6ea4ef", "#62b9ef", "#bddfff", "#dfe5ef"];

function PanelTitle({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2 text-[13px] font-semibold text-[#24283b]">
        <Icon className="h-4 w-4 shrink-0 text-[#8490a1]" strokeWidth={1.7} />
        <span className="truncate">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  detail: string;
  accent: string;
}) {
  return (
    <div className="reference-card min-w-0 p-4 sm:p-[18px]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#454d60]">
          <Icon className="h-3.5 w-3.5 text-[#929aab]" strokeWidth={1.8} />
          {label}
        </div>
        <span
          className="grid h-4 w-4 place-items-center rounded-full border border-[#e4e8ef] text-[10px] text-[#a3abba]"
          title={detail}
        >
          i
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-[26px] font-semibold leading-none tracking-[-0.045em] text-[#191d2d] tabular-nums">
          {number.format(value)}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#8891a0]">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
        {detail}
      </div>
    </div>
  );
}

function ThreatFlow({
  trend,
}: {
  trend: Array<{ time: string; anomalies: number; critical: number }>;
}) {
  if (trend.length === 0)
    return (
      <div className="grid h-[230px] place-items-center text-[12px] text-[#929aa8]">
        No activity data yet
      </div>
    );

  const windows = [0, 1, 2].map((index) => {
    const start = Math.floor((index * trend.length) / 3);
    const end = Math.max(start + 1, Math.floor(((index + 1) * trend.length) / 3));
    const chunk = trend.slice(start, end);
    const anomalies = chunk.reduce((sum, point) => sum + Math.max(0, point.anomalies), 0);
    const critical = Math.min(
      anomalies,
      chunk.reduce((sum, point) => sum + Math.max(0, point.critical), 0),
    );
    return {
      label: chunk[chunk.length - 1]?.time || `Interval ${index + 1}`,
      anomalies,
      critical,
    };
  });
  const max = Math.max(1, ...windows.map((item) => item.anomalies));
  const x = [54, 271, 488];
  const baseline = 185;
  const bars = windows.map((item, index) => {
    const height = item.anomalies ? 28 + (item.anomalies / max) * 92 : 4;
    const criticalHeight = item.anomalies ? (height * item.critical) / item.anomalies : 0;
    return {
      ...item,
      x: x[index],
      y: baseline - height,
      height,
      criticalHeight,
      otherHeight: height - criticalHeight,
    };
  });
  const ribbon = (
    a: (typeof bars)[number],
    b: (typeof bars)[number],
    kind: "other" | "critical",
  ) => {
    const x1 = a.x + 48,
      x2 = b.x;
    const top1 = kind === "other" ? a.y : baseline - a.criticalHeight;
    const bottom1 = kind === "other" ? baseline - a.criticalHeight : baseline;
    const top2 = kind === "other" ? b.y : baseline - b.criticalHeight;
    const bottom2 = kind === "other" ? baseline - b.criticalHeight : baseline;
    return `M ${x1} ${top1} C ${x1 + 80} ${top1}, ${x2 - 80} ${top2}, ${x2} ${top2} L ${x2} ${bottom2} C ${x2 - 80} ${bottom2}, ${x1 + 80} ${bottom1}, ${x1} ${bottom1} Z`;
  };

  return (
    <div className="mt-3">
      <svg
        className="h-auto w-full"
        viewBox="0 0 590 222"
        role="img"
        aria-label="Anomalies and critical events across three recent intervals"
      >
        <defs>
          <linearGradient id="flow-other" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#70c5f2" />
            <stop offset="1" stopColor="#399bd5" />
          </linearGradient>
          <linearGradient id="flow-critical" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#74a8f0" />
            <stop offset="1" stopColor="#3974c7" />
          </linearGradient>
        </defs>
        {bars.slice(0, 2).map((bar, index) => (
          <g key={index}>
            <path
              d={ribbon(bar, bars[index + 1], "other")}
              fill={flowColors.other}
              fillOpacity="0.12"
            />
            <path
              d={ribbon(bar, bars[index + 1], "critical")}
              fill={flowColors.critical}
              fillOpacity="0.13"
            />
          </g>
        ))}
        {bars.map((bar, index) => (
          <g key={index}>
            <text
              x={bar.x + 24}
              y={bar.y - 12}
              textAnchor="middle"
              fill="#333748"
              fontSize="12"
              fontWeight="600"
            >
              {number.format(bar.anomalies)}
            </text>
            <rect
              x={bar.x}
              y={bar.y}
              width="48"
              height={Math.max(0, bar.otherHeight - 2)}
              rx="5"
              fill="url(#flow-other)"
            />
            <rect
              x={bar.x}
              y={baseline - bar.criticalHeight + 2}
              width="48"
              height={Math.max(0, bar.criticalHeight - 2)}
              rx="5"
              fill="url(#flow-critical)"
            />
            <text x={bar.x + 24} y="210" textAnchor="middle" fill="#8a93a1" fontSize="11">
              {bar.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex items-center justify-center gap-5 text-[10px] text-[#8a93a1]">
        <span className="flex items-center gap-1.5">
          <i className="h-1.5 w-1.5 rounded-full bg-[#62b9ef]" />
          Other anomalies
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-1.5 w-1.5 rounded-full bg-[#417fd5]" />
          Critical
        </span>
      </div>
    </div>
  );
}

function VolumeBars({ trend }: { trend: Array<{ time: string; anomalies: number }> }) {
  const points = trend.slice(-7);
  if (!points.length)
    return (
      <div className="grid h-[200px] place-items-center text-[12px] text-[#929aa8]">
        No recent intervals
      </div>
    );
  const max = Math.max(1, ...points.map((point) => point.anomalies));
  return (
    <div className="mt-5 flex h-[178px] items-end justify-between gap-2 border-b border-[#e9edf3] pb-0.5">
      {points.map((point, index) => (
        <div
          key={`${point.time}-${index}`}
          className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
        >
          <div className="relative flex w-full flex-1 items-end justify-center">
            <div
              className="w-full max-w-[37px] rounded-t-[4px] bg-[#edf1f7] transition-colors hover:bg-[#6aa1ee]"
              style={{
                height: `${Math.max(10, (point.anomalies / max) * 100)}%`,
                backgroundColor:
                  point.anomalies > 0 && point.anomalies === max ? "#508bde" : undefined,
              }}
              title={`${point.time}: ${number.format(point.anomalies)} anomalies`}
            />
          </div>
          <span className="max-w-full truncate text-[10px] text-[#929aa8]">{point.time}</span>
        </div>
      ))}
    </div>
  );
}

function PatternDonut({
  patterns,
  blocked,
}: {
  patterns: Array<{ name: string; value: number }>;
  blocked: number;
}) {
  const positive = patterns.filter((entry) => entry.value > 0);
  const total = positive.reduce((sum, entry) => sum + entry.value, 0);
  const entries = positive.slice(0, 4);
  const other = positive.slice(4).reduce((sum, entry) => sum + entry.value, 0);
  if (other) entries.push({ name: "Other", value: other });
  let cursor = 0;
  const stops = entries.map((entry, index) => {
    const start = cursor;
    cursor += total ? (Math.max(0, entry.value) / total) * 100 : 0;
    return `${patternColors[index]} ${start}% ${cursor}%`;
  });
  const ring = total ? `conic-gradient(${stops.join(", ")})` : "conic-gradient(#edf1f7 0% 100%)";
  return (
    <div className="reference-card min-w-0 p-4 sm:p-[18px]">
      <PanelTitle icon={ShieldCheck} title="Threat distribution">
        <span className="rounded-[4px] border border-[#e8ebf2] px-2 py-1 text-[10px] text-[#747e8c]">
          All time
        </span>
      </PanelTitle>
      <div className="mt-5 grid grid-cols-2 gap-3 border-b border-[#eef0f4] pb-4">
        <div>
          <div className="text-[10px] text-[#9ba3b0]">Patterns detected</div>
          <div className="mt-1 text-[19px] font-semibold tracking-tight text-[#20243a] tabular-nums">
            {number.format(total)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[#9ba3b0]">Block recommendations</div>
          <div className="mt-1 text-[19px] font-semibold tracking-tight text-[#20243a] tabular-nums">
            {number.format(blocked)}
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-6">
        <div
          className="relative h-[146px] w-[146px] shrink-0 rounded-full"
          style={{ background: ring }}
        >
          <div className="absolute inset-[20px] grid place-items-center rounded-full bg-white text-center">
            <div>
              <div className="text-[20px] font-semibold leading-none text-[#25283b]">
                {number.format(total)}
              </div>
              <div className="mt-1 text-[10px] text-[#9aa2af]">total</div>
            </div>
          </div>
        </div>
        <div className="min-w-[135px] flex-1 space-y-2.5">
          {entries.length ? (
            entries.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between gap-2 text-[10px]">
                <span className="flex min-w-0 items-center gap-2 text-[#657082]">
                  <i
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: patternColors[index] }}
                  />
                  <span className="truncate">{entry.name}</span>
                </span>
                <span className="font-medium tabular-nums text-[#283047]">
                  {total ? Math.round((entry.value / total) * 100) : 0}%
                </span>
              </div>
            ))
          ) : (
            <span className="text-[11px] text-[#9ba3b0]">No patterns detected</span>
          )}
        </div>
      </div>
    </div>
  );
}

const severityStyle: Record<Severity, string> = {
  Critical: "bg-[#fff0f2] text-[#df5369]",
  High: "bg-[#fff5e9] text-[#c7832d]",
  Medium: "bg-[#f1f6fd] text-[#4886dd]",
  Low: "bg-[#e9f8f6] text-[#199b92]",
};
function alertTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function RecentAlerts({
  alerts,
  onSelect,
  search,
}: {
  alerts: AlertRow[];
  onSelect: (row: AlertRow) => void;
  search: string;
}) {
  const severity = useUIStore((state) => state.alertSeverity);
  const setSeverity = useUIStore((state) => state.setAlertSeverity);
  const term = search.trim().toLowerCase();
  const shown = alerts
    .filter(
      (alert) =>
        (severity === "All" || alert.severity === severity) &&
        (!term ||
          [alert.event, alert.user, alert.ip, alert.country, alert.severity].some((value) =>
            value.toLowerCase().includes(term),
          )),
    )
    .slice(0, 5);
  return (
    <div className="reference-card min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-[18px]">
        <PanelTitle icon={AlertTriangle} title="Recent alerts" />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 rounded-[4px] border border-[#e8ebf2] px-2 py-1 text-[10px] text-[#747e8c]">
            <Filter className="h-3 w-3" />
            <span className="sr-only">Filter severity</span>
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value as Severity | "All")}
              className="bg-transparent outline-none"
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
          <Link
            href="/alerts"
            className="flex items-center gap-1 text-[10px] font-medium text-[#417fd5] hover:underline"
          >
            See all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[450px] border-collapse text-left">
          <thead>
            <tr className="border-y border-[#eef0f4] bg-[#fafbfe] text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a0a8b5]">
              <th className="px-4 py-2.5 sm:pl-[18px]">Event</th>
              <th className="px-3 py-2.5">Source</th>
              <th className="px-3 py-2.5">Severity</th>
              <th className="px-4 py-2.5 text-right sm:pr-[18px]">Time</th>
            </tr>
          </thead>
          <tbody>
            {shown.length ? (
              shown.map((alert) => (
                <tr
                  key={alert.id}
                  onClick={() => onSelect(alert)}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onSelect(alert);
                  }}
                  className="cursor-pointer border-b border-[#eef0f4] last:border-0 hover:bg-[#fafbfe] focus:bg-[#fafbfe] focus:outline-none"
                >
                  <td className="max-w-[220px] truncate px-4 py-3 text-[11px] font-medium text-[#34394d] sm:pl-[18px]">
                    {alert.event}
                  </td>
                  <td className="max-w-[130px] truncate px-3 py-3 text-[10px] text-[#788394]">
                    {alert.user || alert.ip}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-[3px] px-1.5 py-1 text-[9px] font-semibold ${severityStyle[alert.severity]}`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[10px] tabular-nums text-[#8993a0] sm:pr-[18px]">
                    {alertTime(alert.timestamp)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-[11px] text-[#9ba3b0]">
                  No alerts match this filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, session, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useDashboardData();
  const [selected, setSelected] = useState<AlertRow | null>(null);
  const search = useUIStore((state) => state.alertSearch);
  const setSearch = useUIStore((state) => state.setAlertSearch);
  const [exporting, setExporting] = useState(false);
  const [emailing, setEmailing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth");
  }, [authLoading, user, router]);

  const exportReport = async () => {
    if (!session?.access_token) return;
    setExporting(true);
    try {
      const response = await fetch(`${API_URL}/api/reports/pdf`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Report generation failed");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "sentivoy_security_report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("Failed to export report. Please try again.");
    } finally {
      setExporting(false);
    }
  };
  const emailReport = async () => {
    if (!session?.access_token) return;
    setEmailing(true);
    try {
      const response = await fetch(`${API_URL}/api/reports/email`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Email failed");
      window.alert("Report emailed to your address.");
    } catch {
      window.alert("Failed to email report. Please try again.");
    } finally {
      setEmailing(false);
    }
  };

  if (authLoading || isLoading || error || !data)
    return (
      <PageDataState
        title="Dashboard"
        error={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );

  const { metrics, trend, threatPatterns, geoOrigins, alerts } = data;
  return (
    <AppFrame search={search} onSearchChange={setSearch}>
      <div className="mb-1 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.11em] text-[#a0a7b5]">
            Overview
          </p>
          <h1 className="text-[23px] font-semibold leading-tight tracking-[-0.04em] text-[#202439]">
            Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-[#e7eaf0] bg-white px-2.5 text-[10px] text-[#697386]">
            <CalendarDays className="h-3.5 w-3.5" />
            Live data
          </span>
          <button
            onClick={emailReport}
            disabled={emailing}
            title="Email report"
            aria-label="Email report"
            className="grid h-8 w-8 place-items-center rounded-[5px] border border-[#e7eaf0] bg-white text-[#697386] hover:text-[#3974c7] disabled:opacity-50"
          >
            <Mail className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={exportReport}
            disabled={exporting}
            className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-[#e7eaf0] bg-white px-3 text-[10px] font-medium text-[#4f586a] hover:bg-[#f7f7fd] disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric
          icon={Eye}
          label="Logs Processed"
          value={metrics.logs}
          detail="Events ingested"
          accent="#62b9ef"
        />
        <Metric
          icon={Activity}
          label="Anomalies Detected"
          value={metrics.anomalies}
          detail="Requires review"
          accent="#528de0"
        />
        <Metric
          icon={ShieldAlert}
          label="Critical Alerts"
          value={metrics.critical}
          detail="Highest priority"
          accent="#ee8490"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.18fr_0.82fr]">
        <section className="reference-card min-w-0 p-4 sm:p-[18px]">
          <PanelTitle icon={Activity} title="Security activity">
            <span className="rounded-[4px] border border-[#e8ebf2] px-2 py-1 text-[10px] text-[#747e8c]">
              Recent intervals
            </span>
          </PanelTitle>
          <div className="mt-2 text-[24px] font-semibold leading-none tracking-[-0.045em] text-[#20243a] tabular-nums">
            {number.format(metrics.anomalies)}
          </div>
          <div className="mt-1 text-[10px] text-[#9199a7]">
            Anomalies detected across your environment
          </div>
          <ThreatFlow trend={trend} />
        </section>
        <section className="reference-card min-w-0 p-4 sm:p-[18px]">
          <PanelTitle icon={ShieldAlert} title="Threat overview">
            <span className="rounded-[4px] border border-[#e8ebf2] px-2 py-1 text-[10px] text-[#747e8c]">
              Live
            </span>
          </PanelTitle>
          <div className="mt-2 text-[24px] font-semibold leading-none tracking-[-0.045em] text-[#20243a] tabular-nums">
            {number.format(metrics.threats)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-[#9199a7]">
            <span className="rounded-[3px] bg-[#e5f8f5] px-1.5 py-0.5 font-medium text-[#168f8c]">
              {number.format(metrics.blocked)} block suggestions
            </span>
            flagged threats
          </div>
          <VolumeBars trend={trend} />
        </section>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[0.82fr_1.18fr]">
        <PatternDonut patterns={threatPatterns} blocked={metrics.blocked} />
        <RecentAlerts alerts={alerts} onSelect={setSelected} search={search} />
      </div>
      <div className="dashboard-secondary grid grid-cols-1 gap-3 xl:grid-cols-[1.18fr_0.82fr]">
        <GeoThreatMap data={geoOrigins} />
        <AIInsights />
      </div>
      <div className="flex items-center justify-between pt-1 pb-2 text-[10px] text-[#a0a8b5]">
        <span>Sentivoy security intelligence</span>
        <span className="flex items-center gap-1">
          <Ban className="h-3 w-3" />
          {number.format(metrics.blocked)} block recommendations
        </span>
      </div>
      <AlertDrawer alert={selected} onClose={() => setSelected(null)} />
    </AppFrame>
  );
}
