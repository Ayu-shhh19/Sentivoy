import type { Metadata } from "next";
import Page from "@/routes/live-logs";

export const metadata: Metadata = {
  title: "Live Logs — Sentivoy",
  description: "Stream raw log events in real time with intelligent filters.",
};

export default function RoutePage() {
  return <Page />;
}
