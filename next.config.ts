/** @type {import('next').NextConfig} */
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
  webpack: (config, { isServer }) => {
    // 1) tell webpack that "@" = the project root
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname),
    };

    // 2) your existing PDF‐loader rule
    config.module.rules.push({
      test: /\.(pdf)$/i,
      type: "asset/resource",
      generator: { filename: "static/[hash][ext][query]" },
    });

    return config;
  },
  // Add experimental features for better external access support
  experimental: {
    trustHostHeader: true,
  },
};

module.exports = nextConfig;
