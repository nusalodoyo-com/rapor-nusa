import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PORTAL RAPOR INTERNAL NUSALODOYO - MTs & MA",
  description: "Portal Rapor Internal Nusa Lodoyo Terintegrasi KMA 1503 Tahun 2025 • MTs Ma'arif NU 2 Sutojayan & MA Ma'arif Nurus Salam",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
