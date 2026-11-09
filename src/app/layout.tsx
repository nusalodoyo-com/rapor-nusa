import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#006e14",
};

export const metadata: Metadata = {
  title: "PORTAL RAPOR INTERNAL NUSALODOYO - MTs & MA",
  description: "Portal Rapor Internal Nusa Lodoyo Terintegrasi KMA 1503 Tahun 2025 • MTs Ma'arif NU 2 Sutojayan & MA Ma'arif Nurus Salam",
  applicationName: "Portal Rapor Nusalodoyo",
  authors: [{ name: "LP Ma'arif NU Sutojayan Blitar" }],
  generator: "Next.js 14",
  keywords: ["rapor madrasah", "kurikulum merdeka", "kma 1503", "mts maarif nu 2 sutojayan", "ma maarif nurus salam", "rdm kemenag"],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
