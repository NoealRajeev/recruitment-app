"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import offlineNotificationService from "@/lib/offline-notifications";

export default function OfflineStatusIndicatorInner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = offlineNotificationService.isOnlineMode();
      setIsOnline(online);

      if (!online) {
        setShowBanner(true);
      } else {
        setTimeout(() => setShowBanner(false), 3000);
      }
    };

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
              <span>Back online - syncing data...</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>
                You are offline - notifications will be synced when you
                reconnect
              </span>
            </>
          )}
          <button
            onClick={() => setShowBanner(false)}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
