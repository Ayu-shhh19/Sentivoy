import type { Metadata } from "next";
import Page from "@/routes/settings";

export const metadata: Metadata = {
  title: "Settings — Sentivoy",
  description: "Configure detection rules, members, and billing.",
};

export default function RoutePage() {
  return <Page />;
}
