import type { Metadata } from "next";
import Page from "@/routes/alerts";

export const metadata: Metadata = {
  title: "Alerts — Sentivoy",
  description: "Triage, assign, and resolve security alerts.",
};

export default function RoutePage() {
  return <Page />;
}
