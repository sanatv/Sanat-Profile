import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sanat Vats | AI Enablement Engineering Director",
  description:
    "Executive profile portal for AI enablement, agentic AI, AI-native workflows, developer productivity, trusted data foundations, and cross-organizational transformation leadership.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
