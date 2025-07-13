"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function TestNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendTestNotification = async (testType: string) => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/test-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testType }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Test Notification System</h1>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          This page allows you to test the notification system. Click the
          buttons below to send test notifications to yourself.
        </p>

        {message && (
          <div
            className={`p-4 rounded-lg mb-4 ${
              message.startsWith("✅")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={() => sendTestNotification("welcome")}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Send Welcome Notification
        </Button>

        <Button
          onClick={() => sendTestNotification("requirement")}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          Send Requirement Notification
        </Button>

        <Button
          onClick={() => sendTestNotification("travel")}
          disabled={isLoading}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Send Travel Notification
        </Button>

        <Button
          onClick={() => sendTestNotification("custom")}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Send Custom Notification
        </Button>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How to Test</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Click any of the buttons above to send a test notification</li>
          <li>Check the notification bell in the header for the red badge</li>
          <li>Click the notification bell to see the dropdown</li>
          <li>Try marking notifications as read or archiving them</li>
          <li>Verify that the unread count updates correctly</li>
        </ol>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Notification System Features
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <strong>Real-time updates:</strong> Notifications refresh every 30
            seconds
          </li>
          <li>
            <strong>Priority levels:</strong> Urgent (red), High (orange),
            Normal (blue), Low (gray)
          </li>
          <li>
            <strong>Action buttons:</strong> Click notifications to navigate to
            relevant pages
          </li>
          <li>
            <strong>Mark as read:</strong> Individual and bulk mark as read
            functionality
          </li>
          <li>
            <strong>Archive:</strong> Archive notifications to keep the list
            clean
          </li>
          <li>
            <strong>Role-based:</strong> Different notifications for different
            user roles
          </li>
        </ul>
      </div>
    </div>
  );
}
