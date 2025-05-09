// types/next-auth.d.ts
import { UserRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    name?: string | null;
    email: string;
  }

  interface Session {
    user: User & {
      id: string;
      role: UserRole;
    };
  }

  interface JWT {
    id: string;
    role: UserRole;
  }
}
