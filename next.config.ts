import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ]
      }
    ];
  },
  experimental: {
    allowedRevalidateHeaderKeys: []
  },
  // Configure allowed dev origins for Replit environment
  allowedDevOrigins: ['127.0.0.1', 'localhost', '*.replit.dev', '*.repl.co']
};

export default nextConfig;
