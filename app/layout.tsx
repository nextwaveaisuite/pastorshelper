import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://thepastorshelper.com"),
  title: {
    default: "The Pastors Helper — Scripture-Anchored Sermon & Prayer Builder for Pastors",
    template: "%s | The Pastors Helper",
  },
  description:
    "The Pastors Helper builds complete Scripture-anchored sermons and ministry prayers for pastors, evangelists and teachers. Three theological levels — Certificate, Diploma and Degree — with ministry flow, altar calls, warfare prayers and preach mode. Available in 36+ languages.",
  keywords: [
    "sermon builder",
    "sermon generator",
    "pastor tools",
    "sermon writing software",
    "church ministry tools",
    "sermon preparation",
    "sermon builder app",
    "sermon outline generator",
    "pastor sermon helper",
    "sermon series builder",
    "Scripture-based sermons",
    "sermon for beginners",
    "advanced sermon builder",
    "preach mode",
    "altar call generator",
    "ministry tools for pastors",
    "church sermon software",
    "sermon library",
    "sermon PDF export",
    "sermon topics",
    "Bible sermon builder",
    "Spirit-led preaching",
    "evangelistic sermon tool",
    "sermon writing app",
    "free sermon builder",
    "sermon generator for pastors",
    "sermon app for ministers",
    "multilingual sermon builder",
    "ministry prayer builder",
    "spiritual warfare prayer",
    "certificate diploma degree theology",
    "Samoan sermon",
    "Tongan sermon",
    "Fijian sermon",
    "Maori sermon",
    "Spanish sermon builder",
    "French sermon generator",
    "sermon help for new pastors",
    "beginner pastor tools",
    "sermon outline app",
  ],
  authors: [{ name: "The Pastors Helper", url: "https://thepastorshelper.com" }],
  creator: "The Pastors Helper",
  publisher: "The Pastors Helper",
  category: "Religious & Spiritual",
  classification: "Ministry Tools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://thepastorshelper.com",
    siteName: "The Pastors Helper",
    title: "The Pastors Helper — Scripture-Anchored Sermon & Prayer Builder for Pastors",
    description:
      "Build complete Scripture-anchored sermons and ministry prayers. Three theological levels, 36+ languages, ministry flow, warfare prayers, altar calls and preach mode. Built for pastors, evangelists and teachers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Pastors Helper — Scripture-Anchored Sermon & Prayer Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Pastors Helper — Sermon & Prayer Builder for Pastors",
    description:
      "Scripture-anchored sermons and ministry prayers for pastors, evangelists and teachers. Three theological levels, 36+ languages, warfare prayers and preach mode.",
    images: ["/og-image.png"],
    creator: "@thepastorshelper",
  },
  alternates: {
    canonical: "https://thepastorshelper.com",
  },
  verification: {
    google: "add-your-google-search-console-verification-code-here",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0f0a05" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Pastors Helper" />
      </head>
      <body>{children}</body>
    </html>
  );
}
