// utils/routes.ts
import { UserRole } from "@prisma/client";

export const getRoutes = (role: UserRole) => {
  const baseRoutes = {
    RECRUITMENT_ADMIN: [
      { path: "/dashboard/admin", component: "AdminDashboard" },
      { path: "/dashboard/admin/company", component: "Company" },
      { path: "/dashboard/admin/agencies", component: "Agencies" },
      { path: "/dashboard/admin/requirements", component: "Requirements" },
      { path: "/dashboard/admin/labour", component: "Labour" },
      { path: "/dashboard/admin/recruitment", component: "Recruitment" },
      { path: "/dashboard/admin/audit", component: "Audit" },
      { path: "/dashboard/admin/settings", component: "Settings" },
      { path: "/dashboard/admin/profile", component: "Profile" },
      // ... other admin routes
    ],
    CLIENT_ADMIN: [
      { path: "/dashboard/client", component: "ClientDashboard" },
      { path: "/dashboard/client/labour", component: "Labour" },
      { path: "/dashboard/client/requirements", component: "Requirements" },
      { path: "/dashboard/client/trackers", component: "Trackers" },
      { path: "/dashboard/client/settings", component: "Settings" },
      { path: "/dashboard/client/profile", component: "Profile" },
      // ... client routes
    ],
    RECRUITMENT_AGENCY: [
      { path: "/dashboard/agency", component: "AgencyDashboard" },
      { path: "/dashboard/agency/candidates", component: "Candidates" },
      { path: "/dashboard/agency/recruitment", component: "Recruitment" },
      { path: "/dashboard/agency/requirements", component: "Requirements" },
      { path: "/dashboard/agency/settings", component: "Settings" },
      { path: "/dashboard/agency/profile", component: "Profile" },
      // ... agency routes
    ],
  };

  return baseRoutes[role];
};
