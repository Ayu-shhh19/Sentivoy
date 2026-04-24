// Mock data generators for the Sentinel dashboard

export type Severity = "Critical" | "High" | "Medium" | "Low";
export type AlertStatus = "Open" | "Investigating" | "Resolved";

export interface AlertRow {
  id: string;
  timestamp: string;
  user: string;
  ip: string;
  event: string;
  severity: Severity;
  status: AlertStatus;
  country: string;
  rawLog: string;
}

const events = [
  "Failed login burst",
  "Privilege escalation attempt",
  "Suspicious API token use",
  "Geo-impossible travel",
  "SQL injection pattern",
  "Brute force on /admin",
  "Data exfiltration spike",
  "Unusual file download",
  "MFA bypass attempt",
  "Token reuse detected",
];

const users = [
  "j.morrison@acme.io",
  "svc-deploy",
  "k.tanaka@acme.io",
  "root",
  "a.silva@acme.io",
  "billing-bot",
  "m.kowalski@acme.io",
  "guest-37",
];

const countries = ["RU", "CN", "US", "BR", "NG", "DE", "IN", "VN", "IR", "KP"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomIp() {
  return `${1 + Math.floor(Math.random() * 223)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

const severities: Severity[] = ["Critical", "High", "Medium", "Low"];
const statuses: AlertStatus[] = ["Open", "Investigating", "Resolved"];

export function generateAlerts(n = 12): AlertRow[] {
  const now = Date.now();
  return Array.from({ length: n }).map((_, i) => {
    const ts = new Date(now - i * 1000 * 60 * (3 + Math.random() * 18));
    const sev = i < 2 ? "Critical" : rand(severities);
    return {
      id: `evt_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: ts.toISOString(),
      user: rand(users),
      ip: randomIp(),
      event: rand(events),
      severity: sev,
      status: rand(statuses),
      country: rand(countries),
      rawLog: `[${ts.toISOString()}] level=warn src_ip=${randomIp()} user=${rand(users)} event="${rand(events)}" geo=${rand(countries)} session=${Math.random().toString(36).slice(2)}`,
    };
  });
}

export function generateTrend(points = 48) {
  const now = Date.now();
  const arr = [];
  let base = 40;
  for (let i = points - 1; i >= 0; i--) {
    base += (Math.random() - 0.45) * 12;
    base = Math.max(8, Math.min(120, base));
    const t = new Date(now - i * 1000 * 60 * 30);
    arr.push({
      time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      anomalies: Math.round(base + Math.random() * 10),
      critical: Math.round(Math.max(0, base * 0.18 + (Math.random() - 0.5) * 6)),
    });
  }
  return arr;
}

export const threatPatterns = [
  { name: "Brute Force", value: 412 },
  { name: "API Abuse", value: 287 },
  { name: "Geo Jump", value: 196 },
  { name: "Priv. Escalation", value: 134 },
  { name: "SQL Injection", value: 98 },
];

export interface GeoOrigin {
  country: string;
  code: string;
  // Approx normalized coords on a 1000x500 equirectangular map
  x: number;
  y: number;
  threats: number;
  intensity: "low" | "medium" | "high" | "critical";
}

export const geoOrigins: GeoOrigin[] = [
  { country: "Russia", code: "RU", x: 660, y: 130, threats: 1284, intensity: "critical" },
  { country: "China", code: "CN", x: 760, y: 200, threats: 962, intensity: "critical" },
  { country: "Brazil", code: "BR", x: 360, y: 320, threats: 487, intensity: "high" },
  { country: "Nigeria", code: "NG", x: 520, y: 280, threats: 312, intensity: "high" },
  { country: "Vietnam", code: "VN", x: 770, y: 245, threats: 241, intensity: "medium" },
  { country: "Iran", code: "IR", x: 605, y: 200, threats: 198, intensity: "medium" },
  { country: "United States", code: "US", x: 240, y: 200, threats: 156, intensity: "low" },
  { country: "Germany", code: "DE", x: 510, y: 160, threats: 88, intensity: "low" },
];
