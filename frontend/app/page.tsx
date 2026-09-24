import type { Metadata } from "next";
import Page from "@/routes/index";

export const metadata: Metadata = {
  title: "Sentivoy — A world of signals. One clear view.",
  description: "Explore your security landscape with Sentivoy. Logs, anomaly detection, and investigations in one connected workspace.",
};

export default function RoutePage() {
  return <Page />;
}
