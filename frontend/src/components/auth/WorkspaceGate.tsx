import { Navigate, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/authContext";
import { SentivoyLogo } from "@/components/brand/SentivoyLogo";

export function WorkspaceGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = useLocation({ select: (location) => location.pathname });
  if (pathname === "/" || pathname === "/auth") return children;
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-5">
          <SentivoyLogo />
          <p className="text-xs text-muted-foreground" role="status">
            Opening your workspace...
          </p>
        </div>
      </div>
    );
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}
