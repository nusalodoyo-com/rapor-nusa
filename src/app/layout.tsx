import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rapor Nusa - MA Ma'arif Nurus Salam",
  description: "Aplikasi Rapor Madrasah MA Ma'arif Nurus Salam Kedungbunder Sutojayan Blitar",
  icons: {
    icon: "/favicon.ico",
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
      </head>
      <body>{children}</body>
    </html>
  );
}
