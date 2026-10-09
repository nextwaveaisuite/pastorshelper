import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Pastors Helper — Scripture-Anchored Sermon & Prayer Builder for Pastors",
  description: "Build complete Scripture-anchored sermons and ministry prayers. Three theological levels — Certificate, Diploma and Degree. Available in 36+ languages.",
  keywords: ["sermon builder", "pastor tools", "ministry prayers", "warfare prayer", "theological sermon", "pastor helper"],
  openGraph: {
    title: "The Pastors Helper — Scripture-Anchored Sermon & Prayer Builder",
    description: "Build complete Scripture-anchored sermons and ministry prayers. Three theological levels, 36+ languages.",
    url: "https://thepastorshelper.com",
    siteName: "The Pastors Helper",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
