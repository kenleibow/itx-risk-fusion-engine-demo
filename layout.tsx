import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ITX Risk Fusion Engine Demo",
  description: "Executive demo for ITX Risk Fusion Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
