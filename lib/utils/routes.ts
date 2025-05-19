// utils/routes.ts
import { UserRole } from "@prisma/client";

export const getRoutes = (role: UserRole) => {
  const baseRoutes = {
    RECRUITMENT_ADMIN: [
      { path: "/dashboard/admin", component: "AdminDashboard" },
      { path: "/dashboard/admin/company", component: "Company" },
      { path: "/dashboard/admin/agencies", component: "Agencies" },
      // ... other admin routes
    ],
    CLIENT_ADMIN: [
      { path: "/dashboard/client", component: "ClientDashboard" },
      // ... client routes
    ],
    RECRUITMENT_AGENCY: [
      { path: "/dashboard/agency", component: "AgencyDashboard" },
      // ... agency routes
    ],
  };

  return baseRoutes[role];
};
