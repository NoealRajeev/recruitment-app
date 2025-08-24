// next.config.ts
import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.jsdelivr.net", "localhost", "findly.breaktroughf1.com"],
  },
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  output: "standalone",

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Content-Type", value: "application/pdf" },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  webpack(config) {
    // 1️⃣ Preserve Next.js’s built-in aliases
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      // 2️⃣ Add your “@ → project root” mapping
      "@": path.resolve(__dirname),
    };

    // 3️⃣ Emit PDF imports as static assets
    config.module = config.module || {};
    config.module.rules = config.module.rules ?? [];
    config.module.rules.push({
      test: /\.pdf$/i,
      type: "asset/resource",
      generator: { filename: "static/[hash][ext][query]" },
    });

    return config;
  },
};

export default nextConfig;
