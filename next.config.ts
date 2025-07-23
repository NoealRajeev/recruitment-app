/** @type {import('next').NextConfig} */
import path from "path";
const nextConfig = {
  images: {
    domains: [
      "cdn.jsdelivr.net", // For faker-js images
      "localhost", // For local development
      // Add your production domain when deployed
    ],
  },
  output: "standalone",
  // Enable static file serving from public folder
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/pdf",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  webpack(config) {
    // 1) ensure we don't wipe out Next's built-in aliases:
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      // 2) add @ → project root:
      "@": path.resolve(__dirname),
    };

    // 3) push your PDF asset loader:
    config.module.rules.push({
      test: /\.(pdf)$/i,
      type: "asset/resource",
      generator: { filename: "static/[hash][ext][query]" },
    });

    return config;
  },
};

module.exports = nextConfig;
