// app/(public)/auth/register/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  getSectorEnumMapping,
  getCompanySizeEnumMapping,
} from "@/lib/utils/enum-mappings";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/shared/Card";
import { z } from "zod";
import { useToast } from "@/context/toast-provider";

const RegistrationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  registrationNumber: z
    .string()
    .regex(/^[A-Za-z0-9]{8,15}$/, "Invalid registration number format"),
  sector: z.string().min(1, "Sector is required"),
  companySize: z.string().min(1, "Company size is required"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number must be at least 6 digits"),
  altContact: z.string().optional(),
});

export default function RegisterPage() {
  const { language, setLanguage, t } = useLanguage();
  const sectorMapping = getSectorEnumMapping(language);
  const companySizeMapping = getCompanySizeEnumMapping(language);
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCheckInProgress, setEmailCheckInProgress] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    registrationNumber: "",
    sector: "",
    companySize: "",
    website: "",
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    altContact: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const checkEmailAvailability = async (email: string) => {
    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to check email");
      }

      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error("Email check error:", error);
      return false;
    }
  };

  const validateForm = async () => {
    try {
      const result = RegistrationSchema.safeParse(formData);

      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
        return false;
      }

      // Check email availability
      setEmailCheckInProgress(true);
      const isAvailable = await checkEmailAvailability(formData.email);
      if (!isAvailable) {
        setErrors((prev) => ({ ...prev, email: "Email is already in use" }));
        return false;
      }

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    } finally {
      setEmailCheckInProgress(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          sector: sectorMapping[formData.sector],
          companySize: companySizeMapping[formData.companySize],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      // Registration successful
      toast({
        type: "success",
        message: "Registration Successful",
      });

      // Redirect to pending review page
      router.push("/auth/verify-account");
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        type: "error",
        message: `Registration Failed ${error instanceof Error ? error.message : "An error occurred"}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push("/auth/login");
  };

  return (
    <div className="flex justify-center items-start min-h-screen pt-10 pb-6 px-6 text-[#2C0053] bg-gray-100">
      <div className="w-[1500px] h-fit bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden flex flex-col relative">
        <div className="absolute top-4 right-4 z-20">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
        <div className="flex-1 mx-16 rounded-lg py-8 flex flex-col justify-between">
          <Card className="p-6">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">
                {t.getRegisteredNow}
              </h1>
              <p className="text-base text-gray-700 mb-2">{t.knowMore}</p>
              <p className="text-xs text-gray-500 italic text-left">
                {t.sectionNoteCompany}
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-6">
              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">
                  {t.companyDetails}
                </h2>
                <Input
                  label={t.companyName}
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  error={errors.companyName}
                  required
                  placeholder={t.companyNamePlaceholder}
                  id="companyName"
                />
                <Input
                  label={t.registrationNumber}
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  error={errors.registrationNumber}
                  required
                  placeholder={t.registrationNumberPlaceholder}
                  id="registrationNumber"
                />
                <Select
                  label={t.sector}
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  error={errors.sector}
                  required
                  options={t.sectorOptions.map((opt) => ({
                    value: opt,
                    label: opt,
                  }))}
                  id="sector"
                />

                <Select
                  label={t.companySize}
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  error={errors.companySize}
                  required
                  options={t.companySizeOptions.map((opt) => ({
                    value: opt,
                    label: opt,
                  }))}
                  id="companySize"
                />
                <Input
                  label={t.website}
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder={t.websitePlaceholder}
                  type="url"
                  id="website"
                />
              </div>

              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[2px] h-2/3 bg-[#2C0053]/30 rounded-full"></div>
              </div>

              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">
                  {t.contactPerson}
                </h2>
                <Input
                  label={t.fullName}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  required
                  placeholder={t.fullNamePlaceholder}
                  id="fullName"
                />
                <Input
                  label={t.jobTitle}
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  error={errors.jobTitle}
                  required
                  placeholder={t.jobTitlePlaceholder}
                  id="jobTitle"
                />
                <Input
                  label={t.email}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder={t.emailPlaceholder}
                  type="email"
                  id="email"
                  loading={emailCheckInProgress}
                />
                <Input
                  label={t.phone}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                  placeholder={t.phonePlaceholder}
                  type="tel"
                  id="phone"
                />
                <Input
                  label={t.altContact}
                  name="altContact"
                  value={formData.altContact}
                  onChange={handleChange}
                  placeholder={t.altContactPlaceholder}
                  type="tel"
                  id="altContact"
                />
              </div>
            </div>
          </Card>
          <div className="col-span-12 mt-6 flex justify-center gap-12">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t.processing}
                </>
              ) : (
                t.register
              )}
            </Button>
            <Button
              type="button"
              onClick={handleLoginRedirect}
              disabled={isSubmitting}
              variant="outline"
              className="px-8 py-2 border-none shadow-sm"
            >
              {t.logIn}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
