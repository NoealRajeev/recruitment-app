"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Globe,
  Edit,
  Save,
  X,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  altContact?: string;
  profilePicture?: string;
  role: string;
  status: string;
  createdAt: string;
  clientProfile?: {
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
  agencyProfile?: {
    agencyName: string;
    registrationNo?: string;
    licenseNumber?: string;
    website?: string;
    address: string;
    city: string;
    country: string;
    postalCode?: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
  };
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<any>({});

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/users/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
          setEditData({
            name: data.profile.name,
            phone: data.profile.phone || "",
            altContact: data.profile.altContact || "",
            ...(data.profile.clientProfile && {
              companyName: data.profile.clientProfile.companyName,
              website: data.profile.clientProfile.website || "",
              address: data.profile.clientProfile.address,
              city: data.profile.clientProfile.city,
              country: data.profile.clientProfile.country,
              postalCode: data.profile.clientProfile.postalCode || "",
              designation: data.profile.clientProfile.designation,
            }),
            ...(data.profile.agencyProfile && {
              agencyName: data.profile.agencyProfile.agencyName,
              website: data.profile.agencyProfile.website || "",
              address: data.profile.agencyProfile.address,
              city: data.profile.agencyProfile.city,
              country: data.profile.agencyProfile.country,
              postalCode: data.profile.agencyProfile.postalCode || "",
              contactPerson: data.profile.agencyProfile.contactPerson,
              contactEmail: data.profile.agencyProfile.contactEmail,
              contactPhone: data.profile.agencyProfile.contactPhone,
            }),
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setIsEditing(false);
        // Show success message
        alert("Profile updated successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset edit data to original values
    if (profile) {
      setEditData({
        name: profile.name,
        phone: profile.phone || "",
        altContact: profile.altContact || "",
        ...(profile.clientProfile && {
          companyName: profile.clientProfile.companyName,
          website: profile.clientProfile.website || "",
          address: profile.clientProfile.address,
          city: profile.clientProfile.city,
          country: profile.clientProfile.country,
          postalCode: profile.clientProfile.postalCode || "",
          designation: profile.clientProfile.designation,
        }),
        ...(profile.agencyProfile && {
          agencyName: profile.agencyProfile.agencyName,
          website: profile.agencyProfile.website || "",
          address: profile.agencyProfile.address,
          city: profile.agencyProfile.city,
          country: profile.agencyProfile.country,
          postalCode: profile.agencyProfile.postalCode || "",
          contactPerson: profile.agencyProfile.contactPerson,
          contactEmail: profile.agencyProfile.contactEmail,
          contactPhone: profile.agencyProfile.contactPhone,
        }),
      });
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

  if (!profile) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Profile Not Found
          </h1>
          <p className="text-gray-600">
            Unable to load your profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture and Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-purple-100 border-4 border-gray-200 flex items-center justify-center">
                      <span className="text-4xl font-bold text-purple-700">
                        {profile.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold mt-4">{profile.name}</h2>
                <p className="text-gray-600 capitalize">
                  {profile.role.toLowerCase().replace(/_/g, " ")}
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile.status === "VERIFIED"
                        ? "bg-green-100 text-green-800"
                        : profile.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {profile.status}
                  </span>
                </div>
              </div>

              {/* Basic Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {profile.email}
                </div>
                {profile.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {profile.phone}
                  </div>
                )}
                {profile.altContact && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {profile.altContact}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Member since{" "}
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <User className="h-5 w-5 mr-2" />
                {profile.clientProfile
                  ? "Company Information"
                  : profile.agencyProfile
                    ? "Agency Information"
                    : "Personal Information"}
              </h3>

              {profile.clientProfile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.companyName || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            companyName: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.clientProfile.companyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number
                    </label>
                    <p className="text-gray-900">
                      {profile.clientProfile.registrationNo || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Sector
                    </label>
                    <p className="text-gray-900 capitalize">
                      {profile.clientProfile.companySector
                        .toLowerCase()
                        .replace(/_/g, " ")}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size
                    </label>
                    <p className="text-gray-900 capitalize">
                      {profile.clientProfile.companySize.toLowerCase()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.website || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, website: e.target.value })
                        }
                        className="w-full"
                        placeholder="https://example.com"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.clientProfile.website ? (
                          <a
                            href={profile.clientProfile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {profile.clientProfile.website}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.designation || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            designation: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.clientProfile.designation}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.address || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, address: e.target.value })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.clientProfile.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.city || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, city: e.target.value })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.clientProfile.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.country || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, country: e.target.value })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.clientProfile.country}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {profile.agencyProfile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agency Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.agencyName || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            agencyName: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.agencyProfile.agencyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <p className="text-gray-900">
                      {profile.agencyProfile.licenseNumber || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.contactPerson || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            contactPerson: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.agencyProfile.contactPerson}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.contactEmail || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            contactEmail: e.target.value,
                          })
                        }
                        className="w-full"
                        type="email"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.agencyProfile.contactEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.contactPhone || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            contactPhone: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.agencyProfile.contactPhone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.website || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, website: e.target.value })
                        }
                        className="w-full"
                        placeholder="https://example.com"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.agencyProfile.website ? (
                          <a
                            href={profile.agencyProfile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {profile.agencyProfile.website}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.address || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, address: e.target.value })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.agencyProfile.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.city || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, city: e.target.value })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.agencyProfile.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.country || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, country: e.target.value })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.agencyProfile.country}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!profile.clientProfile && !profile.agencyProfile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.name || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.phone || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.phone || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternative Contact
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.altContact || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            altContact: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.altContact || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
