// components/dashboard/SettingsPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Bell,
  Save,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Globe,
  CalendarClock,
} from "lucide-react";
import { useToast } from "@/context/toast-provider";

type SettingsData = {
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
    sessionTimeout: number; // minutes
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      requirementUpdates: true,
      labourUpdates: true,
      documentUpdates: true,
      systemAlerts: true,
    },
    security: { twoFactorAuth: false, sessionTimeout: 30 },
    preferences: { language: "en", timezone: "UTC", dateFormat: "MM/DD/YYYY" },
  });

  // password state
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const weak = useMemo(
    () => pwd.next.length > 0 && pwd.next.length < 8,
    [pwd.next]
  );
  const mismatch = useMemo(
    () => pwd.next && pwd.confirm && pwd.next !== pwd.confirm,
    [pwd]
  );

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/users/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        }
      } catch (e) {
        console.error(e);
        toast({ type: "error", message: "Failed to load settings" });
      } finally {
        setIsLoading(false);
      }
    };
    if (session?.user) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const onSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save settings");
      }
      toast({ type: "success", message: "Settings saved" });
    } catch (e) {
      toast({
        type: "error",
        message: e instanceof Error ? e.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (weak)
      return toast({
        type: "error",
        message: "Password must be at least 8 characters",
      });
    if (mismatch)
      return toast({ type: "error", message: "Passwords do not match" });

    setSaving(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwd.current,
          newPassword: pwd.next,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to change password");
      }
      setPwd({ current: "", next: "", confirm: "" });
      toast({ type: "success", message: "Password changed" });
    } catch (e) {
      toast({
        type: "error",
        message: e instanceof Error ? e.message : "Change failed",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* sticky action bar */}
        <div className="sticky top-0 z-10 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-white/80 backdrop-blur border-b">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0B0016]">
              Settings
            </h1>
            <Button
              onClick={onSaveSettings}
              disabled={saving}
              className="bg-[#3D1673] hover:bg-[#2b0e54]"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving…" : "Save Settings"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#3D1673]" /> Security
              </h3>

              {/* Change password */}
              <form onSubmit={onChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={show.current ? "text" : "password"}
                      value={pwd.current}
                      onChange={(e) =>
                        setPwd({ ...pwd, current: e.target.value })
                      }
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() =>
                        setShow({ ...show, current: !show.current })
                      }
                    >
                      {show.current ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={show.next ? "text" : "password"}
                      value={pwd.next}
                      onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShow({ ...show, next: !show.next })}
                    >
                      {show.next ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {weak && (
                    <p className="text-xs text-red-600 mt-1">
                      Use at least 8 characters.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={show.confirm ? "text" : "password"}
                      value={pwd.confirm}
                      onChange={(e) =>
                        setPwd({ ...pwd, confirm: e.target.value })
                      }
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() =>
                        setShow({ ...show, confirm: !show.confirm })
                      }
                    >
                      {show.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {mismatch && (
                    <p className="text-xs text-red-600 mt-1">
                      Passwords don’t match.
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {saving ? "Changing…" : "Change Password"}
                </Button>
              </form>

              {/* 2FA */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      Two‑Factor Authentication
                    </div>
                    <div className="text-xs text-gray-600">
                      Add an extra layer of security
                    </div>
                  </div>
                  <Checkbox
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSettings((s) => ({
                        ...s,
                        security: { ...s.security, twoFactorAuth: !!checked },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Session timeout */}
              <div className="mt-6 pt-6 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (minutes)
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      security: {
                        ...s.security,
                        sessionTimeout: Number(e.target.value),
                      },
                    }))
                  }
                >
                  {[15, 30, 60, 120, 480].map((m) => (
                    <option key={m} value={m}>
                      {m < 60
                        ? `${m} minutes`
                        : `${m / 60} hour${m / 60 > 1 ? "s" : ""}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notifications + Preferences */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#3D1673]" /> Notifications
              </h3>

              <ToggleRow
                title="Email Notifications"
                desc="Receive notifications via email"
                checked={settings.notifications.email}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    notifications: { ...s.notifications, email: v },
                  }))
                }
              />
              <ToggleRow
                title="Push Notifications"
                desc="Receive browser push notifications"
                checked={settings.notifications.push}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    notifications: { ...s.notifications, push: v },
                  }))
                }
              />

              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-medium mb-3">
                  Notification Types
                </div>
                {(
                  [
                    ["Requirement Updates", "requirementUpdates"],
                    ["Labour Updates", "labourUpdates"],
                    ["Document Updates", "documentUpdates"],
                    ["System Alerts", "systemAlerts"],
                  ] as const
                ).map(([label, key]) => (
                  <ToggleRow
                    key={key}
                    title={label}
                    checked={(settings.notifications as any)[key]}
                    onChange={(v) =>
                      setSettings((s) => ({
                        ...s,
                        notifications: { ...s.notifications, [key]: v },
                      }))
                    }
                  />
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#3D1673]" /> Preferences
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={settings.preferences.language}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        preferences: {
                          ...s.preferences,
                          language: e.target.value,
                        },
                      }))
                    }
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={settings.preferences.timezone}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        preferences: {
                          ...s.preferences,
                          timezone: e.target.value,
                        },
                      }))
                    }
                  >
                    {[
                      "UTC",
                      "Asia/Dubai",
                      "Asia/Qatar",
                      "Asia/Kolkata",
                      "Europe/London",
                      "Europe/Paris",
                      "America/New_York",
                      "America/Los_Angeles",
                    ].map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            preferences: { ...s.preferences, dateFormat: fmt },
                          }))
                        }
                        className={`px-3 py-2 rounded-md border text-sm ${
                          settings.preferences.dateFormat === fmt
                            ? "border-[#3D1673] bg-[#3D1673]/5 text-[#3D1673]"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <CalendarClock className="h-4 w-4 inline mr-2" />
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** small helper for toggle rows **/
function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm font-medium">{title}</div>
        {desc && <div className="text-xs text-gray-600">{desc}</div>}
      </div>
      <Checkbox checked={checked} onCheckedChange={(c) => onChange(!!c)} />
    </div>
  );
}
