"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";
import Image from "next/image";

const navItems = {
  RECRUITMENT_ADMIN: [
    { href: "/dashboard/admin", label: "Dashboard", icon: "🏠", exact: true },
    {
      href: "/dashboard/admin/company",
      label: "Company",
      icon: "📋",
      exact: false,
    },
    {
      href: "/dashboard/admin/agencies",
      label: "Agencies",
      icon: "🏢",
      exact: false,
    },
    {
      href: "/dashboard/admin/candidates",
      label: "Candidates",
      icon: "👥",
      exact: false,
    },
    {
      href: "/dashboard/admin/users",
      label: "Users",
      icon: "👤",
      exact: false,
    },
    {
      href: "/dashboard/admin/settings",
      label: "Settings",
      icon: "⚙️",
      exact: false,
    },
  ],
  CLIENT_ADMIN: [
    {
      href: "/dashboard/client/requirements",
      label: "My Requirements",
      icon: "📋",
      exact: false,
    },
    {
      href: "/dashboard/client/trackers",
      label: "Recruitment Trackers",
      icon: "📊",
      exact: false,
    },
    {
      href: "/dashboard/client/documents",
      label: "Documents",
      icon: "📄",
      exact: false,
    },
    {
      href: "/dashboard/client/settings",
      label: "Settings",
      icon: "⚙️",
      exact: false,
    },
  ],
  RECRUITMENT_AGENCY: [
    {
      href: "/dashboard/agency/requirements",
      label: "Assigned Requirements",
      icon: "📋",
      exact: false,
    },
    {
      href: "/dashboard/agency/candidates",
      label: "Candidate Pool",
      icon: "👥",
      exact: false,
    },
    {
      href: "/dashboard/agency/documents",
      label: "My Documents",
      icon: "📄",
      exact: false,
    },
    {
      href: "/dashboard/agency/settings",
      label: "Settings",
      icon: "⚙️",
      exact: false,
    },
  ],
};

export default function SideBar({
  role,
  isExpanded,
}: {
  role: UserRole;
  isExpanded: boolean;
}) {
  const pathname = usePathname();
  const items = navItems[role];

  const isActive = (href: string, exact: boolean) => {
    return exact ? pathname === href : pathname.startsWith(href);
  };

  return (
    <div
      className={`h-full transition-all duration-300 ${
        isExpanded ? "w-[300px]" : "w-20"
      } bg-[#0B0016] p-5 flex flex-col`}
    >
      {/* Header */}
      {isExpanded && (
        <div className="flex justify-center mb-16">
          <div className="relative h-15 w-[180px]">
            {/* Replace with your actual logo */}
            <Image
              src="/assets/Logo-white.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="flex-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center my-2 px-4 py-3 rounded-3xl transition-all ${
              isActive(item.href, item.exact ?? false)
                ? "bg-white text-primary shadow-md"
                : "text-white hover:bg-gray-800"
            }`}
          >
            <span className={`${isExpanded ? "mr-5" : "mx-auto"}`}>
              {item.icon}
            </span>
            {isExpanded && (
              <span
                className={`${
                  pathname.startsWith(item.href) ? "font-bold" : ""
                }`}
              >
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Footer */}
      {isExpanded && (
        <div className="mt-auto p-4">
          <button
            className="w-11 h-11 rounded-full bg-[#BA3B0A] flex items-center justify-center"
            onClick={() => console.log("Help clicked")}
          >
            <span className="text-white">?</span>
          </button>
        </div>
      )}
    </div>
  );
}
