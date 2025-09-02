
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoMeasure Order",
  description: "Complete your capture service order",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
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
        
        {/* External scripts */}
        <script 
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          defer
        />
        <script 
          src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"
          defer
        />
        <script 
          src="https://unpkg.com/esri-leaflet"
          defer
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
