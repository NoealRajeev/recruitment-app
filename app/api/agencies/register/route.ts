// app/api/agencies/register/route.ts
import { NextResponse } from "next/server";
import {
  withAdminAuth,
  withValidation,
  handleApiErrors,
} from "@/lib/api/middleware";
import { AgencyRegistrationSchema } from "@/lib/validations/agency";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { UserRole, AccountStatus } from "@prisma/client";
import { ApiError, UnauthorizedError } from "@/lib/errors";
import { faker } from "@faker-js/faker";

export const POST = handleApiErrors(
  withAdminAuth(
    withValidation(AgencyRegistrationSchema, async (req) => {
      const { data, user } = req;

      if (!user?.id) {
        throw new UnauthorizedError();
      }

      // Check if email is already in use
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ApiError("Email already in use", 409, "EMAIL_EXISTS");
      }

      const randomPassword = randomBytes(12).toString("hex");
      const hashedPassword = await hash(randomPassword, 12);

      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: data.agencyName,
            email: data.email,
            password: hashedPassword,
            phone: data.phone,
            profilePicture: faker.image.avatar(),
            role: UserRole.RECRUITMENT_AGENCY,
            status: AccountStatus.PENDING_SUBMISSION,
            resetRequired: true,
            createdById: user.id,
          },
        });

        const agency = await tx.agency.create({
          data: {
            userId: newUser.id,
            agencyName: data.agencyName,
            registrationNo: data.registrationNo,
            licenseNumber: data.licenseNumber,
            licenseExpiry: new Date(data.licenseExpiry),
            country: data.country,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            website: data.website,
          },
        });

        await tx.auditLog.create({
          data: {
            action: "AGENCY_CREATED",
            entityType: "AGENCY",
            entityId: agency.id,
            performedById: user.id,
            description: `Agency ${data.agencyName} registered by admin`,
            newData: {
              agencyName: data.agencyName,
              email: data.email,
              status: "NOT_VERIFIED",
            },
          },
        });

        return { ...agency, user: newUser };
      });

      console.log("Generated temp password: ", randomPassword);

      return NextResponse.json(result, { status: 201 });
    })
  )
);
