import { useCallback, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Database,
  Fingerprint,
  Globe2,
  LockKeyhole,
  Menu,
  Radio,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { SentivoyLogo } from "@/components/brand/SentivoyLogo";
import { EarthGlobe } from "@/components/brand/EarthGlobe";
import { LandingIntro } from "@/components/brand/LandingIntro";
import { usePageReveal } from "@/hooks/usePageReveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentivoy — A world of signals. One clear view." },
      {
        name: "description",
        content:
          "Explore your security landscape with Sentivoy. Logs, anomaly detection, and investigations in one connected workspace.",
      },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: Radio,
    title: "Follow every signal",
    description:
      "Explore incoming logs and filter by source or severity. Keep the details close, from the first event to the next investigation.",
    short: "Live monitoring",
  },
  {
    icon: Fingerprint,
    title: "Understand the unusual",
    description:
      "Bring anomaly scores, user behavior, and event patterns together to see what deserves your attention.",
    short: "Anomaly detection",
  },
  {
    icon: Globe2,
    title: "See the bigger picture",
    description:
      "Explore the geographic context behind your alerts and connect activity across your environment.",
    short: "Geo intelligence",
  },
  {
    icon: ShieldCheck,
    title: "Investigate with context",
    description:
      "Open an alert, examine its raw event, and review the people and sources involved before choosing your next step.",
    short: "Alert investigation",
  },
];
const questions = [
  [
    "What can I monitor with Sentivoy?",
    "Sentivoy brings ingested logs, anomaly detections, user activity, and geographic threat signals into a single workspace. The integrations page shows the available source options.",
  ],
  [
    "How do I investigate a detection?",
    "Open an alert to review its severity, source IP, user, timestamp, and raw log. Use the analytics and geography views to explore related patterns.",
  ],
  [
    "Can I share security reports?",
    "Export a report from the dashboard or email it to the address associated with your account. You can also export filtered alerts as CSV.",
  ],
];

