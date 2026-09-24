import type { Metadata } from "next";
import Page from "@/routes/auth";

export const metadata: Metadata = {
  title: "Authentication — Sentivoy",
  description: "Login or Sign Up to Sentivoy.",
};

export default function RoutePage() {
  return <Page />;
}
