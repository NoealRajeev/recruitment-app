"use client";

import { useState, useEffect, useRef } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { getOfflineNotificationService } from "@/lib/offline-notifications";

export default function OfflineStatusIndicatorInner() {
  const svcRef = useRef<ReturnType<
    typeof getOfflineNotificationService
  > | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Lazily init on client
    if (typeof window === "undefined") return;
    if (!svcRef.current) {
      svcRef.current = getOfflineNotificationService();
    }

    const updateOnlineStatus = () => {
      const svc = svcRef.current;
      const online = svc ? svc.isOnlineMode() : navigator.onLine;
      setIsOnline(online);
      if (!online) {
        setShowBanner(true);
      } else {
        // Hide after a short delay when back online
        setTimeout(() => setShowBanner(false), 3000);
      }
    };

    // Initial sync
    updateOnlineStatus();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        showBanner ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div
        className={`px-4 py-2 text-sm font-medium text-center ${
          isOnline
            ? "bg-green-100 text-green-800 border-b border-green-200"
            : "bg-yellow-100 text-yellow-800 border-b border-yellow-200"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>Back online — syncing data…</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>
                You’re offline — notifications will sync when you reconnect
              </span>
            </>
          )}
          <button
            onClick={() => setShowBanner(false)}
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Close offline banner"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
