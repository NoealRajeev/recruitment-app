// lib/env.ts
function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

function getOptionalEnv(key: string): string | undefined {
  return process.env[key];
}

export const env = {
  // Required variables
  DATABASE_URL: getEnv("DATABASE_URL"),
  NEXTAUTH_SECRET: getEnv("NEXTAUTH_SECRET"),
  NEXTAUTH_URL: getEnv("NEXTAUTH_URL"),
  NEXT_PUBLIC_BASE_URL: getEnv("NEXT_PUBLIC_BASE_URL"),

  // Optional variables
  CRON_SECRET: getOptionalEnv("CRON_SECRET"),
  SMTP_USER: getOptionalEnv("SMTP_USER"),
  SMTP_PASS: getOptionalEnv("SMTP_PASS"),
  SMTP_SERVICE: getOptionalEnv("SMTP_SERVICE"),
  SMTP_HOST: getOptionalEnv("SMTP_HOST"),
  SMTP_PORT: getOptionalEnv("SMTP_PORT"),
  SMTP_FROM: getOptionalEnv("SMTP_FROM"),
  NEXT_PUBLIC_WEBSOCKET_URL: getOptionalEnv("NEXT_PUBLIC_WEBSOCKET_URL"),
  NEXT_PUBLIC_LOGO_URL: getOptionalEnv("NEXT_PUBLIC_LOGO_URL"),
  NEXT_PUBLIC_APP_URL: getOptionalEnv("NEXT_PUBLIC_APP_URL"),

  // Node environment
  NODE_ENV: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
};
