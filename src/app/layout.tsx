import type { Metadata } from "next";
import { MarketProvider } from "@/components/market-provider";
import { SiteHeader, SiteFooter } from "@/components/shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Surkhet Market — A little closer to home", template: "%s | Surkhet Market" },
  description: "Explore the design preview for a local marketplace in Birendranagar, Surkhet.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><MarketProvider><a className="skip-link" href="#main">Skip to content</a><SiteHeader />{children}<SiteFooter /></MarketProvider></body></html>;
}
