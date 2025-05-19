"use client";

import { signOut } from "next-auth/react";
import { UserRole } from "@prisma/client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react";

export default function DashboardHeader({
  role,
  avatarUrl,
  userName,
}: {
  role: UserRole;
  avatarUrl: string;
  userName: string;
}) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Map paths to their display names
  const getPageTitle = () => {
    const pathSegments = pathname.split("/").filter((segment) => segment); // Remove empty segments

    // If we're at the base dashboard path (e.g., /dashboard/admin)
    if (pathSegments.length === 2) {
      return "Dashboard";
    }

    const currentPath = pathSegments[2]; // Get the section after /dashboard/[role]

    const pageTitles: Record<string, string> = {
      company: "Company",
      agencies: "Agencies",
      candidates: "Candidates",
      users: "Users",
      settings: "Settings",
      trackers: "Recruitment Trackers",
      documents: "Documents",
      // Add more mappings as needed
    };

    // Default to capitalized path if no mapping exists
    return (
      pageTitles[currentPath] ||
      currentPath.charAt(0).toUpperCase() + currentPath.slice(1)
    );
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

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

  return (
    <header className="bg-transparent py-4">
      <div className="px-5">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <h1 className="text-3xl font-bold text-[#0B0016]">
            {getPageTitle()}
          </h1>

          {/* Search and Profile Section */}
          <div className="flex items-center gap-4">
            {/* Search Bar - Hidden on small screens */}
            <div className="hidden md:block">
              <div className="relative w-[800px]">
                {" "}
                {/* Increased width */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="text-gray-400 h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search for anything..."
                  className="w-full py-2 pl-10 pr-4 bg-[#0B0016] rounded-full text-gray-400 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Search Icon - Visible on small screens */}
            <button className="md:hidden w-9 h-9 rounded-full bg-[#0B0016] flex items-center justify-center">
              <Search className="text-white h-5 w-5" />
            </button>

            {/* Notification Button */}
            <button className="w-9 h-9 rounded-full bg-[#0B0016] flex items-center justify-center relative">
              <Bell className="text-white h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="h-14 px-4 py-2 bg-white rounded-3xl shadow-sm flex items-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="User avatar"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-[#0B0016]">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {role.toLowerCase().replace(/_/g, " ")}
                  </p>
                </div>
                <ChevronDown className="hidden md:inline text-[#0B0016] h-4 w-4" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 py-1">
                  <button
                    onClick={() => {
                      console.log("Profile clicked");
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      console.log("Settings clicked");
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
