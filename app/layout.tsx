import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Addistream | Music Distribution & Creator Upload Platform",
    template: "%s | Addistream",
  },
  description:
    "Addistream gives music creators a private audio workspace for release details, uploads, and admin moderation.",
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
      "A private audio workspace for creators to submit releases and manage moderation.",
    siteName: "Addistream",
    url: appUrl,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Addistream",
    description:
      "Upload private audio, manage release details, and review submissions in Addistream.",
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
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
