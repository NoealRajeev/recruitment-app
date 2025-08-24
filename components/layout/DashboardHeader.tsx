// components/layout/DashboardHeader.tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import { signOut } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Search, Settings, User } from "lucide-react";
import NotificationBell from "../ui/NotificationBell";
import MobileSidebar from "./MobileSidebar";

interface DashboardHeaderProps {
  role: UserRole;
  avatarUrl: string;
  userName: string;
}

function getRoleBasePath(role: UserRole) {
  switch (role) {
    case "RECRUITMENT_ADMIN":
      return "/dashboard/admin";
    case "CLIENT_ADMIN":
      return "/dashboard/client";
    case "RECRUITMENT_AGENCY":
      return "/dashboard/agency";
    default:
      return "/dashboard"; // fallback
  }
}

export default function DashboardHeader({
  role,
  avatarUrl,
  userName,
}: DashboardHeaderProps) {
  const rawPath = usePathname();
  const pathname = rawPath ?? "";
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getPageTitle = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    if (pathSegments.length === 2) return "Dashboard";
    const currentPath = pathSegments[2];
    const pageTitles: Record<string, string> = {
      company: "Client",
      agencies: "Agencies",
      requirements: "Requirements",
      labour: "Labour Profiles",
      recruitment: "Recruitment Tracker",
      audit: "Audit Logs",
      documents: "Documents",
      profile: "Profile",
      settings: "Settings",
    };
    return (
      pageTitles[currentPath] ||
      (currentPath
        ? currentPath[0].toUpperCase() + currentPath.slice(1)
        : "Dashboard")
    );
  };

  const toggleDropdown = () => setIsDropdownOpen((o) => !o);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const base = getRoleBasePath(role);

  return (
    <header className="bg-transparent py-4">
      <div className="px-5">
        <div className="flex items-center justify-between">
          {/* LEFT: mobile menu button + title */}
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <MobileSidebar role={role} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0B0016]">
              {getPageTitle()}
            </h1>
          </div>

          {/* RIGHT: search + notifications + profile */}
          <div className="flex items-center gap-4">
            {/* Search Bar (hidden on small) */}
            <div className="hidden md:block">
              <div className="relative w-[800px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Search className="text-gray-400 h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search for anything..."
                  className="w-full py-2 pl-10 pr-4 bg-[#0B0016] rounded-full text-gray-400 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Search icon (mobile) */}
            <button className="md:hidden w-9 h-9 rounded-full bg-[#0B0016] flex items-center justify-center">
              <Search className="text-white h-5 w-5" />
            </button>

            <NotificationBell />

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="h-14 px-4 py-2 bg-[#0B0016] rounded-3xl shadow-sm flex items-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                  {avatarUrl ? (
                    <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-purple-100">
                      <img
                        src={avatarUrl}
                        alt="User profile"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-700 font-medium">
                        {userName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {role.toLowerCase().replace(/_/g, " ")}
                  </p>
                </div>
                <ChevronDown className="hidden md:inline text-white h-4 w-4" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`${base}/profile`);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`${base}/settings`);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
