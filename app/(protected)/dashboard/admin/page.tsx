// app/(protected)/dashboard/admin/page.tsx
"use client";

import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ProjectSummary from "@/components/dashboard/ProjectSummary";
import StatsOverview from "@/components/dashboard/StatsOverview";
import { Plus } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/context/toast-provider";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/select";
import Image from "next/image";

interface DashboardData {
  stats: {
    totalRequests: number;
    pendingReviews: number;
    clientsRegistered: number;
    agenciesActive: number;
  };
  recentRequirements: [];
  recentActivity: [];
}

interface AdminFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  profilePicture: File | null;
  profilePreview: string | null;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<AdminFormData>({
    name: "",
    email: "",
    phone: "",
    department: "",
    profilePicture: null,
    profilePreview: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const checkEmailAvailability = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/auth/check-identifier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "email", value: email }),
        });

        if (!response.ok) {
          throw new Error("Failed to check email availability");
        }

        const data = await response.json();
        return data.available;
      } catch (error) {
        console.error("Email check failed:", error);
        return false;
      }
    },
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard/admin");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          throw new Error("Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          type: "error",
          message: "Failed to load dashboard data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear any existing error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Check email availability when email changes
    if (name === "email" && value) {
      setIsCheckingEmail(true);
      try {
        const isAvailable = await checkEmailAvailability(value);
        if (!isAvailable) {
          setErrors((prev) => ({
            ...prev,
            email: "Email is already in use",
          }));
        }
      } catch (error) {
        console.error("Error checking email availability:", error);
      } finally {
        setIsCheckingEmail(false);
      }
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: "Please upload an image file",
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        setErrors((prev) => ({
          ...prev,
          profilePicture: "File size should be less than 5MB",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePicture: file,
          profilePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);

      if (errors.profilePicture) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.profilePicture;
          return newErrors;
        });
      }
    }
  };

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    } else {
      // Check email availability again before submission
      try {
        const isAvailable = await checkEmailAvailability(formData.email);
        if (!isAvailable) {
          newErrors.email = "Email is already in use";
        }
      } catch (error) {
        newErrors.email = "Failed to verify email availability";
      }
    }

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.profilePicture)
      newErrors.profilePicture = "Profile picture is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("department", formData.department);
      if (formData.profilePicture) {
        formDataToSend.append("profilePicture", formData.profilePicture);
      }

      const response = await fetch("/api/admin/register", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        toast({
          type: "success",
          message: "Admin account created successfully",
        });
        setIsModalOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          department: "",
          profilePicture: null,
          profilePreview: null,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create admin account");
      }
    } catch (error) {
      console.error("Error creating admin account:", error);
      toast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create admin account",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="pb-6 px-6 space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        {/* Overview Title with Vertical Line */}
        <div className="flex items-center space-x-3">
          <div className="h-[1.75rem] w-[3px] bg-[#635372]/37 rounded-full" />
          <h1 className="text-2xl font-bold text-[#2C0053]">Overview</h1>
        </div>

        {/* New Account with Icon */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-6 h-6 text-[#2C0053]" />
          <h1 className="text-xl font-bold text-[#2C0053]">New Account</h1>
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Stats + ProjectSummary */}
        <div className="space-y-6 xl:col-span-2">
          <StatsOverview
            stats={{
              totalRequests: data.stats.totalRequests,
              pendingReviews: data.stats.pendingReviews,
              clientsRegistered: data.stats.clientsRegistered,
              agenciesActive: data.stats.agenciesActive,
            }}
            variant="admin"
          />
          <ProjectSummary requirements={data.recentRequirements} />
        </div>

        {/* Right Column: Activity Feed */}
        <div className="xl:col-span-1">
          <ActivityFeed activities={data.recentActivity} />
        </div>
      </div>

      {/* New Admin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Admin Account"
        size="2xl"
        showFooter={true}
        onConfirm={handleSubmit}
        confirmText="Create Account"
        confirmDisabled={isSubmitting || isCheckingEmail}
        isLoading={isSubmitting}
      >
        <div className="space-y-4 pb-10">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 mb-2">
              {formData.profilePreview ? (
                <Image
                  src={formData.profilePreview}
                  alt="Profile preview"
                  layout="fill"
                  objectFit="cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-200 transition-colors">
                {formData.profilePicture ? "Change Photo" : "Upload Photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {errors.profilePicture && (
              <p className="text-sm text-red-500 mt-1">
                {errors.profilePicture}
              </p>
            )}
          </div>

          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            error={errors.name}
            placeholder="Enter admin's full name"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            error={errors.email}
            placeholder="Enter admin's email"
          />

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            error={errors.phone}
            placeholder="Enter phone number"
          />

          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleSelectChange}
            options={[
              { value: "operations", label: "Operations" },
              { value: "recruitment", label: "Recruitment" },
              { value: "compliance", label: "Compliance" },
              { value: "finance", label: "Finance" },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
