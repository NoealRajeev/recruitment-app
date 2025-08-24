// components/dashboard/ProfilePage.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Mail,
  Phone,
  User,
  Building2,
  UploadCloud,
  Save,
  X,
  Edit3,
  BadgeInfo,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/toast-provider";

const COMPANY_SECTORS = [
  "IT",
  "REAL_ESTATE",
  "HEALTHCARE",
  "FINANCE",
  "MANUFACTURING",
  "RETAIL",
  "CONSTRUCTION",
  "EDUCATION",
  "HOSPITALITY",
  "OIL_GAS",
  "TRANSPORTATION",
  "OTHER",
] as const;

const COMPANY_SIZES = ["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"] as const;

const DEPARTMENTS = [
  "RECRUITMENT",
  "HR",
  "OPERATIONS",
  "FINANCE",
  "COMPLIANCE",
  "BUSINESS_DEVELOPMENT",
  "IT",
  "MARKETING",
] as const;

type ClientProfile = {
  companyName: string;
  registrationNo?: string;
  companySector: string;
  companySize: string;
  website?: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  designation: string;
};

type AgencyProfile = {
  agencyName: string;
  registrationNo?: string;
  licenseNumber: string;
  licenseExpiry: string;
  website?: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
};

type AdminProfile = {
  name: string;
  department?: string | null;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  altContact?: string;
  profilePicture?: string;
  role: "RECRUITMENT_ADMIN" | "CLIENT_ADMIN" | "RECRUITMENT_AGENCY";
  status: string;
  createdAt: string;
  clientProfile?: ClientProfile;
  agencyProfile?: AgencyProfile;
  adminProfile?: AdminProfile;
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<any>({});
  const initialRef = useRef<any>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/users/profile");
        if (res.ok) {
          const data = await res.json();
          const p: UserProfile = data.profile;
          setProfile(p);
          setEdit(seedEdit(p));
        }
      } catch {
        toast({ type: "error", message: "Failed to load profile" });
      } finally {
        setIsLoading(false);
      }
    };
    if (session?.user) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const isClient = profile?.role === "CLIENT_ADMIN" && !!profile?.clientProfile;
  const isAgency =
    profile?.role === "RECRUITMENT_AGENCY" && !!profile?.agencyProfile;
  const isAdmin =
    profile?.role === "RECRUITMENT_ADMIN" && !!profile?.adminProfile;

  function seedEdit(p: UserProfile) {
    return {
      name: p.name ?? "",
      phone: p.phone ?? "",
      altContact: p.altContact ?? "",
      ...(p.clientProfile && {
        companyName: p.clientProfile.companyName,
        website: p.clientProfile.website ?? "",
        address: p.clientProfile.address,
        city: p.clientProfile.city,
        country: p.clientProfile.country,
        postalCode: p.clientProfile.postalCode ?? "",
        designation: p.clientProfile.designation,
        companySector: p.clientProfile.companySector,
        companySize: p.clientProfile.companySize,
      }),
      ...(p.agencyProfile && {
        agencyName: p.agencyProfile.agencyName,
        website: p.agencyProfile.website ?? "",
        address: p.agencyProfile.address,
        city: p.agencyProfile.city,
        country: p.agencyProfile.country,
        postalCode: p.agencyProfile.postalCode ?? "",
      }),
      ...(p.adminProfile && {
        department: p.adminProfile.department ?? "",
      }),
    };
  }

  const onPickAvatar = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast({ type: "error", message: "Please select an image file" });
      return;
    }
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };
  const onAvatarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onPickAvatar(f);
    e.currentTarget.value = "";
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save profile");
      }

      if (avatarFile) {
        if (avatarFile.size > 10 * 1024 * 1024) {
          throw new Error("Image too large (max 10MB)");
        }
        const fd = new FormData();
        fd.append("file", avatarFile);
        const up = await fetch("/api/users/profile-picture", {
          method: "POST",
          body: fd,
        });
        if (!up.ok) {
          const err = await up.json().catch(() => ({}));
          throw new Error(err.error || "Failed to upload avatar");
        }
      }

      const fresh = await fetch("/api/users/profile").then((r) => r.json());
      setProfile(fresh.profile);
      setEdit(seedEdit(fresh.profile));
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsEditing(false);
      toast({ type: "success", message: "Profile updated" });
    } catch (e) {
      toast({
        type: "error",
        message: e instanceof Error ? e.message : "Update failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    if (profile) setEdit(seedEdit(profile));
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(false);
  };

  const disabled = useMemo(() => saving || isLoading, [saving, isLoading]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="lg:col-span-2 h-64 rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Profile not found
          </h1>
          <p className="text-gray-600">
            We couldn’t load your profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="sticky top-0 z-10 -mx-4 md:-mx-6 px-4 md:px-6 py-3 backdrop-blur-xs">
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={onSave}
                  disabled={disabled}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="border-gray-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setIsEditing(true);
                  setTimeout(() => initialRef.current?.focus(), 0);
                }}
                className="bg-[#3D1673] hover:bg-[#2b0e54]"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: avatar + basics */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="text-center">
              <div className="relative inline-block">
                {avatarPreview || profile.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview ?? profile.profilePicture!}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-purple-100 border-4 border-gray-100 flex items-center justify-center">
                    <span className="text-4xl font-bold text-purple-700">
                      {profile.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {isEditing && (
                <label className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-50 border border-blue-200 text-blue-700 cursor-pointer">
                  <UploadCloud className="h-4 w-4" />
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatarInput}
                  />
                </label>
              )}

              <h2 className="text-lg font-semibold mt-4">{profile.name}</h2>
              <p className="text-gray-600 capitalize">
                {profile.role.toLowerCase().replace(/_/g, " ")}
              </p>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {profile.email}
                </div>
                {profile.phone && (
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {profile.phone}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t text-xs text-gray-500">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* RIGHT: editable forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal / contact */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-[#3D1673]" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Name">
                  {isEditing ? (
                    <Input
                      ref={initialRef}
                      value={edit.name || ""}
                      onChange={(e) =>
                        setEdit({ ...edit, name: e.target.value })
                      }
                    />
                  ) : (
                    <Read>{profile.name}</Read>
                  )}
                </Field>

                <Field label="Phone">
                  {isEditing ? (
                    <Input
                      value={edit.phone || ""}
                      onChange={(e) =>
                        setEdit({ ...edit, phone: e.target.value })
                      }
                      placeholder="+974 5555 5555"
                    />
                  ) : (
                    <Read>{profile.phone || "Not provided"}</Read>
                  )}
                </Field>

                <Field label="Alternative Contact">
                  {isEditing ? (
                    <Input
                      value={edit.altContact || ""}
                      onChange={(e) =>
                        setEdit({ ...edit, altContact: e.target.value })
                      }
                    />
                  ) : (
                    <Read>{profile.altContact || "Not provided"}</Read>
                  )}
                </Field>

                <Field label="Email">
                  <Read>{profile.email}</Read>
                </Field>
              </div>
            </div>

            {/* Admin */}
            {isAdmin && profile.adminProfile && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <BadgeInfo className="h-5 w-5 text-[#3D1673]" />
                  Admin Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Department">
                    {isEditing ? (
                      <select
                        className="w-full border rounded-md px-3 py-2"
                        value={edit.department || ""}
                        onChange={(e) =>
                          setEdit({ ...edit, department: e.target.value })
                        }
                      >
                        <option value="">Select…</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (m) => m.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Read>
                        {profile.adminProfile.department ?? "Not set"}
                      </Read>
                    )}
                  </Field>
                </div>
              </div>
            )}

            {/* Client */}
            {isClient && profile.clientProfile && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#3D1673]" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Company Name">
                    {isEditing ? (
                      <Input
                        value={edit.companyName || ""}
                        onChange={(e) =>
                          setEdit({ ...edit, companyName: e.target.value })
                        }
                      />
                    ) : (
                      <Read>{profile.clientProfile.companyName}</Read>
                    )}
                  </Field>

                  <Field label="Registration Number">
                    <Read>
                      {profile.clientProfile.registrationNo || "Not provided"}
                    </Read>
                  </Field>

                  <Field label="Company Sector">
                    {isEditing ? (
                      <select
                        className="w-full border rounded-md px-3 py-2"
                        value={edit.companySector || "OTHER"}
                        onChange={(e) =>
                          setEdit({ ...edit, companySector: e.target.value })
                        }
                      >
                        {COMPANY_SECTORS.map((s) => (
                          <option key={s} value={s}>
                            {s
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (m) => m.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Read>{pretty(profile.clientProfile.companySector)}</Read>
                    )}
                  </Field>

                  <Field label="Company Size">
                    {isEditing ? (
                      <select
                        className="w-full border rounded-md px-3 py-2"
                        value={edit.companySize || "SMALL"}
                        onChange={(e) =>
                          setEdit({ ...edit, companySize: e.target.value })
                        }
                      >
                        {COMPANY_SIZES.map((s) => (
                          <option key={s} value={s}>
                            {pretty(s)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Read>{pretty(profile.clientProfile.companySize)}</Read>
                    )}
                  </Field>

                  <Field label="Website">
                    {isEditing ? (
                      <Input
                        value={edit.website || ""}
                        onChange={(e) =>
                          setEdit({ ...edit, website: e.target.value })
                        }
                        placeholder="https://example.com"
                      />
                    ) : (
                      <ReadLink href={profile.clientProfile.website} />
                    )}
                  </Field>

                  <Field label="Designation">
                    {isEditing ? (
                      <Input
                        value={edit.designation || ""}
                        onChange={(e) =>
                          setEdit({ ...edit, designation: e.target.value })
                        }
                      />
                    ) : (
                      <Read>{profile.clientProfile.designation}</Read>
                    )}
                  </Field>

                  <Field label="Address" span>
                    {isEditing ? (
                      <Input
                        value={edit.address || ""}
                        onChange={(e) =>
                          setEdit({ ...edit, address: e.target.value })
                        }
                      />
                    ) : (
                      <Read>{profile.clientProfile.address}</Read>
                    )}
                  </Field>

                  <Field label="City">
                    {isEditing ? (
                      <Input
                        value={edit.city || ""}
                        onChange={(e) =>
                          setEdit({ ...edit, city: e.target.value })
                        }
                      />
                    ) : (
                      <Read>{profile.clientProfile.city}</Read>
                    )}
                  </Field>

                  <Field label="Country">
                    {isEditing ? (
                      <Input
                        value={edit.country || ""}
                        onChange={(e) =>
                          setEdit({ ...edit, country: e.target.value })
                        }
                      />
                    ) : (
                      <Read>{profile.clientProfile.country}</Read>
                    )}
                  </Field>
                </div>
              </div>
            )}

            {/* Agency */}
            {isAgency && profile.agencyProfile && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#3D1673]" />
                  Agency Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Agency Name">
                    {isEditing ? (
                      <Input
                        value={edit.agencyName || ""}
                        onChange={(e) =>
                          setEdit({ ...edit, agencyName: e.target.value })
                        }
                      />
                    ) : (
                      <Read>{profile.agencyProfile.agencyName}</Read>
                    )}
                  </Field>

                  <Field label="Registration Number">
                    <Read>
                      {profile.agencyProfile.registrationNo || "Not provided"}
                    </Read>
                  </Field>

                  <Field label="License Number">
                    <Read>{profile.agencyProfile.licenseNumber}</Read>
                  </Field>

                  <Field label="License Expiry">
                    <Read>
                      {new Date(
                        profile.agencyProfile.licenseExpiry
                      ).toLocaleDateString()}
                    </Read>
                  </Field>

                  <Field label="Website">
                    {isEditing ? (
                      <Input
                        value={edit.website || ""}
                        onChange={(e) =>
                          setEdit({ ...edit, website: e.target.value })
                        }
                        placeholder="https://example.com"
                      />
                    ) : (
                      <ReadLink href={profile.agencyProfile.website} />
                    )}
                  </Field>

                  <Field label="Address" span>
                    {isEditing ? (
                      <Input
                        value={edit.address || ""}
                        onChange={(e) =>
                          setEdit({ ...edit, address: e.target.value })
                        }
                      />
                    ) : (
                      <Read>{profile.agencyProfile.address}</Read>
                    )}
                  </Field>

                  <Field label="City">
                    {isEditing ? (
                      <Input
                        value={edit.city || ""}
                        onChange={(e) =>
                          setEdit({ ...edit, city: e.target.value })
                        }
                      />
                    ) : (
                      <Read>{profile.agencyProfile.city}</Read>
                    )}
                  </Field>

                  <Field label="Country">
                    {isEditing ? (
                      <Input
                        value={edit.country || ""}
                        onChange={(e) =>
                          setEdit({ ...edit, country: e.target.value })
                        }
                      />
                    ) : (
                      <Read>{profile.agencyProfile.country}</Read>
                    )}
                  </Field>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** helpers */
function pretty(s?: string) {
  if (!s) return "Not set";
  return s
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}
function Field({
  label,
  children,
  span,
}: {
  label: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div className={span ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
function Read({ children }: { children: React.ReactNode }) {
  return <div className="text-gray-900">{children}</div>;
}
function ReadLink({ href }: { href?: string }) {
  if (!href) return <Read>Not provided</Read>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline break-words"
    >
      {href}
    </a>
  );
}
