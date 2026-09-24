import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "../src/styles.css";

const description =
  "AI-Powered Cybersecurity Command Center — Detect, Predict & Respond to Threats in Real Time";

export const metadata: Metadata = {
  title: {
    default: "Sentivoy",
    template: "%s",
  },
  description,
  authors: [{ name: "Sentivoy" }],
  openGraph: {
    title: "Sentivoy",
    description,
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@Sentivoy",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
