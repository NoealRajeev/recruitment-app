"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/shared/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { Trash2 } from "lucide-react";
import { useToast } from "@/context/toast-provider";
import {
  CompanySector,
  CompanySize,
  RequirementStatus,
} from "@/lib/generated/prisma";
import {
  getSectorEnumMapping,
  getCompanySizeEnumMapping,
  getDisplaySectorMapping,
  getDisplayCompanySizeMapping,
} from "@/lib/utils/enum-mappings";

interface JobRole {
  title: string;
  quantity: number;
  nationality: string;
}

interface FormData {
  companyName: string;
  registrationNumber: string;
  sector: CompanySector | "";
  companySize: CompanySize | "";
  website: string;
  address: string;
  city: string;
  country: string;
  postcode: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  countryCode: string;
  altContact: string;
  altCountryCode: string;
  jobRoles: JobRole[];
  emailVerified: boolean;
  phoneVerified: boolean;
  emailOtp: string;
  phoneOtp: string;
}

interface Errors {
  [key: string]: string;
}

interface ReviewFieldProps {
  label: string;
  value: string;
}

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

export default function SubmitRequirement() {
  const { language, setLanguage, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCheckInProgress, setEmailCheckInProgress] = useState(false);
  const [phoneCheckInProgress, setPhoneCheckInProgress] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [autoFillingCity, setAutoFillingCity] = useState(false);
  const [emailOtpResendTime, setEmailOtpResendTime] = useState(0);
  const [phoneOtpResendTime, setPhoneOtpResendTime] = useState(0);
  const { toast } = useToast();

  // Memoize enum mappings based on language
  const sectorMapping = useMemo(
    () => getSectorEnumMapping(language),
    [language]
  );
  const companySizeMapping = useMemo(
    () => getCompanySizeEnumMapping(language),
    [language]
  );
  const displaySectorMapping = useMemo(
    () => getDisplaySectorMapping(language),
    [language]
  );
  const displayCompanySizeMapping = useMemo(
    () => getDisplayCompanySizeMapping(language),
    [language]
  );

  const initialFormData: FormData = useMemo(
    () => ({
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
      jobRoles: [
        {
          title: "",
          quantity: 1,
          nationality: "",
        },
      ],
      emailVerified: false,
      phoneVerified: false,
      emailOtp: "",
      phoneOtp: "",
    }),
    []
  );

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Errors>({});

  const steps = t.steps;

  // Solid widths for progress bar
  const solidWidths: Record<number, string> = {
    2: "calc(50% + 340px)",
    3: "2800px",
  };

  // OTP countdown timers
  useEffect(() => {
    if (emailOtpResendTime > 0) {
      const timer = setTimeout(() => {
        setEmailOtpResendTime(emailOtpResendTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emailOtpResendTime]);

  useEffect(() => {
    if (phoneOtpResendTime > 0) {
      const timer = setTimeout(() => {
        setPhoneOtpResendTime(phoneOtpResendTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneOtpResendTime]);

  // Validation functions
  const validateRegistrationNumber = useCallback((value: string): boolean => {
    const regex = /^[A-Za-z0-9]{8,15}$/;
    return regex.test(value);
  }, []);

  const countryOptions = useMemo(
    () =>
      t.nationalityOptions?.map((nat) => ({
        value: nat,
        label: nat,
      })) || [],
    [t.nationalityOptions]
  );

  const handlePostcodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData((prev) => ({ ...prev, postcode: value }));
      if (errors.postcode) setErrors((prev) => ({ ...prev, postcode: "" }));
    },
    [errors.postcode]
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

  // Step validation functions
  const validateStep1 = useCallback(async (): Promise<boolean> => {
    const newErrors: Errors = {};
    const requiredFields = {
      companyName: t.required,
      registrationNumber: validateRegistrationNumber(
        formData.registrationNumber
      )
        ? ""
        : t.invalidRegistration,
      sector: t.required,
      companySize: t.required,
      address: t.required,
      city: t.required,
      postcode: /^[0-9A-Za-z\s\-]{3,10}$/.test(formData.postcode)
        ? ""
        : t.invalidPostcode || "Invalid postcode",
      country: t.required,
      fullName: t.required,
      jobTitle: t.required,
      email: /^\S+@\S+\.\S+$/.test(formData.email) ? "" : t.invalidEmail,
      phone: /^[0-9]{8,15}$/.test(formData.phone) ? "" : t.invalidPhone,
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field as keyof FormData]) {
        newErrors[field] = message || t.required;
      }
    });

    // Check email availability if not verified
    if (!newErrors.email && formData.email && !formData.emailVerified) {
      try {
        setEmailCheckInProgress(true);
        const isAvailable = await checkEmailAvailability(formData.email);
        if (!isAvailable) newErrors.email = t.emailInUse;
      } catch (error) {
        toast({
          type: "error",
          message:
            error instanceof Error ? error.message : "Email check failed",
        });
      } finally {
        setEmailCheckInProgress(false);
      }
    }

    // Check phone availability if not verified
    if (!newErrors.phone && formData.phone && !formData.phoneVerified) {
      try {
        setPhoneCheckInProgress(true);
        const isAvailable = await checkPhoneAvailability(
          `${formData.countryCode}${formData.phone}`
        );
        if (!isAvailable) newErrors.phone = t.invalidPhone;
      } catch (error) {
        toast({
          type: "error",
          message:
            error instanceof Error ? error.message : "Phone check failed",
        });
      } finally {
        setPhoneCheckInProgress(false);
      }
    }

    // Require email verification
    if (!formData.emailVerified) {
      newErrors.emailVerification = "Please verify your email with OTP";
    }

    // Require phone verification
    if (!formData.phoneVerified) {
      newErrors.phoneVerification = "Please verify your phone with OTP";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    formData,
    t,
    validateRegistrationNumber,
    checkEmailAvailability,
    checkPhoneAvailability,
    toast,
  ]);

  const validateStep2 = useCallback((): boolean => {
    const newErrors: Errors = {};

    // Check each job role
    formData.jobRoles.forEach((role, index) => {
      if (!role.title.trim()) {
        newErrors[`jobRoles[${index}].title`] = "Job role is required";
      }
      if (role.quantity < 1) {
        newErrors[`jobRoles[${index}].quantity`] =
          "Quantity must be at least 1";
      }
      if (!role.nationality.trim()) {
        newErrors[`jobRoles[${index}].nationality`] = "Nationality is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Navigation handlers
  const handleNext = useCallback(async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = await validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    } else {
      isValid = true;
    }

    if (!isValid) {
      toast({
        type: "error",
        message: "Please fix all errors before proceeding",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      setIsSubmitting(false);
    }, 800);
  }, [currentStep, validateStep1, validateStep2, toast, steps.length]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // Form change handlers
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

  const handleJobRoleChange = useCallback(
    (
      index: number,
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => {
        const updatedJobRoles = [...prev.jobRoles];
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          [name.replace(`jobRoles[${index}].`, "")]: name.includes("quantity")
            ? parseInt(value) || 0
            : value,
        };
        return { ...prev, jobRoles: updatedJobRoles };
      });
    },
    []
  );

  // Job role management
  const addJobRole = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      jobRoles: [
        ...prev.jobRoles,
        {
          title: "",
          quantity: 1,
          nationality: "",
        },
      ],
    }));
  }, []);

  const removeJobRole = useCallback(
    (index: number) => {
      if (formData.jobRoles.length <= 1) {
        toast({ type: "error", message: "At least one job role is required" });
        return;
      }
      setFormData((prev) => ({
        ...prev,
        jobRoles: prev.jobRoles.filter((_, i) => i !== index),
      }));
    },
    [formData.jobRoles.length, toast]
  );

  // OTP handlers
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

  // Select options with enum mapping
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

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const clientPayload = {
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
      };

      const requirementPayload = {
        status: RequirementStatus.SUBMITTED,
        languages: [],
        jobRoles: formData.jobRoles.map((role) => ({
          title: role.title,
          quantity: role.quantity,
          nationality: role.nationality,
        })),
      };

      const clientResponse = await fetch("/api/auth/register/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientPayload),
      });

      if (!clientResponse.ok) {
        const errorData = await clientResponse.json();
        throw new Error(errorData.error || "Client registration failed");
      }

      const clientData = await clientResponse.json();

      if (!clientData.clientId || !clientData.userId) {
        throw new Error("Missing client or user ID in registration response");
      }
      const requirementResponse = await fetch("/api/requirements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...requirementPayload,
          clientId: clientData.clientId,
          userId: clientData.userId,
        }),
      });

      if (!requirementResponse.ok) {
        const errorData = await requirementResponse.json();
        throw new Error(errorData.error || "Requirement creation failed");
      }

      toast({
        type: "success",
        message:
          "Registration successful! Please check your email for temporary password.",
      });

      setFormData(initialFormData);
      setCurrentStep(1);
    } catch (error) {
      let errorMessage = "Registration failed";
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes("Email already in use")) {
          setErrors((prev) => ({ ...prev, email: "Email already in use" }));
        }
        if (error.message.includes("Phone number already in use")) {
          setErrors((prev) => ({
            ...prev,
            phone: "Phone number already in use",
          }));
        }
      }

      toast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [toast, initialFormData, formData]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-6">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">
                {t.companyProfile}
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
                  {t.phone}
                  {true && <span className="text-[#FF0404] ml-1">*</span>}
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
        );

      case 2:
        return (
          <Card className="p-6">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">{t.jobDetails}</h1>
              <p className="text-base text-gray-700 mb-2">
                {t.positionsNeeded}
              </p>
              <p className="text-xs text-gray-500 italic text-left">
                {t.sectionNoteJob}
              </p>
            </div>

            <div className="mt-6">
              <h2 className="text-3xl font-semibold mb-4 text-center">
                {t.jobRoles}
              </h2>
              <div className="rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#4C187A]/85">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/2">
                        {t.jobRole}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">
                        {t.quantity}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/4">
                        {t.nationality}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#2C0053]/10 divide-y divide-gray-200">
                    {formData.jobRoles.map((role, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            name={`jobRoles[${index}].title`}
                            value={role.title}
                            onChange={(e) => handleJobRoleChange(index, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                          >
                            <option value="">{t.selectOption}</option>
                            {t.jobPositions
                              ?.filter(
                                (job) =>
                                  !formData.jobRoles.some(
                                    (r, i) => r.title === job && i !== index
                                  )
                              )
                              .map((job) => (
                                <option key={job} value={job}>
                                  {job}
                                </option>
                              ))}
                          </select>
                          {errors[`jobRoles[${index}].title`] && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors[`jobRoles[${index}].title`]}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            name={`jobRoles[${index}].quantity`}
                            value={role.quantity}
                            onChange={(e) => handleJobRoleChange(index, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                          />
                          {errors[`jobRoles[${index}].quantity`] && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors[`jobRoles[${index}].quantity`]}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <AutocompleteInput
                            name={`jobRoles[${index}].nationality`}
                            value={role.nationality || ""}
                            onChangeValue={(val: string) =>
                              handleJobRoleChange(index, {
                                target: {
                                  name: `jobRoles[${index}].nationality`,
                                  value: val,
                                },
                              } as React.ChangeEvent<HTMLInputElement>)
                            }
                            options={t.nationalityOptions || []}
                            placeholder="Type nationality..."
                            className="w-full"
                          />
                          {errors[`jobRoles[${index}].nationality`] && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors[`jobRoles[${index}].nationality`]}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => removeJobRole(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 text-left">
                <Button
                  type="button"
                  variant="default"
                  onClick={addJobRole}
                  className="mr-4"
                >
                  {t.addAnotherRole}
                </Button>
              </div>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-6">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">{t.reviewTitle}</h1>
              <p className="text-base text-gray-700 mb-2">{t.verifyInfo}</p>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-6">
              <div className="col-span-6 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    {t.companyInformation}
                  </h2>
                  <ReviewField
                    label={t.companyName}
                    value={formData.companyName}
                  />
                  <ReviewField
                    label={t.registrationNumber}
                    value={formData.registrationNumber}
                  />
                  <ReviewField
                    label={t.sector}
                    value={
                      displaySectorMapping[formData.sector as CompanySector] ||
                      formData.sector
                    }
                  />
                  <ReviewField
                    label={t.companySize}
                    value={
                      displayCompanySizeMapping[
                        formData.companySize as CompanySize
                      ] || formData.companySize
                    }
                  />
                  <ReviewField
                    label={t.website}
                    value={formData.website || t.notProvided}
                  />
                  <ReviewField label={t.address} value={formData.address} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    {t.contactPerson}
                  </h2>
                  <ReviewField label={t.fullName} value={formData.fullName} />
                  <ReviewField label={t.jobTitle} value={formData.jobTitle} />
                  <ReviewField
                    label={t.email}
                    value={`${formData.email} ${formData.emailVerified ? "(Verified)" : ""}`}
                  />
                  <ReviewField
                    label={t.phone}
                    value={`${formData.countryCode}${formData.phone} ${formData.phoneVerified ? "(Verified)" : ""}`}
                  />
                  <ReviewField
                    label={t.altContact}
                    value={
                      formData.altContact
                        ? `${formData.altCountryCode}${formData.altContact}`
                        : t.notProvided
                    }
                  />
                </div>
              </div>

              <div className="col-span-6 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    {t.jobDetails}
                  </h2>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {t.jobRoles}:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Qty
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nationality
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {formData.jobRoles.map((role, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {role.title}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {role.quantity}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {role.nationality || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
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

        <div className="relative px-16 pt-10 pb-6">
          <div className="absolute inset-x-0 top-1/2 h-0.5 z-0">
            <div className="absolute -left-44 right-0 h-full flex w-full max-w-[1380px] mx-auto">
              <div
                className="h-full bg-[#2C0053] transition-all duration-300"
                style={{
                  width:
                    currentStep === 1
                      ? "calc(20% - 75px)"
                      : solidWidths[currentStep as keyof typeof solidWidths] ||
                        "100%",
                }}
              />

              <div
                className="h-full border-t-2 border-dotted border-gray-300 transition-all duration-300"
                style={{
                  width:
                    currentStep === 1
                      ? `calc(100% - 60px)`
                      : `calc(${
                          100 - ((currentStep - 1) / (steps.length - 1)) * 100
                        }% + 60px)`,
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
          <div className="col-span-12 mt-6 flex justify-start">
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                variant="outline"
                className="px-8 py-2 mr-10"
              >
                {t.back}
              </Button>
            )}

            <Button
              type="button"
              onClick={currentStep === steps.length ? handleSubmit : handleNext}
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
              ) : currentStep === steps.length ? (
                t.submit
              ) : (
                t.continue
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewField({ label, value }: ReviewFieldProps) {
  return (
    <div className="mb-3">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-sm text-gray-600 mt-1">{value || "-"}</p>
    </div>
  );
}
