// app/(public)/auth/register/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
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
import { CompanySector, CompanySize } from "@/lib/generated/prisma";

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

export default function RegisterPage() {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCheckInProgress, setEmailCheckInProgress] = useState(false);
  const [phoneCheckInProgress, setPhoneCheckInProgress] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtpResendTime, setEmailOtpResendTime] = useState(0);
  const [phoneOtpResendTime, setPhoneOtpResendTime] = useState(0);
  const [autoFillingCity, setAutoFillingCity] = useState(false);
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

  const handleSendEmailOtp = useCallback(async () => {
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast({ type: "error", message: "Please enter a valid email first" });
      return;
    }

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
  }, [formData.email, checkEmailAvailability, sendOtp, toast]);

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

  const handleSendPhoneOtp = useCallback(async () => {
    if (!formData.phone || !/^[0-9]{8,15}$/.test(formData.phone)) {
      toast({
        type: "error",
        message: "Please enter a valid phone number first",
      });
      return;
    }

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
  }, [
    formData.countryCode,
    formData.phone,
    checkPhoneAvailability,
    sendOtp,
    toast,
  ]);

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
          companyName: formData.companyName,
          registrationNumber: formData.registrationNumber,
          sector: formData.sector as CompanySector,
          companySize: formData.companySize as CompanySize,
          website: formData.website,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postcode,
          fullName: formData.fullName,
          jobTitle: formData.jobTitle,
          email: formData.email,
          phone: formData.phone,
          countryCode: formData.countryCode,
          altContact: formData.altContact,
          altCountryCode: formData.altCountryCode,
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
                  options={sectorOptions}
                  id="sector"
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
                    disabled={autoFillingCity}
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
                          disabled={emailCheckInProgress}
                        >
                          Send OTP
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
                            disabled={emailOtpResendTime > 0}
                          >
                            Resend{" "}
                            {emailOtpResendTime > 0 &&
                              `(${emailOtpResendTime}s)`}
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
                      className="w-32"
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
                          disabled={phoneCheckInProgress}
                        >
                          Send OTP
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
                            disabled={phoneOtpResendTime > 0}
                          >
                            Resend{" "}
                            {phoneOtpResendTime > 0 &&
                              `(${phoneOtpResendTime}s)`}
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
                    className="w-32"
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
