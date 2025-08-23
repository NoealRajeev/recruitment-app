// components/layout/MobileSidebar.tsx
"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import { Menu } from "lucide-react";
import { UserRole } from "@prisma/client";

import {
  Home,
  Building2,
  Users,
  Settings,
  FileText,
  BarChart2,
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

export default function MobileSidebar({ role }: { role: UserRole }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const items = navItems[role];
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleNavClick = (href: string) => {
    router.push(href); // navigate first
    // wait a tick so Next.js can start navigation
    setTimeout(() => setOpen(false), 300);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* trigger (mobile only) */}
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-black/5 active:bg-black/10 transition"
        >
          <Menu className="h-6 w-6 text-[#2C0053]" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="bg-white text-[#2C0053] border-r border-[#E6D9F0] p-0 w-[88%] max-w-sm"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-[#E6D9F0]">
            <div className="relative h-14 w-40">
              <Image
                src="/assets/Logo-black.png"
                alt="Findly Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <li key={item.href}>
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className={`flex w-full items-center gap-3 px-3 py-3 rounded-xl transition ${
                        active
                          ? "bg-[#F3ECF7] text-[#2C0053] font-semibold"
                          : "hover:bg-[#F7F1FA] text-[#2C0053]/80"
                      }`}
                    >
                      <Icon
                        className={
                          active ? "text-[#2C0053]" : "text-[#2C0053]/70"
                        }
                        size={18}
                      />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom action (optional) */}
          <div className="p-4 border-t border-[#E6D9F0]">
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-[#6914A8] to-[#290842] text-white hover:opacity-95"
              onClick={() => {
                setOpen(false);
                window.location.href = "/dashboard/settings";
              }}
            >
              Settings
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
