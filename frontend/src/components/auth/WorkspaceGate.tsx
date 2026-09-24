"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/authContext";
import { SentivoyLogo } from "@/components/brand/SentivoyLogo";

export function WorkspaceGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = pathname === "/" || pathname === "/auth";

  useEffect(() => {
    if (!isPublic && !loading && !user) router.replace("/auth");
  }, [isPublic, loading, user, router]);

  if (isPublic) return children;
  if (loading || !user) {
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
  }
  return children;
}
