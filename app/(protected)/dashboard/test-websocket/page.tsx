"use client";

import { useState } from "react";
import { useWebSocket } from "@/context/WebSocketContext";
import { Button } from "@/components/ui/Button";

export default function TestWebSocketPage() {
  const [message, setMessage] = useState("");
  const [testResult, setTestResult] = useState("");
  const { isConnected, unreadCount, notifications } = useWebSocket();

  const sendTestNotification = async () => {
    try {
      const response = await fetch("/api/test-websocket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      setTestResult(
        data.success ? "Notification sent successfully!" : data.error
      );
    } catch (error) {
      setTestResult("Error sending notification");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">WebSocket Test Page</h1>

      {/* Connection Status */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 ${isConnected ? "text-green-600" : "text-red-600"}`}
          >
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          <div className="text-gray-600">Unread Count: {unreadCount}</div>
        </div>
      </div>

      {/* Test Notification */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Notification</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter test message"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={sendTestNotification} disabled={!isConnected}>
            Send Test Notification
          </Button>
        </div>
        {testResult && (
          <div
            className={`p-3 rounded-md ${testResult.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {testResult}
          </div>
        )}
      </div>

      {/* Recent Notifications */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications yet</p>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className="p-3 border border-gray-200 rounded-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
