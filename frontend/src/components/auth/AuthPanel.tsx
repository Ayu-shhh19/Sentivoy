import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
  Github,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/lib/supabase";
import { SentivoyLogo } from "@/components/brand/SentivoyLogo";
import { usePageReveal } from "@/hooks/usePageReveal";

export function AuthPanel() {
  const { loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState<"email" | "google" | "github" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const ref = usePageReveal<HTMLDivElement>("authentication");
  const isLogin = mode === "login";
  const changeMode = (next: typeof mode) => {
    setMode(next);
    setError("");
    setMessage("");
  };

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending("email");
    setError("");
    setMessage("");
    try {
      const result = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: name },
              emailRedirectTo: `${window.location.origin}/dashboard`,
            },
          });
      if (result.error) throw result.error;
      if (!isLogin && !result.data.session)
        setMessage("Your account is almost ready. Check your email for a confirmation link.");
    } catch (issue) {
      setError(
        issue instanceof Error ? issue.message : "We couldn't sign you in. Please try again.",
      );
    } finally {
      setPending(null);
    }
  };
  const handleOAuth = async (provider: "google" | "github") => {
    setPending(provider);
    setError("");
    setMessage("");
    try {
      const result = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (result.error) throw result.error;
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : "We couldn't connect to your provider. Please try again.",
      );
      setPending(null);
    }
  };

  return (
    <div className="auth-page" ref={ref}>
      <aside className="auth-story">
        <Link href="/" aria-label="Sentivoy home">
          <SentivoyLogo inverse />
        </Link>
        <div className="auth-story-copy" data-reveal>
          <span className="section-kicker">Your signal. Your perspective.</span>
          <h2>
            Good security
            <br />
            starts with
            <br />
            <em>a clearer view.</em>
          </h2>
          <p>
            A quiet space for the important things. Bring your signals together and find your next
            move.
          </p>
        </div>
        <div className="auth-visual" data-reveal aria-label="Platform capabilities">
          <div className="auth-visual-head">
            Everything, in perspective.
            <span>
              <ShieldCheck size={12} />
              Sentivoy
            </span>
          </div>
          {[
            {
              icon: Activity,
              title: "Events in context",
              sub: "A connected view of your environment",
              tag: "Monitor",
            },
            {
              icon: Fingerprint,
              title: "Patterns that matter",
              sub: "Anomalies with the details you need",
              tag: "Detect",
            },
            {
              icon: ShieldCheck,
              title: "Clarity for your next step",
              sub: "Investigate and share your findings",
              tag: "Respond",
            },
          ].map(({ icon: Icon, title, sub, tag }) => (
            <div className="auth-signal" key={title}>
              <Icon size={18} strokeWidth={1.4} />
              <div>
                <strong>{title}</strong>
                <small>{sub}</small>
              </div>
              <span>{tag}</span>
            </div>
          ))}
        </div>
        <div className="auth-story-footer">
          <LockKeyhole size={12} />
          One workspace. A more complete picture.
        </div>
      </aside>
      <main className="auth-form-side">
        <Link href="/" className="auth-back">
          <ArrowLeft size={12} />
          Back to website
        </Link>
        <div className="auth-form-wrap" data-reveal>
          <div className="auth-mobile-brand">
            <SentivoyLogo />
          </div>
          <h1>{isLogin ? "Welcome back." : "A fresh perspective."}</h1>
          <p className="auth-subtitle">
            {isLogin
              ? "Sign in to pick up where you left off."
              : "Create your account and bring your security into focus."}
          </p>
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              role="tab"
              aria-selected={isLogin}
              disabled={!!pending || authLoading}
              onClick={() => changeMode("login")}
            >
              Sign in
            </button>
            <button
              role="tab"
              aria-selected={!isLogin}
              disabled={!!pending || authLoading}
              onClick={() => changeMode("signup")}
            >
              Create account
            </button>
          </div>
          {error && (
            <div className="auth-message error" role="alert">
              {error}
            </div>
          )}
          {message && (
            <div className="auth-message success" role="status">
              {message}
            </div>
          )}
          <div className="auth-social">
            <button
              className="ui-button"
              onClick={() => handleOAuth("google")}
              disabled={!!pending || authLoading}
            >
              {pending === "google" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.98-4.3 2.98-7.36Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.23-2.51c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.12H3.05v2.59A10 10 0 0 0 12 22Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.49H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.51l3.34-2.59Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.34 2.59A5.99 5.99 0 0 1 12 5.96Z"
                  />
                </svg>
              )}
              Google
            </button>
            <button
              className="ui-button"
              onClick={() => handleOAuth("github")}
              disabled={!!pending || authLoading}
            >
              {pending === "github" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Github size={15} />
              )}
              GitHub
            </button>
          </div>
          <div className="auth-divider">or continue with email</div>
          <form onSubmit={handleEmailAuth}>
            <fieldset className="auth-fields" disabled={!!pending || authLoading}>
              {!isLogin && (
                <div className="auth-field">
                  <label htmlFor="auth-name">Full name</label>
                  <input
                    id="auth-name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
              )}
              <div className="auth-field">
                <label htmlFor="auth-email">Email address</label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div className="auth-field">
                <label htmlFor="auth-password">Password</label>
                <div className="auth-password">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                    required
                    minLength={isLogin ? undefined : 8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {!isLogin && <p className="auth-hint">Use at least 8 characters.</p>}
              </div>
              <button type="submit" className="ui-button ui-button-primary auth-submit">
                {pending === "email" ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign in to Sentivoy" : "Create your account"}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </fieldset>
          </form>
          <div className="auth-switch">
            {isLogin ? "New to Sentivoy?" : "Already have an account?"}
            <button
              disabled={!!pending || authLoading}
              onClick={() => changeMode(isLogin ? "signup" : "login")}
            >
              {isLogin ? "Create an account" : "Sign in"}
            </button>
          </div>
          <p className="auth-secure">
            <Check size={11} />
            Your workspace. Your perspective.
          </p>
        </div>
        <div className="auth-form-footer">© {new Date().getFullYear()} Sentivoy</div>
      </main>
    </div>
  );
}
