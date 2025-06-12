// lib/validations/agency.ts
import { z } from "zod";
import { AccountStatus, DeletionType } from "@prisma/client";

export const AgencyRegistrationSchema = z.object({
  agencyName: z.string().min(2).max(255),
  registrationNo: z.string().min(2).max(50).optional(),
  licenseNumber: z.string().min(2).max(50),
  licenseExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  country: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(5).max(20),
  countryCode: z.string().min(2).max(5),
  address: z.string().min(2).max(500),
  city: z.string().min(2).max(100),
  postalCode: z.string().min(2).max(20).optional(),
});

export const AgencyStatusUpdateSchema = z.object({
  status: z.nativeEnum(AccountStatus),
  reason: z.string().optional(),
  deletionType: z.nativeEnum(DeletionType).optional(),
});

export const AgencyDocumentSchema = z.object({
  type: z.string().min(2).max(50),
  url: z.string().url(),
  name: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
});
