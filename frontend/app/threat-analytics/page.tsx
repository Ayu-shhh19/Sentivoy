import type { Metadata } from "next";
import Page from "@/routes/threat-analytics";

export const metadata: Metadata = {
  title: "Threat Analytics — Sentivoy",
  description: "Deep-dive analytics on detected threats and anomaly patterns.",
};

export default function RoutePage() {
  return <Page />;
}
