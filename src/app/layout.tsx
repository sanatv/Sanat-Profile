import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sanat Vats | Enterprise Data, AI & Cloud Transformation Leader",
  description:
    "Executive profile portal for enterprise data, AI, cloud, MDM, SAP/S4, FP&A, and governance transformation leadership.",
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
