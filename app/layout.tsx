import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "The Pastors Helper — Spirit-Led Sermon Builder",
  description:
    "Build powerful, Scripture-anchored sermons with the help of AI. Structured for teaching, prophetic, and evangelistic ministry.",
  keywords: "sermon builder, AI sermon, pastor tools, church ministry, sermon generator",
  openGraph: {
    title: "The Pastors Helper",
    description: "Spirit-Led Sermon Builder for Pastors & Ministers",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
