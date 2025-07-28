// app/(public)/auth/register/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo, useEffect } from "react";
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
import dynamic from "next/dynamic";

// Dynamically import the language selector to ensure it's client-side only
const LanguageSelector = dynamic(
  () => import("@/components/ui/LanguageSelector"),
  { ssr: false }
);

const countryCodes = [
  { code: "+974", name: "Qatar" },
  { code: "+971", name: "UAE" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+965", name: "Kuwait" },
  { code: "+973", name: "Bahrain" },
  { code: "+968", name: "Oman" },
  { code: "+20", name: "Egypt" },
  { code: "+91", name: "India" },
  { code: "+92", name: "Pakistan" },
  { code: "+94", name: "Sri Lanka" },
  { code: "+880", name: "Bangladesh" },
  { code: "+95", name: "Myanmar" },
  { code: "+977", name: "Nepal" },
];

const RegistrationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  registrationNumber: z
    .string()
    .regex(/^[A-Za-z0-9]{8,15}$/, "Invalid registration number format"),
  sector: z.string().min(1, "Sector is required"),
  companySize: z.string().min(1, "Company size is required"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(2, "Country is required"),
  postcode: z
    .string()
    .regex(/^[0-9A-Za-z\s\-]{3,10}$/, "Invalid postcode format"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number must be at least 6 digits"),
  countryCode: z.string().min(1, "Country code is required"),
  altContact: z.string().optional(),
  altCountryCode: z.string().optional(),
});

const steps = [
  { id: 1, label: "Company Details" },
  { id: 2, label: "Documents" },
];

const solidWidths: Record<number, string> = {
  2: "100%",
};

export default function RegisterPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCheckInProgress, setEmailCheckInProgress] = useState(false);
  const [phoneCheckInProgress, setPhoneCheckInProgress] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState({
    email: false,
    phone: false,
  });
  const [emailOtpResendTime, setEmailOtpResendTime] = useState(0);
  const [phoneOtpResendTime, setPhoneOtpResendTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    registrationNumber: "",
    sector: "",
    companySize: "",
    website: "",
    address: "",
    city: "",
    country: "",
    postcode: "",
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    countryCode: "+974",
    altContact: "",
    altCountryCode: "+974",
    emailOtp: "",
    phoneOtp: "",
    emailVerified: false,
    phoneVerified: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<{
    crFile: File | null;
    licenseFile: File | null;
    otherDocuments: File[];
  }>({
    crFile: null,
    licenseFile: null,
    otherDocuments: [],
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize enum mappings based on language
  const sectorMapping = useMemo(
    () => getSectorEnumMapping(language),
    [language]
  );
  const companySizeMapping = useMemo(
    () => getCompanySizeEnumMapping(language),
    [language]
  );

  const sectorOptions = useMemo(
    () =>
      t.sectorOptions?.map((opt) => ({
        value: sectorMapping[opt] || opt.toLowerCase().replace(/\s+/g, "-"),
        label: opt,
      })) || [],
    [t.sectorOptions, sectorMapping]
  );

  const companySizeOptions = useMemo(
    () =>
      t.companySizeOptions?.map((opt) => ({
        value:
          companySizeMapping[opt] || opt.toLowerCase().replace(/\s+/g, "-"),
        label: opt,
      })) || [],
    [t.companySizeOptions, companySizeMapping]
  );

  const countryOptions = useMemo(
    () =>
      t.nationalityOptions?.map((nat) => ({
        value: nat,
        label: nat,
      })) || [],
    [t.nationalityOptions]
  );

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

  const checkPhoneAvailability = useCallback(
    async (phone: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/auth/check-identifier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "phone", value: phone }),
        });

        if (!response.ok) {
          throw new Error("Failed to check phone availability");
        }

        const data = await response.json();
        return data.available;
      } catch (error) {
        console.error("Phone check failed:", error);
        return false;
      }
    },
    []
  );

  // Fix the useEffect timer setup
  useEffect(() => {
    let emailTimer: NodeJS.Timeout | null = null;
    let phoneTimer: NodeJS.Timeout | null = null;

    if (emailOtpResendTime > 0) {
      emailTimer = setInterval(() => {
        setEmailOtpResendTime((prev) => prev - 1);
      }, 1000);
    }

    if (phoneOtpResendTime > 0) {
      phoneTimer = setInterval(() => {
        setPhoneOtpResendTime((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (emailTimer) clearInterval(emailTimer);
      if (phoneTimer) clearInterval(phoneTimer);
    };
  }, [emailOtpResendTime, phoneOtpResendTime]);

  const sendOtp = useCallback(
    async (type: "email" | "phone", value: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, value }),
        });
        const data = await response.json();
        if (response.ok) {
          toast({ type: "success", message: data.message });
          return true;
        } else {
          throw new Error(data.message || "Failed to send OTP");
        }
      } catch (error) {
        toast({
          type: "error",
          message:
            error instanceof Error ? error.message : "Failed to send OTP",
        });
        return false;
      }
    },
    [toast]
  );

  const verifyOtp = useCallback(
    async (
      type: "email" | "phone",
      value: string,
      otp: string
    ): Promise<boolean> => {
      try {
        const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, value, otp }),
        });

        if (!response.ok) {
          const data = await response.json();
          if (response.status === 401) {
            const errorField = type === "email" ? "emailOtp" : "phoneOtp";
            setErrors((prev) => ({
              ...prev,
              [errorField]: data.message || "Invalid OTP",
            }));
            setFormData((prev) => ({ ...prev, [errorField]: "" }));
            return false;
          }
          throw new Error(data.message || "OTP verification failed");
        }

        const data = await response.json();
        toast({ type: "success", message: data.message });
        return true;
      } catch (error) {
        if (!(error instanceof Error && error.message.includes("OTP"))) {
          toast({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "OTP verification failed",
          });
        }
        return false;
      }
    },
    [toast]
  );

  const handleVerifyEmailOtp = useCallback(async () => {
    if (!formData.emailOtp || formData.emailOtp.length !== 6) {
      toast({ type: "error", message: "Please enter a valid 6-digit OTP" });
      return;
    }

    const verified = await verifyOtp(
      "email",
      formData.email,
      formData.emailOtp
    );
    if (verified) {
      setFormData((prev) => ({ ...prev, emailVerified: true }));
    }
  }, [formData.email, formData.emailOtp, verifyOtp, toast]);

  const handleVerifyPhoneOtp = useCallback(async () => {
    if (!formData.phoneOtp || formData.phoneOtp.length !== 6) {
      toast({ type: "error", message: "Please enter a valid 6-digit OTP" });
      return;
    }

    const fullPhone = `${formData.countryCode}${formData.phone}`;
    const verified = await verifyOtp("phone", fullPhone, formData.phoneOtp);
    if (verified) {
      setFormData((prev) => ({ ...prev, phoneVerified: true }));
    }
  }, [
    formData.countryCode,
    formData.phone,
    formData.phoneOtp,
    verifyOtp,
    toast,
  ]);

  const handleSendEmailOtp = useCallback(async () => {
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast({ type: "error", message: "Please enter a valid email first" });
      return;
    }

    setIsSendingOtp((prev) => ({ ...prev, email: true }));

    try {
      const isAvailable = await checkEmailAvailability(formData.email);
      if (!isAvailable) {
        toast({ type: "error", message: "Email is already in use" });
        return;
      }

      const success = await sendOtp("email", formData.email);
      if (success) {
        setEmailOtpSent(true);
        setEmailOtpResendTime(60); // 60 seconds countdown
      }
    } finally {
      setIsSendingOtp((prev) => ({ ...prev, email: false }));
    }
  }, [formData.email, checkEmailAvailability, sendOtp, toast]);

  const handleSendPhoneOtp = useCallback(async () => {
    if (!formData.phone || !/^[0-9]{8,15}$/.test(formData.phone)) {
      toast({
        type: "error",
        message: "Please enter a valid phone number first",
      });
      return;
    }

    setIsSendingOtp((prev) => ({ ...prev, phone: true }));

    try {
      const fullPhone = `${formData.countryCode}${formData.phone}`;
      const isAvailable = await checkPhoneAvailability(fullPhone);
      if (!isAvailable) {
        toast({ type: "error", message: "Phone number is already in use" });
        return;
      }

      const success = await sendOtp("phone", fullPhone);
      if (success) {
        setPhoneOtpSent(true);
        setPhoneOtpResendTime(60); // 60 seconds countdown
      }
    } finally {
      setIsSendingOtp((prev) => ({ ...prev, phone: false }));
    }
  }, [
    formData.countryCode,
    formData.phone,
    checkPhoneAvailability,
    sendOtp,
    toast,
  ]);

  const handlePostcodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData((prev) => ({ ...prev, postcode: value }));
      if (errors.postcode) setErrors((prev) => ({ ...prev, postcode: "" }));
    },
    [errors.postcode]
  );

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors]
  );

  const handleFileChange = (
    field: keyof typeof documents,
    files: FileList | null
  ) => {
    if (!files) return;

    if (field === "otherDocuments") {
      setDocuments((prev) => ({
        ...prev,
        otherDocuments: Array.from(files),
      }));
    } else {
      setDocuments((prev) => ({
        ...prev,
        [field]: files[0],
      }));
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

      // Check email availability if not verified
      if (!formData.emailVerified) {
        setEmailCheckInProgress(true);
        const isAvailable = await checkEmailAvailability(formData.email);
        if (!isAvailable) {
          setErrors((prev) => ({ ...prev, email: "Email is already in use" }));
          return false;
        }
      }

      // Check phone availability if not verified
      if (!formData.phoneVerified) {
        setPhoneCheckInProgress(true);
        const isAvailable = await checkPhoneAvailability(
          `${formData.countryCode}${formData.phone}`
        );
        if (!isAvailable) {
          setErrors((prev) => ({ ...prev, phone: "Phone is already in use" }));
          return false;
        }
      }

      // Require email verification
      if (!formData.emailVerified) {
        setErrors((prev) => ({
          ...prev,
          emailVerification: "Please verify your email with OTP",
        }));
        return false;
      }

      // Require phone verification
      if (!formData.phoneVerified) {
        setErrors((prev) => ({
          ...prev,
          phoneVerification: "Please verify your phone with OTP",
        }));
        return false;
      }

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    } finally {
      setEmailCheckInProgress(false);
      setPhoneCheckInProgress(false);
    }
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) return;

    setCurrentStep(2);
  };

  const handleRegister = async () => {
    if (!documents.crFile || !documents.licenseFile) {
      toast({
        type: "error",
        message: "Please upload all required documents",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Add all form data
      formDataToSend.append("companyName", formData.companyName);
      formDataToSend.append("registrationNumber", formData.registrationNumber);
      formDataToSend.append("sector", formData.sector);
      formDataToSend.append("companySize", formData.companySize);
      formDataToSend.append("website", formData.website || "");
      formDataToSend.append("address", formData.address);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("postcode", formData.postcode || "");
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("jobTitle", formData.jobTitle);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("countryCode", formData.countryCode);
      formDataToSend.append("altContact", formData.altContact || "");
      formDataToSend.append("altCountryCode", formData.altCountryCode || "");

      // Add documents
      if (documents.crFile) formDataToSend.append("crFile", documents.crFile);
      if (documents.licenseFile)
        formDataToSend.append("licenseFile", documents.licenseFile);
      documents.otherDocuments.forEach((file) => {
        formDataToSend.append("otherDocuments", file);
      });

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      toast({
        type: "success",
        message: "Registration Successful - Please check your email",
      });

      router.push(
        `/auth/verify-account?email=${encodeURIComponent(formData.email)}`
      );
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        type: "error",
        message: `Registration Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push("/auth/login");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
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
                  options={sectorOptions}
                  id="sector"
                  className="!bg-white"
                />
                <Select
                  label={t.companySize}
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  error={errors.companySize}
                  required
                  options={companySizeOptions}
                  id="companySize"
                  className="!bg-white"
                />
                <Input
                  label={t.address || "Company Address"}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  required
                  placeholder={t.addressPlaceholder || "Enter company address"}
                  id="address"
                />
                <Select
                  label={t.country || "Country"}
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  error={errors.country}
                  required
                  options={countryOptions}
                  id="country"
                  className="!bg-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t.city || "City"}
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    error={errors.city}
                    required
                    placeholder="Enter city"
                    id="city"
                  />
                  <Input
                    label={t.postcode || "Postcode"}
                    name="postcode"
                    value={formData.postcode}
                    onChange={handlePostcodeChange}
                    error={errors.postcode}
                    required
                    placeholder="Enter postcode"
                    id="postcode"
                  />
                </div>
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

                {/* Email with OTP verification */}
                <div>
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
                    disabled={formData.emailVerified}
                  />
                  {formData.email && !formData.emailVerified && (
                    <div className="mt-2">
                      {!emailOtpSent ? (
                        <Button
                          type="button"
                          onClick={handleSendEmailOtp}
                          variant="outline"
                          size="sm"
                          disabled={emailCheckInProgress || isSendingOtp.email}
                        >
                          {isSendingOtp.email ? "Sending..." : "Send OTP"}
                        </Button>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Input
                            name="emailOtp"
                            value={formData.emailOtp}
                            onChange={handleChange}
                            placeholder="Enter 6-digit OTP"
                            className="w-32"
                            maxLength={6}
                            error={errors.emailOtp}
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyEmailOtp}
                            variant="outline"
                            size="sm"
                          >
                            Verify
                          </Button>
                          <Button
                            type="button"
                            onClick={handleSendEmailOtp}
                            variant="ghost"
                            size="sm"
                            disabled={
                              emailOtpResendTime > 0 || isSendingOtp.email
                            }
                          >
                            {isSendingOtp.email
                              ? "Sending..."
                              : emailOtpResendTime > 0
                                ? `Resend (${emailOtpResendTime}s)`
                                : "Resend"}
                          </Button>
                        </div>
                      )}
                      {errors.emailVerification && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.emailVerification}
                        </p>
                      )}
                    </div>
                  )}
                  {formData.emailVerified && (
                    <p className="text-sm text-green-600 mt-1">
                      Email verified successfully
                    </p>
                  )}
                </div>

                {/* Phone with country code and OTP verification */}
                <div className="space-y-1">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t.phone}
                    {true && <span className="text-[#FF0404] ml-1">*</span>}
                  </label>

                  <div className="flex gap-2 w-full">
                    <Select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      options={countryCodes.map((cc) => ({
                        value: cc.code,
                        label: `${cc.code} (${cc.name})`,
                      }))}
                      className="w-32 !bg-white"
                      disabled={formData.phoneVerified}
                    />
                    <div className="flex-1">
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        required
                        placeholder={t.phonePlaceholder}
                        type="tel"
                        id="phone"
                        loading={phoneCheckInProgress}
                        disabled={formData.phoneVerified}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {errors.phone && (
                    <p className="text-sm text-[#FF0404]" role="alert">
                      {errors.phone}
                    </p>
                  )}

                  {formData.phone && !formData.phoneVerified && (
                    <div className="mt-2">
                      {!phoneOtpSent ? (
                        <Button
                          type="button"
                          onClick={handleSendPhoneOtp}
                          variant="outline"
                          size="sm"
                          disabled={phoneCheckInProgress || isSendingOtp.phone}
                        >
                          {isSendingOtp.phone ? "Sending..." : "Send OTP"}
                        </Button>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Input
                            name="phoneOtp"
                            value={formData.phoneOtp}
                            onChange={handleChange}
                            placeholder="Enter 6-digit OTP"
                            className="w-32"
                            maxLength={6}
                            error={errors.phoneOtp}
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyPhoneOtp}
                            variant="outline"
                            size="sm"
                          >
                            Verify
                          </Button>
                          <Button
                            type="button"
                            onClick={handleSendPhoneOtp}
                            variant="ghost"
                            size="sm"
                            disabled={
                              phoneOtpResendTime > 0 || isSendingOtp.phone
                            }
                          >
                            {isSendingOtp.phone
                              ? "Sending..."
                              : phoneOtpResendTime > 0
                                ? `Resend (${phoneOtpResendTime}s)`
                                : "Resend"}
                          </Button>
                        </div>
                      )}
                      {errors.phoneVerification && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.phoneVerification}
                        </p>
                      )}
                    </div>
                  )}
                  {formData.phoneVerified && (
                    <p className="text-sm text-green-600 mt-1">
                      Phone verified successfully
                    </p>
                  )}
                </div>

                {/* Alternate contact */}
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t.altContact}
                </label>

                <div className="flex gap-2 w-full">
                  <Select
                    name="altCountryCode"
                    value={formData.altCountryCode}
                    onChange={handleChange}
                    options={countryCodes.map((cc) => ({
                      value: cc.code,
                      label: `${cc.code} (${cc.name})`,
                    }))}
                    className="w-32 !bg-white"
                  />
                  <div className="flex-1">
                    <Input
                      name="altContact"
                      value={formData.altContact}
                      onChange={handleChange}
                      placeholder={t.altContactPlaceholder}
                      type="tel"
                      id="altContact"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-6">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">
                Upload Required Documents
              </h1>
              <p className="text-base text-gray-700 mb-2">
                Please upload the required documents to complete your
                registration
              </p>
              <p className="text-xs text-gray-500 italic text-left">
                All documents must be clear and legible
              </p>
            </div>

            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <Input
                  label="Company Registration Document (Required)"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("crFile", e.target.files)}
                  required
                  id="crFile"
                />
                {documents.crFile && (
                  <p className="text-sm text-green-600">
                    {documents.crFile.name} uploaded
                  </p>
                )}
                <Input
                  label="Business License (Required)"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleFileChange("licenseFile", e.target.files)
                  }
                  required
                  id="licenseFile"
                />
                {documents.licenseFile && (
                  <p className="text-sm text-green-600">
                    {documents.licenseFile.name} uploaded
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <Input
                  label="Other Supporting Documents (Optional)"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleFileChange("otherDocuments", e.target.files)
                  }
                  id="otherDocuments"
                />
                {documents.otherDocuments.length > 0 && (
                  <div className="text-sm text-green-600">
                    {documents.otherDocuments.length} files uploaded
                  </div>
                )}
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen pt-10 pb-6 px-6 text-[#2C0053] bg-gray-100">
      <div className="w-[1500px] h-fit bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden flex flex-col relative">
        <LanguageSelector />

        <div className="relative px-16 pt-10 pb-6">
          <div className="absolute inset-x-0 top-1/2 h-0.5 z-0">
            <div className="absolute -left-44 right-0 h-full flex w-full max-w-[1380px] mx-auto">
              <div
                className="h-full bg-[#2C0053] transition-all duration-300"
                style={{
                  width:
                    currentStep === 1
                      ? "calc(15%)"
                      : solidWidths[currentStep as keyof typeof solidWidths] ||
                        "100%",
                }}
              />

              <div
                className="h-full border-t-2 border-dotted border-gray-300 transition-all duration-300"
                style={{
                  width:
                    currentStep === 1
                      ? `calc(85%)`
                      : `calc(${
                          100 - ((currentStep - 1) / (steps.length - 1)) * 100
                        }%)`,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between relative z-10 mt-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className="text-center flex-1 max-w-[200px] relative"
              >
                <div
                  className={`w-12 h-12 mx-auto rounded-full text-lg font-bold mb-3 flex items-center justify-center ${
                    currentStep >= step.id
                      ? "bg-[#2C0053] text-white"
                      : "bg-gray-200 text-gray-600"
                  } ${currentStep > step.id ? "ring-2 ring-[#2C0053]" : ""}`}
                  aria-current={currentStep === step.id ? "step" : undefined}
                >
                  {step.id}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep >= step.id ? "text-[#2C0053]" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 mx-16 rounded-lg py-8 flex flex-col justify-between">
          {renderStepContent()}

          <div className="col-span-12 mt-6 flex justify-center gap-12">
            {currentStep === 1 ? (
              <>
                <Button
                  type="button"
                  onClick={handleNextStep}
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
                    "Continue to Documents"
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
              </>
            ) : (
              <>
                <Button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="px-8 py-2"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleRegister}
                  disabled={
                    isSubmitting || !documents.crFile || !documents.licenseFile
                  }
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
                    "Complete Registration"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
