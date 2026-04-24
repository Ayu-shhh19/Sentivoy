import { geoOrigins } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const intensityColor = {
  critical: "oklch(0.62 0.24 22)",
  high: "oklch(0.72 0.18 40)",
  medium: "oklch(0.78 0.15 78)",
  low: "oklch(0.58 0.19 260)",
};

const intensityLabel = {
  critical: "bg-critical/10 text-critical",
  high: "bg-warning/15 text-[oklch(0.55_0.13_60)]",
  medium: "bg-warning/15 text-[oklch(0.55_0.13_70)]",
  low: "bg-primary-soft text-primary",
};

export function GeoThreatMap() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-soft)] h-full flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[15px] font-semibold text-foreground">Geo Threat Origins</div>
          <div className="text-xs text-muted-foreground mt-0.5">Suspicious IP sources, last 24h</div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-critical" />Critical</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" />High</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Low</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-4 mt-4 flex-1 min-h-0">
        <div className="relative rounded-xl bg-[oklch(0.97_0.005_247)] border border-border overflow-hidden">
          <svg viewBox="0 0 1000 500" className="w-full h-full">
            {/* Stylized world map silhouette using simple paths */}
            <defs>
              <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="oklch(0.85 0.01 255)" />
              </pattern>
            </defs>
            <rect width="1000" height="500" fill="url(#dots)" />
            {/* Continent blobs (very abstract) */}
            <g fill="oklch(0.92 0.012 255)" stroke="oklch(0.86 0.014 255)" strokeWidth="1">
              {/* North America */}
              <path d="M120,120 q40,-40 110,-30 q70,10 100,40 q30,30 10,80 q-20,40 -80,60 q-50,15 -100,-10 q-50,-25 -55,-70 q-5,-40 15,-70z" />
              {/* South America */}
              <path d="M310,290 q30,-10 50,10 q15,40 -10,90 q-25,40 -55,40 q-25,-5 -30,-40 q-10,-50 15,-90 q12,-15 30,-10z" />
              {/* Europe */}
              <path d="M470,130 q40,-20 80,0 q30,20 25,55 q-10,30 -50,40 q-50,5 -70,-15 q-15,-25 -10,-50 q5,-20 25,-30z" />
              {/* Africa */}
              <path d="M490,210 q40,-10 70,15 q25,30 25,80 q-5,55 -45,90 q-40,30 -70,5 q-30,-30 -25,-90 q5,-60 45,-100z" />
              {/* Asia */}
              <path d="M600,110 q80,-30 180,0 q60,25 80,80 q15,60 -30,110 q-60,40 -150,30 q-80,-10 -110,-50 q-25,-35 -10,-90 q10,-50 40,-80z" />
              {/* Oceania */}
              <path d="M790,330 q35,-10 60,10 q15,20 0,45 q-25,25 -55,15 q-25,-10 -25,-35 q0,-25 20,-35z" />
            </g>

            {/* Origin dots */}
            {geoOrigins.map((o, i) => {
              const c = intensityColor[o.intensity];
              const r = 4 + Math.min(10, o.threats / 200);
              return (
                <g key={i}>
                  <circle cx={o.x} cy={o.y} r={r * 2.2} fill={c} opacity="0.18">
                    <animate attributeName="r" values={`${r * 1.6};${r * 3};${r * 1.6}`} dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.25;0;0.25" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={o.x} cy={o.y} r={r} fill={c} stroke="white" strokeWidth="1.5" />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Top Origins
          </div>
          {geoOrigins.slice(0, 5).map((o) => (
            <div
              key={o.code}
              className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-muted/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono font-semibold text-muted-foreground w-6">{o.code}</span>
                <span className="text-[12.5px] text-foreground truncate">{o.country}</span>
              </div>
              <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-md", intensityLabel[o.intensity])}>
                {o.threats}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
