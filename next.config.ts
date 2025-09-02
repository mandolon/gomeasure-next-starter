import type { NextConfig } from "next";
import { env } from "process";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    env.REPLIT_DOMAINS?.split(",")[0] || "127.0.0.1",
    "127.0.0.1",
    "localhost",
    env.REPLIT_DEV_DOMAIN || ""
  ].filter(Boolean),
};

export default nextConfig;
