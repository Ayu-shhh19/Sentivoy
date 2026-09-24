import type { Metadata } from "next";
import Page from "@/routes/geo";

export const metadata: Metadata = {
  title: "Geo Intelligence — Sentivoy",
  description: "Geographic threat intelligence and IP reputation feeds.",
};

export default function RoutePage() {
  return <Page />;
}
