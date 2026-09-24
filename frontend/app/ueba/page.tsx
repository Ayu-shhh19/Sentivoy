import type { Metadata } from "next";
import Page from "@/routes/ueba";

export const metadata: Metadata = {
  title: "User Behavior (UEBA) — Sentivoy",
  description: "User & Entity Behavior Analytics powered by ML baselines.",
};

export default function RoutePage() {
  return <Page />;
}
