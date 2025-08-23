/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";
import Image from "next/image";
import {
  Home,
  Building2,
  Users,
  Settings,
  FileText,
  BarChart2,
  HelpCircle,
  UserPlus,
  ClipboardList,
  User,
  MapPin,
} from "lucide-react";

const navItems: Record<
  UserRole,
  { href: string; label: string; icon: any; exact?: boolean }[]
> = {
  RECRUITMENT_ADMIN: [
    { href: "/dashboard/admin", label: "Dashboard", icon: Home, exact: true },
    { href: "/dashboard/admin/company", label: "Client", icon: Building2 },
    { href: "/dashboard/admin/agencies", label: "Agencies", icon: UserPlus },
    {
      href: "/dashboard/admin/requirements",
      label: "Requirements",
      icon: ClipboardList,
    },
    { href: "/dashboard/admin/labour", label: "Labour Profiles", icon: User },
    {
      href: "/dashboard/admin/recruitment",
      label: "Recruitment Tracker",
      icon: MapPin,
    },
  ],
  CLIENT_ADMIN: [
    { href: "/dashboard/client", label: "Dashboard", icon: Home, exact: true },
    {
      href: "/dashboard/client/requirements",
      label: "My Requirements",
      icon: FileText,
    },
    { href: "/dashboard/client/labour", label: "Labour Profiles", icon: User },
    {
      href: "/dashboard/client/trackers",
      label: "Recruitment Trackers",
      icon: BarChart2,
    },
    { href: "/dashboard/client/settings", label: "Settings", icon: Settings },
  ],
  RECRUITMENT_AGENCY: [
    { href: "/dashboard/agency", label: "Dashboard", icon: Home, exact: true },
    {
      href: "/dashboard/agency/requirements",
      label: "Assigned Requirements",
      icon: FileText,
    },
    {
      href: "/dashboard/agency/candidates",
      label: "Candidate Pool",
      icon: Users,
    },
    {
      href: "/dashboard/agency/recruitment",
      label: "Recruitment Tracker",
      icon: MapPin,
    },
    { href: "/dashboard/agency/settings", label: "Settings", icon: Settings },
  ],
};

export default function SideBar({
  role,
  isExpanded,
}: {
  role: UserRole;
  isExpanded: boolean;
}) {
  const pathname = usePathname() ?? "";
  const items = navItems[role];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div
      className={`h-full transition-all duration-300 ${
        isExpanded ? "w-[300px]" : "w-20"
      } bg-[#0B0016] p-5 flex flex-col`}
    >
      {/* Header */}
      {isExpanded && (
        <div className="flex justify-center mb-16">
          <div className="relative h-15 w-[480px]">
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
      <div className={`flex-1 ${isExpanded ? "" : "mt-30"}`}>
        {items.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center my-2 px-4 py-3 rounded-3xl transition-all ${
                active
                  ? "bg-white text-primary shadow-md"
                  : "text-white hover:bg-gray-800"
              }`}
            >
              <span
                className={`flex items-center justify-center ${
                  isExpanded
                    ? "mr-5"
                    : "mx-auto w-11 h-11 rounded-full bg-white"
                }`}
              >
                <IconComponent
                  size={20}
                  className={`${
                    isExpanded
                      ? active
                        ? "text-primary"
                        : "text-white"
                      : "text-[#0B0016]"
                  }`}
                />
              </span>
              {isExpanded && (
                <span className={`${active ? "font-bold" : ""}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      {isExpanded && (
        <div className="mt-auto p-4">
          <button
            className="w-11 h-11 rounded-full bg-[#BA3B0A] flex items-center justify-center"
            onClick={() => console.log("Help clicked")}
          >
            <HelpCircle className="text-white" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
