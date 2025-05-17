// types/next-auth.d.ts
import { UserRole, AccountStatus } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    status: AccountStatus;
    resetRequired?: boolean;
  }

  interface Session {
    user: {
      image: string;
      id: string;
      name: string | null;
      email: string;
      role: UserRole;
      status: AccountStatus;
      resetRequired?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    status: AccountStatus;
    resetRequired?: boolean;
  }
}
