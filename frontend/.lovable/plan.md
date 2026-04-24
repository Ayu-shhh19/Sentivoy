
# Log Anomaly Sentinel — AI Cybersecurity Dashboard

A modern, minimal SaaS-style command center for monitoring log anomalies, threats, and AI-driven security insights. Inspired by the uploaded Shopeers reference: soft light theme, rounded white cards on muted background, blue accent, clean grid layout.

## Design System
- **Theme**: Soft light (off-white background `#F7F8FA`, pure white cards)
- **Accent**: Security blue (primary), green (safe), amber (warning), red (critical)
- **Cards**: ~18px radius, subtle shadow, hairline borders
- **Typography**: Clean sans (Inter), large bold metric numbers, muted secondary text
- **Motion**: Soft hover lifts, fade/slide transitions between sections, animated number counters, pulsing dot for "live" indicators

## Layout

**Left Sidebar (collapsible)**
- Logo "Log Anomaly Sentinel" with shield icon
- Nav items with icons: Dashboard, Threat Analytics, Live Logs, Alerts, User Behavior (UEBA), Geo Intelligence, Incident Response, Integrations, Settings
- Active item: soft blue pill background, blue text
- Bottom: "Upgrade to Enterprise" promo card + Help & Support

**Top Header**
- Global search ("Search logs, IPs, users...") with ⌘K hint
- Date range filter (24h / 7d / 30d / Custom)
- Live status pill (green pulsing dot — "Monitoring")
- Notifications bell with red badge
- Profile avatar

## Dashboard Page Sections

1. **Page title + "Add widget" / "Export report" actions**

2. **Top Metric Cards (5)** — Total Logs Processed, Anomalies Detected, Critical Alerts, Active Threats, Blocked IPs. Each: icon, big number (animated count-up), % delta vs last period (green/red), "vs last period" caption.

3. **Anomaly Trend Graph** (large card) — smooth area/line chart over time, severity tooltip on hover, severity legend, time-range tabs.

4. **Most Day Active / Threat Patterns Bar Chart** (right column) — bar chart of Brute Force, API Abuse, Geo Jump, Privilege Escalation, SQL Injection.

5. **Geo Threat Map** — world map with pulsing dots at suspicious IP origins, color intensity by threat level, side legend with top 5 origin countries.

6. **AI Insights Panel** — featured card with AI avatar, sample insight ("Unusual login pattern from 3 countries in 10 mins"), suggested action button ("Force MFA"), and a minimal "Ask Sentinel AI..." input at the bottom.

7. **Repeat Attack Rate** — radial progress (e.g., 68%) with subtitle "of flagged actors re-attempted within 24h" and a "Show details" button.

8. **Recent Alerts Table** — columns: Timestamp, User/IP, Event Type, Severity (color pill — Critical/High/Medium/Low), Status (Open/Investigating/Resolved), Action menu. Critical rows have a subtle red glow accent on the left edge.

## Interactions
- Clicking any anomaly row or chart point opens a **right-side drill-down drawer** with full event details, raw log snippet, related events, and remediation actions.
- All metrics simulate "live" updates with subtle number changes every few seconds.
- Hover micro-interactions on cards (slight lift + shadow), smooth section transitions, animated chart draw-in on load.

## Routes
- `/` — Main Dashboard (everything above)
- Sidebar links to Threat Analytics, Live Logs, Alerts, UEBA, Geo Intelligence, Incident Response, Integrations, Settings render as separate route files with placeholder "Coming soon" states styled consistently, so navigation works end-to-end with proper SSR/SEO per page.

## Tech
- TanStack Start routes per section
- Recharts for line/bar/radial charts
- react-simple-maps (or lightweight SVG world map) for Geo Threat Map
- Lucide icons throughout
- Mock data generators for live-feel updates
