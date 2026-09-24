import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { PageShell } from "./PageShell";

export function PageDataState({
  title,
  error,
  onRetry,
}: {
  title: string;
  error?: Error | null;
  onRetry?: () => void;
}) {
  return (
    <PageShell title={title} description="Your security workspace, at a glance.">
      <div className="surface data-state" role={error ? "alert" : "status"}>
        {error ? (
          <AlertCircle size={24} className="text-critical" />
        ) : (
          <Loader2 size={24} className="animate-spin text-primary" />
        )}
        <h2>{error ? "We couldn't load this view" : "Preparing your workspace"}</h2>
        <p>
          {error
            ? "Check your connection and try again."
            : "Your security data will appear here shortly."}
        </p>
        {error && onRetry && (
          <button className="ui-button" onClick={onRetry}>
            <RefreshCw size={14} />
            Try again
          </button>
        )}
      </div>
    </PageShell>
  );
}
