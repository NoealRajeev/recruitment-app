// types/user.d.ts
import { UserRole, Permission } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
  company: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Export the Prisma types you need
export { UserRole, Permission };
