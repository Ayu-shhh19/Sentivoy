import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

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

export interface GeoOrigin {
  country: string;
  code: string;
  x: number; // longitude
  y: number; // latitude
  threats: number;
  intensity: "low" | "medium" | "high" | "critical";
}

interface GeoThreatMapProps {
  data: Array<GeoOrigin>;
}

/* ── Mercator helpers ───────────────────────────────────── */
function lonToX(lon: number, width: number) {
  return ((lon + 180) / 360) * width;
}

function latToY(lat: number, height: number) {
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  return height / 2 - (mercN / Math.PI) * (height / 2);
}

/* ── SVG world map (rendered from TopoJSON at /world-110m.json) ── */
function useWorldPaths() {
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/world-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        if (cancelled) return;
        // We only need the country outlines; extract arcs and convert to SVG
        // For simplicity, we use a pre-rendered approach via canvas path extraction
        // But since this is TopoJSON, we need to decode it.
        const { topology } = extractGeoJSON(topo);
        setPaths(topology);
      })
      .catch(() => {
        // Fallback: no map background
        if (!cancelled) setPaths([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return paths;
}

/* ── Minimal TopoJSON → SVG path decoder ────────────────── */
function extractGeoJSON(topo: Record<string, unknown>): { topology: string[] } {
  const result: string[] = [];

  try {
    const arcs = (topo as { arcs: number[][][] }).arcs;
    const transform = (topo as { transform?: { scale: [number, number]; translate: [number, number] } }).transform;

    const objectsKey = Object.keys(topo.objects as Record<string, unknown>)[0];
    const geometries = ((topo.objects as Record<string, { geometries: Array<{ type: string; arcs: unknown }> }>)[objectsKey]).geometries;

    const decodeArc = (arcIndexes: number[][]): [number, number][][] => {
      return arcIndexes.map((ring) => {
        const coords: [number, number][] = [];
        for (const idx of ring) {
          const reversed = idx < 0;
          const arcIdx = reversed ? ~idx : idx;
          const arc = arcs[arcIdx];
          if (!arc) continue;

          let points: [number, number][] = [];
          let cx = 0, cy = 0;
          for (const pt of arc) {
            cx += pt[0];
            cy += pt[1];
            let x = cx, y = cy;
            if (transform) {
              x = x * transform.scale[0] + transform.translate[0];
              y = y * transform.scale[1] + transform.translate[1];
            }
            points.push([x, y]);
          }
          if (reversed) points = points.reverse();
          coords.push(...points);
        }
        return coords;
      });
    };

    const WIDTH = 800;
    const HEIGHT = 450;

    for (const geom of geometries) {
      let rings: number[][][] = [];

      if (geom.type === "Polygon") {
        rings = [geom.arcs as number[][]];
      } else if (geom.type === "MultiPolygon") {
        rings = geom.arcs as number[][][];
      } else {
        continue;
      }

      for (const polygon of rings) {
        const decoded = decodeArc(polygon);
        for (const coordRing of decoded) {
          if (coordRing.length < 2) continue;
          const pathParts = coordRing.map((c, i) => {
            const px = lonToX(c[0], WIDTH);
            const py = latToY(c[1], HEIGHT);
            return `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
          });
          pathParts.push("Z");
          result.push(pathParts.join(""));
        }
      }
    }
  } catch {
    // Graceful fallback — show markers without map
  }

  return { topology: result };
}

/* ── Component ──────────────────────────────────────────── */
const MAP_WIDTH = 800;
const MAP_HEIGHT = 450;

export function GeoThreatMap({ data }: GeoThreatMapProps) {
  const geoOrigins = data || [];
  const paths = useWorldPaths();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-soft)] h-full flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[15px] font-semibold text-foreground">Geo Threat Origins</div>
          <div className="text-xs text-muted-foreground mt-0.5">Live IP resolution, last 24h</div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-critical" />Critical</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" />High</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Low</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-4 mt-4 flex-1 min-h-0">
        <div
          ref={containerRef}
          className="relative rounded-xl bg-[oklch(0.97_0.005_247)] border border-border overflow-hidden dark:bg-[oklch(0.18_0.01_260)]"
        >
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Country shapes */}
            {paths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="oklch(0.92 0.012 255)"
                stroke="oklch(0.86 0.014 255)"
                strokeWidth={0.5}
                className="dark:fill-[oklch(0.24_0.02_260)] dark:stroke-[oklch(0.3_0.03_260)]"
              />
            ))}

            {/* Threat markers */}
            {geoOrigins.map((o, i) => {
              if (!o.x || !o.y) return null;
              const c = intensityColor[o.intensity];
              const r = 3 + Math.min(6, o.threats / 50);
              const px = lonToX(o.x, MAP_WIDTH);
              const py = latToY(o.y, MAP_HEIGHT);

              return (
                <g key={i}>
                  {/* Glow */}
                  <circle cx={px} cy={py} r={r * 2.5} fill={c} opacity="0.2">
                    <animate attributeName="r" values={`${r * 2};${r * 3.5};${r * 2}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  {/* Core dot */}
                  <circle cx={px} cy={py} r={r} fill={c} stroke="var(--card)" strokeWidth={1} />
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
          {geoOrigins.length === 0 && (
             <div className="text-[11px] text-muted-foreground pt-4 text-center">No threats active</div>
          )}
        </div>
      </div>
    </div>
  );
}
