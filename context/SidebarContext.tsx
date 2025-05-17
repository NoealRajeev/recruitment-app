// context/SidebarContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";

type SidebarContextType = {
  isExpanded: boolean;
  autoCollapsed: boolean;
  toggleSidebar: () => void;
  setExpanded: (expanded: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoCollapsed, setAutoCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    setAutoCollapsed(false);
  };

  const setExpanded = (expanded: boolean) => {
    if (isExpanded !== expanded) {
      setIsExpanded(expanded);
      setAutoCollapsed(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        if (isExpanded && !autoCollapsed) {
          setIsExpanded(false);
          setAutoCollapsed(true);
        }
      } else {
        if (autoCollapsed) {
          setIsExpanded(true);
          setAutoCollapsed(false);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded, autoCollapsed]);

  return (
    <SidebarContext.Provider
      value={{ isExpanded, autoCollapsed, toggleSidebar, setExpanded }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
