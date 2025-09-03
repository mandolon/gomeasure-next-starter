import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoMeasure Order",
  description: "Complete your capture service order",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&display=swap"
          rel="stylesheet"
        />

        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css"
        />
      </head>
      <body>
        {children}

        {/* Load scripts with Next.js Script component for better performance */}
        <Script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"
          strategy="lazyOnload"
        />
        <Script src="https://unpkg.com/esri-leaflet" strategy="lazyOnload" />
      </body>
    </html>
  );
}
