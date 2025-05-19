// types/session.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      status: string;
      resetRequired: boolean;
      exp?: number;
    };
  }
}
