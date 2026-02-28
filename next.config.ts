import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@whiskeysockets/baileys", "pino", "@hapi/boom"],
};

export default nextConfig;
