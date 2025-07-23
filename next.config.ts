// next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.jsdelivr.net", "localhost", "findly.breaktroughf1.com"],
  },

  output: "standalone",

  // serve PDFs from /uploads with correct headers
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
    // 1️⃣ Pull in _all_ of Next’s default aliases (including its TS path-map)
    config.resolve.alias = {
      ...(config.resolve.alias || {}),

      // 2️⃣ Then add your own “@ → project root” mapping:
      "@": path.resolve(__dirname),
    };

    // 3️⃣ Finally, your PDF loader
    config.module.rules.push({
      test: /\.pdf$/i,
      type: "asset/resource",
      generator: { filename: "static/[hash][ext][query]" },
    });

    return config;
  },
};

module.exports = nextConfig;
