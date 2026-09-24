"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { useAuth } from "@/lib/authContext";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // If the user is already logged in, send them to the dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  return <AuthPanel />;
}
