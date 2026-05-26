import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

const localNetworkOrigins = Object.values(networkInterfaces())
  .flat()
  .filter(
    (network): network is NonNullable<typeof network> =>
      network?.family === "IPv4" && !network.internal
  )
  .map((network) => network.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: localNetworkOrigins,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
