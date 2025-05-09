// types/agency.d.ts
import { User } from "./user";

export interface Agency {
  id: string;
  name: string;
  contact: string;
  email: string;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}
