import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Addistream | Music Distribution & Creator Upload Platform",
    template: "%s | Addistream",
  },
  description:
    "Addistream helps creators upload tracks, manage mastering previews, approve submissions, and distribute music to modern streaming audiences.",
  keywords: [
    "Addistream",
    "music distribution",
    "creator uploads",
    "audio mastering",
    "artist dashboard",
    "music approval workflow",
    "streaming platform",
  ],
  applicationName: "Addistream",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Addistream",
    description:
      "Upload music, preview mastering, manage approvals, and grow a creator-first distribution platform.",
    siteName: "Addistream",
    url: appUrl,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Addistream",
    description:
      "Upload music, manage approvals, and distribute creator content through a polished music platform dashboard.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-white">{children}</body>
    </html>
  );
}
