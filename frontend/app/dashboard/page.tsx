import type { Metadata } from "next";
import Page from "@/routes/dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Sentivoy",
  description: "Monitor security events, anomalies, and active threats in Sentivoy.",
};

export default function RoutePage() {
  return <Page />;
}
