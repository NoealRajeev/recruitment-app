// lib/auth/permissions.ts
import type { UserRole, Permission } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function checkPermissions(
  userRole: UserRole,
  requiredPermissions: Permission[],
  options?: { userId?: string }
): Promise<boolean> {
  const results = await Promise.all(
    requiredPermissions.map((permission) =>
      hasPermission(userRole, permission, options)
    )
  );
  return results.every(Boolean);
}

async function hasPermission(
  userRole: UserRole,
  permission: Permission,
  options?: { userId?: string }
): Promise<boolean> {
  try {
    // Check if the role has this permission by default
    const rolePermission = await prisma.rolePermission.findUnique({
      where: {
        role_permission: {
          role: userRole,
          permission: permission,
        },
      },
    });

    if (rolePermission) return true;

    // Check for user-specific permissions if userId is provided
    if (options?.userId) {
      const userPermission = await prisma.rolePermission.findFirst({
        where: {
          permission: permission,
          userId: options.userId,
        },
      });

      if (userPermission) return true;
    }

    return false;
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
}
