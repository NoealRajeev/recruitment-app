"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  User,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";

interface SettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    requirementUpdates: boolean;
    labourUpdates: boolean;
    documentUpdates: boolean;
    systemAlerts: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Settings data
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      requirementUpdates: true,
      labourUpdates: true,
      documentUpdates: true,
      systemAlerts: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
    },
    preferences: {
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
    },
  });

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/users/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchSettings();
    }
  }, [session]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showMessage("error", "Password must be at least 8 characters long");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        showMessage("success", "Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Failed to change password");
      }
    } catch (error) {
      showMessage("error", "Error changing password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingsSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/users/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        showMessage("success", "Settings saved successfully");
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Failed to save settings");
      }
    } catch (error) {
      showMessage("error", "Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <Button
            onClick={handleSettingsSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 mr-2" />
            )}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Security Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </h3>

              {/* Password Change */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-4">Change Password</h4>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {isSaving ? "Changing Password..." : "Change Password"}
                  </Button>
                </form>
              </div>

              {/* Two-Factor Authentication */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium">
                      Two-Factor Authentication
                    </h4>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Checkbox
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          twoFactorAuth: checked as boolean,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Session Timeout */}
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        sessionTimeout: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={480}>8 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">
                      Receive notifications via email
                    </p>
                  </div>
                  <Checkbox
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: checked as boolean,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-600">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Checkbox
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          push: checked as boolean,
                        },
                      })
                    }
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-medium mb-3">
                    Notification Types
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Requirement Updates</span>
                      <Checkbox
                        checked={settings.notifications.requirementUpdates}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              requirementUpdates: checked as boolean,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Labour Updates</span>
                      <Checkbox
                        checked={settings.notifications.labourUpdates}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              labourUpdates: checked as boolean,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Document Updates</span>
                      <Checkbox
                        checked={settings.notifications.documentUpdates}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              documentUpdates: checked as boolean,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Alerts</span>
                      <Checkbox
                        checked={settings.notifications.systemAlerts}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              systemAlerts: checked as boolean,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Preferences
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        preferences: {
                          ...settings.preferences,
                          language: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.preferences.timezone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        preferences: {
                          ...settings.preferences,
                          timezone: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Dubai">Dubai</option>
                    <option value="Asia/Kolkata">India</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={settings.preferences.dateFormat}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        preferences: {
                          ...settings.preferences,
                          dateFormat: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
