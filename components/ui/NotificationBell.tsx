"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Archive, Wifi, WifiOff } from "lucide-react";
import { Button } from "./Button";
import { formatDistanceToNow } from "date-fns";
import { useWebSocket } from "@/context/WebSocketContext";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
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
}

export default function NotificationBell({
  className = "",
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    unreadCount,
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  } = useWebSocket();

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    setIsOpen(false);
  };

  // Close dropdown when clicking outside
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

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "NORMAL":
        return "bg-blue-500";
      case "LOW":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
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

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Connection Status Indicator */}
      <div className="absolute -top-1 -right-1">
        {isConnected ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
      </div>

      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </Button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* Priority Indicator */}
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getPriorityColor(
                        notification.priority
                      )}`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                              notification.priority
                            )} text-white`}
                          >
                            {getPriorityText(notification.priority)}
                          </span>
                          {notification.sender && (
                            <span className="text-xs text-gray-500">
                              by {notification.sender.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-green-600"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveNotification(notification.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Archive"
                          >
                            <Archive className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
