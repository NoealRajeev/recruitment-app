// app/(public)/auth/register/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/shared/Card";

export default function RegisterPage() {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
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
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateRegistrationNumber = (value: string) => {
    const regex = /^[A-Za-z0-9]{8,15}$/;
    return regex.test(value);
  };

  const checkEmailAvailability = async (email: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(!["taken@example.com", "used@example.com"].includes(email));
      }, 500);
    });
  };

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName) newErrors.companyName = t.required;
    if (!formData.registrationNumber) {
      newErrors.registrationNumber = t.required;
    } else if (!validateRegistrationNumber(formData.registrationNumber)) {
      newErrors.registrationNumber = t.invalidRegistration;
    }
    if (!formData.sector) newErrors.sector = t.required;
    if (!formData.companySize) newErrors.companySize = t.required;
    if (!formData.fullName) newErrors.fullName = t.required;
    if (!formData.jobTitle) newErrors.jobTitle = t.required;

    if (!formData.email) {
      newErrors.email = t.required;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    } else {
      try {
        setEmailCheckInProgress(true);
        const isAvailable = await checkEmailAvailability(formData.email);
        if (!isAvailable) newErrors.email = t.emailInUse;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        newErrors.email = t.emailCheckError;
      } finally {
        setEmailCheckInProgress(false);
      }
    }

    if (!formData.phone) {
      newErrors.phone = t.required;
    } else if (
      !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
        formData.phone
      )
    ) {
      newErrors.phone = t.invalidPhone;
    }

    if (!formData.password) newErrors.password = t.required;
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({ submit: "Registration failed. Please try again." });
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
                  options={
                    t.sectorOptions?.map((opt) => ({
                      value: opt.toLowerCase().replace(/\s+/g, "-"),
                      label: opt,
                    })) || []
                  }
                  id="sector"
                />
                <Select
                  label={t.companySize}
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  error={errors.companySize}
                  required
                  options={
                    t.companySizeOptions?.map((opt) => ({
                      value: opt.toLowerCase().replace(/\s+/g, "-"),
                      label: opt,
                    })) || []
                  }
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
