// components/layout/SidebarToggleButton.tsx
"use client";

import { useSidebar } from "@/context/SidebarContext";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function SidebarToggleButton() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  return (
    <button
      onClick={toggleSidebar}
      className={`hidden md:flex absolute top-[65px] z-40 w-9 h-9 items-center justify-center rounded-full bg-white shadow-md transition-all duration-350
        ${isExpanded ? "left-[284px]" : "left-[64px]"}`}
      aria-label={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
    >
      <span
        className={`transition-transform duration-350 ${isExpanded ? "rotate-180" : ""}`}
      >
        <ChevronRight />
      </span>
    </button>
  );
}
