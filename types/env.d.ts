// types/env.d.ts
namespace NodeJS {
  interface ProcessEnv {
    // Required
    DATABASE_URL: string;
    DIRECT_DATABASE_URL: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    NEXT_PUBLIC_BASE_URL: string;

    // Centralized S3
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;
    S3_BUCKET_NAME: string;
    S3_UPLOAD_PREFIX: string;

    // Optional
    CRON_SECRET?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_SERVICE?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_FROM?: string;
    NEXT_PUBLIC_WEBSOCKET_URL?: string;
    NEXT_PUBLIC_LOGO_URL?: string;
    NEXT_PUBLIC_APP_URL?: string;

    // Node
    NODE_ENV: "development" | "production";
  }
}
