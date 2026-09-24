import type { Metadata } from "next";
import Page from "@/routes/incident-response";

export const metadata: Metadata = {
  title: "Incident Response — Sentivoy",
  description: "Coordinate incident response with playbooks and timelines.",
};

export default function RoutePage() {
  return <Page />;
}