function PhonePreview({ active = 0 }: { active?: number }) {
  return (
    <div className="phone-preview" aria-label="Illustrative Sentivoy mobile workspace">
      <div className="phone-island" />
      <div className="phone-status">
        <span>9:41</span>
        <span>••• ▰</span>
      </div>
      <div className="phone-content">
        <SentivoyLogo className="phone-brand" />
        <div className="phone-greeting">YOUR SECURITY, IN VIEW</div>
        <h3>
          Good morning,
          <br />
          Alex <span>✦</span>
        </h3>
        <div className="phone-summary">
          <span>
            Security overview <ShieldCheck size={17} />
          </span>
          <strong>One clear view.</strong>
          <small>Your signals, connected.</small>
          <svg viewBox="0 0 230 65" aria-hidden="true">
            <path
              d="M0 57 Q20 52 30 40 T65 42 T100 20 T135 30 T170 11 T205 18 L230 4"
              fill="none"
              stroke="#8dc9ff"
              strokeWidth="2.5"
            />
            <path
              d="M0 62 Q30 40 60 52 T115 43 T175 34 T230 25"
              fill="none"
              stroke="#3e79c9"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="phone-section-title">
          Explore your workspace <ArrowUpRight size={13} />
        </div>
        {features.slice(0, 3).map(({ icon: Icon, short }, i) => (
          <div key={short} className={`phone-feature ${active % 3 === i ? "is-active" : ""}`}>
            <Icon size={17} />
            <span>
              {short}
              <small>
                {["Events as they arrive", "Patterns with context", "A global perspective"][i]}
              </small>
            </span>
            <ArrowUpRight size={14} />
          </div>
        ))}
        <div className="phone-bottom">
          <Activity size={18} />
          <Globe2 size={18} />
          <ShieldCheck size={18} />
        </div>
        <div className="phone-home" />
      </div>
    </div>
  );
}

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);
  const completeIntro = useCallback(() => setIntroComplete(true), []);
  const ref = usePageReveal<HTMLDivElement>("landing", "[data-reveal]", introComplete);
  return (
    <div className="blue-site" ref={ref}>
      {!introComplete && <LandingIntro onComplete={completeIntro} />}
      <div className="landing-content" inert={!introComplete}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <header className="blue-nav">
          <Link to="/" aria-label="Sentivoy home">
            <SentivoyLogo />
          </Link>
          <nav aria-label="Website">
            <a href="#platform">Features</a>
            <a href="#solutions">Solutions</a>
            <a href="#workspace">Workspace</a>
            <a href="#questions">Questions</a>
          </nav>
          <Link to="/auth" className="blue-button nav-signin">
            Sign in <ArrowUpRight size={14} />
          </Link>
          <button
            className="blue-menu"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="blue-mobile-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          {menuOpen && (
            <nav id="blue-mobile-nav" className="blue-mobile-nav" aria-label="Mobile website">
              <a href="#platform" onClick={() => setMenuOpen(false)}>
                Features
              </a>
              <a href="#solutions" onClick={() => setMenuOpen(false)}>
                Solutions
              </a>
              <a href="#workspace" onClick={() => setMenuOpen(false)}>
                Workspace
              </a>
              <Link to="/auth">Sign in / Create account</Link>
            </nav>
          )}
        </header>
        <main id="main-content">
          <section className="blue-hero">
            <div className="blue-hero-copy" data-reveal="left">
              <span className="blue-eyebrow">
                <i /> INTELLIGENCE WITHOUT BOUNDARIES
              </span>
              <h1>
                A world of signals.
                <br />
                <span>One clear view.</span>
              </h1>
              <p>
                Make sense of your security landscape. Bring every log, anomaly, and investigation
                into one connected workspace.
              </p>
              <div className="blue-hero-actions">
                <Link to="/auth" className="blue-button">
                  Open your workspace <ArrowRight size={17} />
                </Link>
                <a href="#platform" className="blue-text-link">
                  Explore the platform <ArrowUpRight size={15} />
                </a>
              </div>
              <div className="blue-hero-facts">
                <div>
                  <strong>Observe.</strong>
                  <span>Follow your signals</span>
                </div>
                <div>
                  <strong>Understand.</strong>
                  <span>Find your next move</span>
                </div>
              </div>
            </div>
            <div className="blue-hero-earth" data-reveal="right">
              <EarthGlobe />
            </div>
            <div className="blue-hero-bottom">
              <span>
                <LockKeyhole size={12} /> Your security. A broader perspective.
              </span>
              <a href="#platform">
                SCROLL TO EXPLORE <ChevronDown size={13} />
              </a>
            </div>
          </section>
          <div className="blue-capabilities blue-container" data-reveal>
            <span>
              <Database size={17} /> Log intelligence
            </span>
            <span>
              <Activity size={17} /> Anomaly detection
            </span>
            <span>
              <Globe2 size={17} /> Global context
            </span>
            <span>
              <ShieldCheck size={17} /> Incident workflows
            </span>
          </div>
          <section id="solutions" className="blue-section blue-container">
            <div className="blue-section-heading" data-reveal>
              <span className="blue-kicker">BUILT FOR YOUR PERSPECTIVE</span>
              <h2>
                Different roles.
                <br className="mobile-break" /> One shared view.
              </h2>
              <div className="blue-intro-row">
                <p>
                  Security looks different from every seat.
                  <br />
                  Bring your team closer to the whole picture.
                </p>
                <p>
                  From understanding an alert to exploring a pattern, find the context you need.
                </p>
                <a href="#platform" className="blue-text-link">
                  Discover the platform <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
            <div className="blue-role-grid">
              {[
                {
                  title: "Security analysts",
                  description:
                    "Triage alerts, review raw events, and follow the signals that need a closer look.",
                  label: "Explore alerts",
                  icon: ShieldCheck,
                  className: "analyst",
                  code: "EVENT / 001",
                  main: "Signal detected",
                  sub: "Context is one click away.",
                },
                {
                  title: "Engineering teams",
                  description:
                    "Explore log streams and connect unusual activity to the systems behind it.",
                  label: "Explore logs",
                  icon: Database,
                  className: "engineer",
                  code: "STREAM / LIVE",
                  main: "Every event, in view",
                  sub: "Follow the flow of your systems.",
                },
                {
                  title: "Security leaders",
                  description:
                    "See your security activity in context and share a clearer picture with your team.",
                  label: "Explore insights",
                  icon: Globe2,
                  className: "leader",
                  code: "INSIGHT / GLOBAL",
                  main: "A wider perspective",
                  sub: "Your environment, connected.",
                },
              ].map(({ title, description, label, icon: Icon, className, code, main, sub }) => (
                <article data-reveal="scale" key={title}>
                  <Link to="/auth" className={`blue-role-art ${className}`} aria-label={label}>
                    <span className="role-pill">
                      {label}
                      <ArrowUpRight size={12} />
                    </span>
                    <div className="role-art-grid" />
                    <div className="role-art-icon">
                      <Icon size={62} strokeWidth={1} />
                    </div>
                    <div className="role-art-caption">
                      <small>{code}</small>
                      <strong>{main}</strong>
                      <span>{sub}</span>
                    </div>
                  </Link>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
            <div className="blue-section-action" data-reveal>
              <a href="#platform" className="blue-button pale">
                A connected view for your entire team <ArrowRight size={16} />
              </a>
            </div>
          </section>
          <section id="platform" className="blue-feature-section">
            <div className="blue-container blue-feature-layout">
              <div className="blue-phone-stage" data-reveal="left">
                <div className="phone-stage-ring" />
                <PhonePreview active={active} />
                <span className="preview-caption">Illustrative workspace · sample content</span>
              </div>
              <div className="blue-feature-copy" data-reveal="right">
                <span className="blue-kicker">LESS SEARCHING. MORE UNDERSTANDING.</span>
                <h2>
                  Everything you need.
                  <br />
                  Closer than ever.
                </h2>
                <p>Move naturally from a broad overview to the details that matter.</p>
                <div className="blue-accordion">
                  {features.map(({ icon: Icon, title, description }, i) => (
                    <div
                      className={`blue-feature-item ${active === i ? "active" : ""}`}
                      key={title}
                    >
                      <button
                        aria-expanded={active === i}
                        aria-controls={`feature-panel-${i}`}
                        onClick={() => setActive(i)}
                      >
                        <Icon size={19} />
                        <span>{title}</span>
                        <ArrowUpRight size={17} />
                      </button>
                      <div id={`feature-panel-${i}`} hidden={active !== i}>
                        <p>{description}</p>
                        <Link to="/auth">
                          Explore Sentivoy <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section className="blue-section blue-container">
            <div className="blue-section-heading" data-reveal>
              <span className="blue-kicker">FROM FIRST SIGNAL TO NEXT STEP</span>
              <h2>A clearer way forward.</h2>
              <div className="blue-intro-row">
                <p>
                  Keep your investigation moving with the information you need, right where you need
                  it.
                </p>
                <p>
                  One workspace connects the steps.
                  <br />
                  You bring the judgment.
                </p>
              </div>
            </div>
            <div className="blue-story-grid">
              {[
                {
                  n: "01",
                  title: "Bring it together.",
                  text: "Start with your incoming logs. Review activity from connected sources in a focused, searchable feed.",
                  icon: Database,
                  tag: "OBSERVE",
                },
                {
                  n: "02",
                  title: "Find what stands out.",
                  text: "Explore anomalies alongside user behavior and geography. Give each alert the context it deserves.",
                  icon: Fingerprint,
                  tag: "UNDERSTAND",
                },
                {
                  n: "03",
                  title: "Take the next step.",
                  text: "Investigate an event, review its details, and share your findings with an exportable security report.",
                  icon: ArrowUpRight,
                  tag: "INVESTIGATE",
                },
              ].map(({ n, title, text, icon: Icon, tag }) => (
                <article data-reveal="scale" key={n}>
                  <div className="story-card-top">
                    <span>{n}</span>
                    <Icon size={22} />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span className="story-card-tag">
                    {tag}
                    <ArrowUpRight size={15} />
                  </span>
                </article>
              ))}
            </div>
          </section>
          <section id="workspace" className="blue-workspace-section">
            <div className="blue-workspace-inner">
              <div data-reveal>
                <span className="blue-kicker">ONE PLATFORM. EVERY PERSPECTIVE.</span>
                <h2>Choose your next view.</h2>
                <p>Go from monitoring to investigation without losing the context.</p>
              </div>
              <div className="blue-comparison-scroll" data-reveal>
                <table className="blue-comparison">
                  <caption className="sr-only">
                    Capabilities across Sentivoy workspace views
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Your workspace</th>
                      <th scope="col">
                        <span>
                          Monitor <Activity size={15} />
                        </span>
                      </th>
                      <th scope="col">
                        <span>
                          Analyze <Zap size={15} />
                        </span>
                      </th>
                      <th scope="col">
                        <span>
                          Investigate <ShieldCheck size={15} />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Start with", "Live logs", "Threat analytics", "Alerts"],
                      ["Explore", "Event streams", "Patterns & geography", "Severity & context"],
                      ["Look closer", "Sources & levels", "User behavior", "Raw event details"],
                      [
                        "Stay connected",
                        "Shared navigation",
                        "Shared navigation",
                        "Shared navigation",
                      ],
                    ].map(([label, ...cells]) => (
                      <tr key={label}>
                        <th scope="row">{label}</th>
                        {cells.map((cell, index) => (
                          <td key={index}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <th scope="row">Built into Sentivoy</th>
                      {[0, 1, 2].map((i) => (
                        <td key={i}>
                          <Check size={18} />
                          <span className="sr-only">Included</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="blue-try-layout">
                <div data-reveal>
                  <span className="blue-kicker">YOUR NEXT MOVE STARTS HERE</span>
                  <h2>See it for yourself.</h2>
                  <p>
                    A world of signals, organized around you.
                    <br />
                    Open Sentivoy and find your perspective.
                  </p>
                  <Link to="/auth" className="blue-button">
                    Get started <ArrowUpRight size={17} />
                  </Link>
                  <small>
                    <Globe2 size={13} /> Available in your browser
                  </small>
                </div>
                <div className="blue-try-phone" data-reveal="right">
                  <PhonePreview active={2} />
                </div>
              </div>
            </div>
          </section>
          <section id="questions" className="blue-section blue-container blue-faq">
            <div data-reveal>
              <span className="blue-kicker">A LITTLE MORE CLARITY</span>
              <h2>
                Good questions.
                <br />
                Simple answers.
              </h2>
            </div>
            <div data-reveal>
              {questions.map(([title, answer]) => (
                <details key={title}>
                  <summary>
                    {title}
                    <ChevronDown size={17} />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </section>
        </main>
        <footer className="blue-footer blue-container">
          <div>
            <Link to="/" aria-label="Sentivoy home">
              <SentivoyLogo />
            </Link>
            <nav aria-label="Footer">
              <a href="#platform">Features</a>
              <a href="#solutions">Solutions</a>
              <a href="#workspace">Workspace</a>
              <Link to="/auth">
                Sign in <ArrowUpRight size={13} />
              </Link>
            </nav>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Sentivoy</span>
            <span>A clearer view of your security.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
