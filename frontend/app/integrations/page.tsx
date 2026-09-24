import type { Metadata } from "next";
import Page from "@/routes/integrations";

export const metadata: Metadata = {
  title: "Integrations — Sentivoy",
  description: "Connect SIEM, cloud, and identity sources.",
};

export default function RoutePage() {
  return <Page />;
}
