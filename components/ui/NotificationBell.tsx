"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Bell, X, Check, Archive } from "lucide-react";
import { Button } from "./Button";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/use-notifications";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT" | string;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
  sender?: {
    name: string;
    role: string;
  };
}

interface NotificationBellProps {
  className?: string;
  /** optional: route for "View all" */
  allHref?: string;
}

export default function NotificationBell({
  className = "",
  allHref = "/dashboard/notifications?tab=all",
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    isOnline,
    unreadCount,
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  } = useNotifications();

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // fetch when opened
  useEffect(() => {
    if (isOpen) fetchNotifications({ limit: 20 });
  }, [isOpen, fetchNotifications]);

  const onNotificationClick = (n: Notification) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.actionUrl) router.push(n.actionUrl);
    setIsOpen(false);
  };

  // brand + priority styles
  const priorityPill = (p: string) => {
    switch (p) {
      case "URGENT":
        return "bg-red-50 text-red-700 ring-1 ring-red-200";
      case "HIGH":
        return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";
      case "NORMAL":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
      case "LOW":
        return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
      default:
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    }
  };
  const priorityStrip = (p: string) => {
    switch (p) {
      case "URGENT":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "NORMAL":
        return "bg-blue-500";
      case "LOW":
        return "bg-gray-400";
      default:
        return "bg-blue-500";
    }
  };
  const priorityText = (p: string) => {
    switch (p) {
      case "URGENT":
        return "Urgent";
      case "HIGH":
        return "High";
      case "NORMAL":
        return "Normal";
      case "LOW":
        return "Low";
      default:
        return "Normal";
    }
  };

  const hasItems = useMemo(() => notifications.length > 0, [notifications]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* bell */}
      <button
        onClick={() => setIsOpen((s) => !s)}
        className="relative inline-flex items-center justify-center rounded-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D1673]/50"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white shadow"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* panel */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-[26rem] rounded-2xl border bg-white shadow-lg z-50 overflow-hidden"
        >
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white/70 backdrop-blur">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-gray-900">
                Notifications
              </h3>
              {!isOnline && (
                <span className="text-[10px] rounded-full bg-yellow-100 px-2 py-0.5 font-medium text-yellow-800">
                  Offline
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[#3D1673] hover:text-white hover:bg-[#3D1673]"
                >
                  Mark all read
                </Button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="ml-1 rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D1673]/50"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* list */}
          <div className="max-h-96 overflow-y-auto">
            {!hasItems ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-500">
                <div className="rounded-full border p-3">
                  <Bell className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm">You’re all caught up</p>
              </div>
            ) : (
              <ul className="divide-y">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`group relative cursor-pointer bg-white transition-colors hover:bg-gray-50 ${
                      !n.isRead ? "bg-[#3D1673]/[0.03]" : ""
                    }`}
                    onClick={() => onNotificationClick(n)}
                  >
                    {/* left strip for priority */}
                    <div
                      className={`absolute left-0 top-0 h-full w-1 ${priorityStrip(
                        n.priority
                      )}`}
                    />
                    <div className="px-4 py-3 pl-5">
                      <div className="flex items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-gray-300 group-hover:bg-gray-400" />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between gap-3">
                            <h4
                              className={`truncate text-sm ${
                                !n.isRead
                                  ? "font-semibold text-gray-900"
                                  : "font-medium text-gray-800"
                              }`}
                              title={n.title}
                            >
                              {n.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="whitespace-nowrap text-xs text-gray-500">
                                {formatDistanceToNow(new Date(n.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                              {!n.isRead && (
                                <span
                                  className="inline-block h-2 w-2 rounded-full bg-[#3D1673]"
                                  aria-label="unread"
                                />
                              )}
                            </div>
                          </div>

                          <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                            {n.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${priorityPill(
                                  n.priority
                                )}`}
                              >
                                {priorityText(n.priority)}
                              </span>
                              {n.sender?.name && (
                                <span className="text-[11px] text-gray-500">
                                  by {n.sender.name}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-80">
                              {!n.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(n.id);
                                  }}
                                  className="rounded p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400/40"
                                  title="Mark as read"
                                  aria-label="Mark as read"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  archiveNotification(n.id);
                                }}
                                className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
                                title="Archive"
                                aria-label="Archive notification"
                              >
                                <Archive className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* action CTA inline (optional) */}
                      {n.actionUrl && (
                        <div className="mt-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!n.isRead) markAsRead(n.id);
                              router.push(n.actionUrl!);
                              setIsOpen(false);
                            }}
                            size="sm"
                            className="h-8 rounded-md bg-[#3D1673] px-3 text-xs hover:bg-[#2b0e54]"
                          >
                            {n.actionText || "Open"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between border-t bg-white px-4 py-2.5">
            <div className="text-[11px] text-gray-500">
              {unreadCount > 0 ? (
                <span>
                  <strong className="text-gray-700">{unreadCount}</strong>{" "}
                  unread
                </span>
              ) : (
                <span>All caught up</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-[#3D1673] hover:text-white hover:bg-[#3D1673]"
              onClick={() => {
                setIsOpen(false);
                router.push(allHref);
              }}
            >
              View all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
