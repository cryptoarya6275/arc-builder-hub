// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/lib/Web3Provider";

export const metadata: Metadata = {
  title: "Arc Builder Hub — Testnet Toolkit",
  description:
    "A simple, powerful toolkit for builders on the Arc Layer 1 testnet. Deploy tokens, interact with contracts, and explore the Arc ecosystem.",
  keywords: ["Arc", "blockchain", "testnet", "ERC20", "Web3", "builder", "toolkit"],
  openGraph: {
    title: "Arc Builder Hub",
    description: "Testnet toolkit for Arc L1 builders",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="noise min-h-screen">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
