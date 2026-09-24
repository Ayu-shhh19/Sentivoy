"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { UIRuntime } from "@/components/motion/UIRuntime";
import { WorkspaceGate } from "@/components/auth/WorkspaceGate";
import { AuthProvider } from "@/lib/authContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
          <UIRuntime />
          <WorkspaceGate>{children}</WorkspaceGate>
        </MotionConfig>
      </AuthProvider>
    </QueryClientProvider>
  );
}
