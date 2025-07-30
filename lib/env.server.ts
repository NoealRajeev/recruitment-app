if (typeof window !== "undefined") {
  throw new Error("env.server.ts should never be imported in the browser");
}

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

function getOptionalEnv(key: string): string | undefined {
  return process.env[key];
}

export const env = {
  // Required
  DATABASE_URL: getEnv("DATABASE_URL"),
  NEXTAUTH_SECRET: getEnv("NEXTAUTH_SECRET"),
  NEXTAUTH_URL: getEnv("NEXTAUTH_URL"),
  DIRECT_DATABASE_URL: getEnv("DIRECT_DATABASE_URL"),

  // Centralized S3
  AWS_ACCESS_KEY_ID: getEnv("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: getEnv("AWS_SECRET_ACCESS_KEY"),
  AWS_REGION: getEnv("AWS_REGION"),
  S3_BUCKET_NAME: getEnv("S3_BUCKET_NAME"),
  S3_UPLOAD_PREFIX: getEnv("S3_UPLOAD_PREFIX"),

  // Email
  SMTP_HOST: getEnv("SMTP_HOST"),
  SMTP_PORT: getEnv("SMTP_PORT"),
  SMTP_USER: getEnv("SMTP_USER"),
  SMTP_PASS: getEnv("SMTP_PASS"),
  SMTP_FROM: getEnv("SMTP_FROM"),

  // Misc
  CRON_SECRET: getOptionalEnv("CRON_SECRET"),
  RESEND_API_KEY: getOptionalEnv("RESEND_API_KEY"),
  EMAIL_FROM: getOptionalEnv("EMAIL_FROM"),
  SUPPORT_EMAIL: getOptionalEnv("SUPPORT_EMAIL"),

  // Upload restrictions
  UPLOADS_DIR: getOptionalEnv("UPLOADS_DIR"),
  MAX_FILE_SIZE: getOptionalEnv("MAX_FILE_SIZE"),
  ALLOWED_FILE_TYPES: getOptionalEnv("ALLOWED_FILE_TYPES"),

  // Node env flags
  NODE_ENV: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
};
