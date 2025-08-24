module.exports = {
  apps: [
    // Next.js server
    {
      name: "web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
      },
    },
    // Cron worker (one instance)
    {
      name: "cron",
      script: "node_modules/ts-node/dist/bin.js",
      args: "scripts/cron-runner.ts",
      env: {
        NODE_ENV: "production",
        // must match your app's env and middleware checks
        CRON_SECRET: "R7qF8kY2pZ9xM4wC1aH0bN5jT3vU6eLd",
        // point to your running Next server (keep 127.0.0.1 for local socket)
        CRON_BASE_URL: "http://127.0.0.1:3000",
        // pick your desired TZ (affects schedule times above)
        CRON_TZ: "UTC", // e.g., "Asia/Kolkata"
      },
    },
  ],
};
