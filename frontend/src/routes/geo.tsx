import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/sentinel/PageShell";
import { GeoThreatMap } from "@/components/sentinel/GeoThreatMap";
import { geoOrigins } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/geo")({
  head: () => ({
    meta: [
      { title: "Geo Intelligence — Sentivoy" },
      { name: "description", content: "Geographic threat intelligence and IP reputation feeds." },
    ],
  }),
  component: GeoPage,
});

const asns = [
  { asn: "AS9009", org: "M247 Ltd", country: "RO", reputation: "malicious", threats: 412 },
  { asn: "AS14061", org: "DigitalOcean", country: "US", reputation: "suspicious", threats: 287 },
  { asn: "AS4134", org: "China Telecom", country: "CN", reputation: "malicious", threats: 196 },
  { asn: "AS16509", org: "Amazon AWS", country: "US", reputation: "neutral", threats: 134 },
  { asn: "AS200651", org: "Flokinet", country: "SC", reputation: "malicious", threats: 98 },
];

const repStyle = {
  malicious: "bg-critical/10 text-critical",
  suspicious: "bg-warning/15 text-[oklch(0.5_0.13_70)]",
  neutral: "bg-muted text-muted-foreground",
};

function GeoPage() {
  return (
    <PageShell
      title="Geo Intelligence"
      description="Geographic threat sources, ASN reputation, and impossible-travel signals."
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 min-h-[480px]">
          <GeoThreatMap />
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="p-5 pb-3">
            <div className="text-[15px] font-semibold text-foreground">Country Breakdown</div>
            <div className="text-xs text-muted-foreground mt-0.5">All flagged origins, last 24h</div>
          </div>
          <div className="px-2 pb-3 max-h-[420px] overflow-y-auto scrollbar-thin">
            {geoOrigins.map((o) => (
              <div
                key={o.code}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/40 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-9 rounded bg-muted grid place-items-center font-mono text-[10px] font-bold text-muted-foreground">
                    {o.code}
                  </div>
                  <div>
                    <div className="text-[13px] text-foreground">{o.country}</div>
                    <div className="text-[10.5px] text-muted-foreground capitalize">{o.intensity} intensity</div>
                  </div>
                </div>
                <div className="text-[13px] font-semibold text-foreground tabular-nums">{o.threats}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden">
        <div className="p-5 pb-3">
          <div className="text-[15px] font-semibold text-foreground">ASN Reputation</div>
          <div className="text-xs text-muted-foreground mt-0.5">Autonomous systems ranked by hostile traffic</div>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="font-medium px-5 py-2.5 text-[11px] uppercase tracking-wider">ASN</th>
              <th className="font-medium px-3 py-2.5 text-[11px] uppercase tracking-wider">Organization</th>
              <th className="font-medium px-3 py-2.5 text-[11px] uppercase tracking-wider">Country</th>
              <th className="font-medium px-3 py-2.5 text-[11px] uppercase tracking-wider">Reputation</th>
              <th className="font-medium px-5 py-2.5 text-[11px] uppercase tracking-wider">Threats</th>
            </tr>
          </thead>
          <tbody>
            {asns.map((a) => (
              <tr key={a.asn} className="border-b border-border last:border-0 hover:bg-muted/40 transition">
                <td className="px-5 py-3 font-mono text-primary font-semibold">{a.asn}</td>
                <td className="px-3 py-3 text-foreground">{a.org}</td>
                <td className="px-3 py-3 text-muted-foreground font-mono text-[12px]">{a.country}</td>
                <td className="px-3 py-3">
                  <span className={cn("text-[10.5px] font-semibold capitalize px-2 py-0.5 rounded-md", repStyle[a.reputation as keyof typeof repStyle])}>
                    {a.reputation}
                  </span>
                </td>
                <td className="px-5 py-3 text-foreground tabular-nums font-semibold">{a.threats}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
