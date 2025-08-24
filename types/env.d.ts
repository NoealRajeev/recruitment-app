// types/env.d.ts
namespace NodeJS {
  interface ProcessEnv {
    // Required
    DATABASE_URL: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    NEXT_PUBLIC_BASE_URL: string;

    // Optional
    CRON_SECRET?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_SERVICE?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_FROM?: string;
    NEXT_PUBLIC_LOGO_URL?: string;
    NEXT_PUBLIC_APP_URL?: string;

    // Node
    NODE_ENV: "development" | "production";
  }
}
