import {
  Activity,
  LayoutDashboard,
  ShieldCheck,
  ScrollText,
  Globe2,
  Settings,
  Check,
} from "lucide-react";
import { SentivoyLogo } from "./SentivoyLogo";

export function ProductPreview() {
  return (
    <div className="product-preview" aria-label="Illustrative Sentivoy dashboard">
      <div className="preview-toolbar">
        <span className="preview-dots">
          <i />
          <i />
          <i />
        </span>
        <span>Sentivoy / Security overview</span>
        <span>Illustrative workspace</span>
      </div>
      <div className="preview-body">
        <aside className="preview-sidebar" aria-hidden="true">
          <SentivoyLogo />
          {[
            [LayoutDashboard, "Dashboard"],
            [Activity, "Threat Analytics"],
            [ScrollText, "Live Logs"],
            [Globe2, "Geo Intelligence"],
            [Settings, "Settings"],
          ].map(([Icon, label], index) => {
            const Component = Icon as typeof Activity;
            return (
              <div
                key={String(label)}
                className={`preview-nav-item ${index === 0 ? "active" : ""}`}
              >
                <Component size={12} />
                {String(label)}
              </div>
            );
          })}
        </aside>
        <div className="preview-main">
          <div className="preview-title">
            <span>Security overview</span>
            <small>
              <Check size={11} />
              Connected & monitoring
            </small>
          </div>
          <div className="preview-metrics">
            {[
              ["Events analyzed", "24,890", "Monitoring"],
              ["Anomalies detected", "128", "In review"],
              ["Critical alerts", "12", "Prioritized"],
            ].map(([label, value, note]) => (
              <div className="preview-metric" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{note}</small>
              </div>
            ))}
          </div>
          <div className="preview-charts">
            <div className="preview-chart">
              <div className="preview-chart-title">
                Activity over time<small>Last 24 hours</small>
              </div>
              <svg viewBox="0 0 450 166" role="img" aria-label="Example anomaly activity chart">
                <defs>
                  <linearGradient id="preview-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7da1d4" stopOpacity=".3" />
                    <stop offset="1" stopColor="#7da1d4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[30, 65, 100, 135].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="450"
                    y2={y}
                    stroke="#ecf0f6"
                    strokeDasharray="3 4"
                  />
                ))}
                <path
                  d="M0 120 C30 120 35 72 65 85 S110 120 140 73 S195 90 225 48 S270 78 300 55 S355 15 385 30 S425 48 450 12 L450 146 L0 146 Z"
                  fill="url(#preview-area)"
                />
                <path
                  d="M0 120 C30 120 35 72 65 85 S110 120 140 73 S195 90 225 48 S270 78 300 55 S355 15 385 30 S425 48 450 12"
                  fill="none"
                  stroke="#779bce"
                  strokeWidth="2.5"
                />
                <path
                  d="M0 136 C35 140 48 112 80 121 S125 126 154 106 S200 126 235 104 S290 117 320 90 S360 106 393 79 S425 91 450 73"
                  fill="none"
                  stroke="#6fbbb5"
                  strokeWidth="2"
                />
                {["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"].map((label, index) => (
                  <text key={label} x={index * 81} y="164" fontSize="8" fill="#98a5b8">
                    {label}
                  </text>
                ))}
              </svg>
            </div>
            <div className="preview-chart">
              <div className="preview-chart-title">
                Detection stream
                <ShieldCheck size={12} />
              </div>
              {[
                ["Unusual sign-in pattern", "Just now"],
                ["New source connected", "2 min ago"],
                ["Elevated API activity", "5 min ago"],
                ["Security report ready", "12 min ago"],
              ].map(([event, time]) => (
                <div className="preview-alert" key={event}>
                  <i />
                  <span>{event}</span>
                  <small>{time}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
