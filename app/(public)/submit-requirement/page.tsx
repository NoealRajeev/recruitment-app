"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useCallback, useMemo } from "react";
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
  ContractDuration,
  PreviousExperience,
  TicketDetails,
} from "@/lib/generated/prisma";
import {
  getSectorEnumMapping,
  getCompanySizeEnumMapping,
  getDisplaySectorMapping,
  getDisplayCompanySizeMapping,
  getContractDurationEnumMapping,
  getDisplayContractDurationMapping,
  getDisplayPreviousExperienceMapping,
  getDisplayTicketDetailsMapping,
  getPreviousExperienceEnumMapping,
  getTicketDetailsEnumMapping,
} from "@/lib/utils/enum-mappings";

interface JobRole {
  title: string;
  quantity: number;
  nationality: string;
  salary: string;
}

interface FormData {
  companyName: string;
  registrationNumber: string;
  sector: CompanySector | "";
  companySize: CompanySize | "";
  website: string;
  address: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  altContact: string;
  jobRoles: JobRole[];
  projectLocation: string;
  startDate: string;
  contractDuration: ContractDuration | "";
  languageRequirements: string[];
  previousExperience: PreviousExperience | "";
  ticketDetails: TicketDetails | "";
  totalExperienceYears?: number;
  preferredAge?: number;
  specialRequirements: string;
}

interface Errors {
  [key: string]: string;
}
interface ReviewFieldProps {
  label: string;
  value: string;
}

export default function SubmitRequirement() {
  const { language, setLanguage, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCheckInProgress, setEmailCheckInProgress] = useState(false);
  const [languageOptions, setLanguageOptions] = useState<string[]>(
    t.languageOptions || []
  );
  const [newLanguage, setNewLanguage] = useState("");
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
  const contractDurationMapping = useMemo(
    () => getContractDurationEnumMapping(language),
    [language]
  );
  const ticketDetailsMapping = useMemo(
    () => getTicketDetailsEnumMapping(language),
    [language]
  );
  const previousExperienceMapping = useMemo(
    () => getPreviousExperienceEnumMapping(language),
    [language]
  );

  const displayContractDurationMapping = useMemo(
    () => getDisplayContractDurationMapping(language),
    [language]
  );
  const displayTicketDetailsMapping = useMemo(
    () => getDisplayTicketDetailsMapping(language),
    [language]
  );
  const displayPreviousExperienceMapping = useMemo(
    () => getDisplayPreviousExperienceMapping(language),
    [language]
  );

  // Update your options
  const contractDurationOptions = useMemo(
    () =>
      t.contractDurationOptions?.map((opt) => ({
        value:
          contractDurationMapping[opt] ||
          opt.toLowerCase().replace(/\s+/g, "-"),
        label: opt,
      })) || [],
    [t.contractDurationOptions, contractDurationMapping]
  );

  const ticketDetailsOptions = useMemo(
    () =>
      t.ticketDetailsOptions?.map((opt) => ({
        value:
          ticketDetailsMapping[opt] || opt.toLowerCase().replace(/\s+/g, "-"),
        label: opt,
      })) || [],
    [t.ticketDetailsOptions, ticketDetailsMapping]
  );

  const previousExperienceOptions = useMemo(
    () =>
      t.previousExperienceOptions?.map((opt) => ({
        value:
          previousExperienceMapping[opt] ||
          opt.toLowerCase().replace(/\s+/g, "-"),
        label: opt,
      })) || [],
    [t.previousExperienceOptions, previousExperienceMapping]
  );

  const initialFormData: FormData = useMemo(
    () => ({
      companyName: "",
      registrationNumber: "",
      sector: "",
      companySize: "",
      website: "",
      address: "",
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      altContact: "",
      contractDuration: "",
      jobRoles: [
        {
          title: "",
          quantity: 1,
          nationality: "",
          salary: "",
        },
      ],
      projectLocation: "",
      startDate: "",
      languageRequirements: [],
      previousExperience: "",
      ticketDetails: "",
      specialRequirements: "",
    }),
    []
  );

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Errors>({});

  const steps = t.steps;

  // Solid widths for progress bar
  const solidWidths: Record<number, string> = {
    2: "calc(33.33% + 220px)",
    3: "calc(66.66% + 260px)",
    4: "2800px",
  };

  // Validation functions
  const validateRegistrationNumber = useCallback((value: string): boolean => {
    const regex = /^[A-Za-z0-9]{8,15}$/;
    return regex.test(value);
  }, []);

  const checkEmailAvailability = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        return data.available;
      } catch (error) {
        console.error("Email check failed:", error);
        return false;
      }
    },
    []
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
      address: "Address is required",
      fullName: t.required,
      jobTitle: t.required,
      email: /^\S+@\S+\.\S+$/.test(formData.email) ? "" : t.invalidEmail,
      phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
        formData.phone
      )
        ? ""
        : t.invalidPhone,
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field as keyof FormData]) {
        newErrors[field] = message || t.required;
      }
    });

    if (!newErrors.email && formData.email) {
      try {
        setEmailCheckInProgress(true);
        const isAvailable = await checkEmailAvailability(formData.email);
        if (!isAvailable) newErrors.email = t.emailInUse;
      } catch (error) {
        toast({
          type: "error",
          message: error instanceof Error ? error.message : "Submission failed",
        });
      } finally {
        setEmailCheckInProgress(false);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t, validateRegistrationNumber, checkEmailAvailability, toast]);

  const validateStep2 = useCallback((): boolean => {
    const newErrors: Errors = {};
    if (
      formData.jobRoles.some(
        (role) => !role.title.trim() || !role.salary.trim()
      )
    ) {
      newErrors.jobRoles = t.required;
    }
    if (!formData.projectLocation.trim())
      newErrors.projectLocation = t.required;
    if (!formData.startDate) newErrors.startDate = t.required;
    if (!formData.contractDuration) newErrors.contractDuration = t.required;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const validateStep3 = useCallback((): boolean => {
    const newErrors: Errors = {};
    if (formData.languageRequirements.length === 0)
      newErrors.languageRequirements = t.required;
    if (!formData.previousExperience) newErrors.previousExperience = t.required;
    if (!formData.ticketDetails) newErrors.ticketDetails = t.required;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  // Navigation handlers
  const handleNext = useCallback(async () => {
    let isValid = false;

    if (currentStep === 1) isValid = await validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else if (currentStep === 3) isValid = validateStep3();

    if (!isValid) {
      const firstError = Object.values(errors)[0];
      toast({ type: "error", message: firstError || "Please fix the errors." });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      setIsSubmitting(false);
    }, 800);
  }, [
    currentStep,
    validateStep1,
    validateStep2,
    validateStep3,
    errors,
    toast,
    steps.length,
  ]);

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
          [name.replace(`jobRoles[${index}].`, "")]: value,
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
        { title: "", quantity: 1, nationality: "", salary: "" },
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

  // Language requirements management
  const toggleLanguageRequirement = useCallback((language: string) => {
    setFormData((prev) => {
      const exists = prev.languageRequirements.includes(language);
      const updated = exists
        ? prev.languageRequirements.filter((l) => l !== language)
        : [...prev.languageRequirements, language];
      return { ...prev, languageRequirements: updated };
    });
  }, []);

  const handleAddLanguage = useCallback(() => {
    const trimmedLang = newLanguage.trim();
    if (!trimmedLang) return;

    if (!languageOptions.includes(trimmedLang)) {
      setLanguageOptions((prev) => [...prev, trimmedLang]);
    }

    if (!formData.languageRequirements.includes(trimmedLang)) {
      setFormData((prev) => ({
        ...prev,
        languageRequirements: [...prev.languageRequirements, trimmedLang],
      }));
    }

    setNewLanguage("");
  }, [newLanguage, languageOptions, formData.languageRequirements]);

  // Form submission
  const handleSubmit = useCallback(async () => {
    if (currentStep !== steps.length) return;

    console.log("Form submitted:", formData);
    setIsSubmitting(true);

    try {
      // Step 1: Create client account
      const accountResponse = await fetch("/api/auth/register/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          companyName: formData.companyName.trim(),
          registrationNumber: formData.registrationNumber.trim(),
          address: formData.address.trim(),
          fullName: formData.fullName.trim(),
          jobTitle: formData.jobTitle.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          altContact: formData.altContact?.trim() || "",
          website: formData.website?.trim() || "",
        }),
      });

      if (!accountResponse.ok) {
        const errorData = await accountResponse.json();
        throw new Error(errorData.message || "Account creation failed");
      }

      const accountData = await accountResponse.json();
      const clientId = accountData.clientId;

      // Step 2: Create requirement with all job roles
      const requirementResponse = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          projectLocation: formData.projectLocation.trim(),
          startDate: formData.startDate,
          specialNotes: formData.specialRequirements.trim(),
          status: "SUBMITTED",
          clientId: clientId,
          jobRoles: formData.jobRoles.map((role) => ({
            title: role.title.trim(),
            quantity: Number(role.quantity),
            nationality: role.nationality.trim(),
            salary: role.salary.trim(),
          })),
          // Convert display values to enum values where needed
          contractDuration: formData.contractDuration,
          previousExperience: formData.previousExperience,
          ticketDetails: formData.ticketDetails,
          totalExperienceYears: formData.totalExperienceYears || null,
          preferredAge: formData.preferredAge || null,
        }),
      });

      if (!requirementResponse.ok) {
        const errorData = await requirementResponse.json();
        throw new Error(errorData.error || "Requirement submission failed");
      }

      toast({
        type: "success",
        message: "Account created and requirement submitted successfully!",
      });

      setFormData(initialFormData);
      setCurrentStep(1);
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        type: "error",
        message: error instanceof Error ? error.message : "Submission failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, steps.length, formData, toast, initialFormData]);

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

            <div className="grid grid-cols-12 gap-8 mt-6">
              <div className="col-span-6">
                <h2 className="text-3xl font-semibold mb-4 text-center">
                  {t.jobRoles}
                </h2>
                <div className="rounded-lg shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#4C187A]/85">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-2/5">
                          {t.jobRole}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">
                          {t.quantity}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          {t.nationality}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Salary/Month
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          {t.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#2C0053]/10 divide-y divide-gray-200">
                      {formData.jobRoles.map((role, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 w-2/5 whitespace-nowrap">
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
                          </td>
                          <td className="px-6 py-4 w-1/6 whitespace-nowrap">
                            <input
                              type="number"
                              min="1"
                              name={`jobRoles[${index}].quantity`}
                              value={role.quantity}
                              onChange={(e) => handleJobRoleChange(index, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                            />
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              name={`jobRoles[${index}].salary`}
                              value={role.salary || ""}
                              onChange={(e) => handleJobRoleChange(index, e)}
                              placeholder="Salary amount"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onClick={() => removeJobRole(index)}>
                              <Trash2 />
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

              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[2px] h-2/3 bg-[#2C0053]/30 rounded-full"></div>
              </div>

              <div className="col-span-4 space-y-6">
                <div>
                  <Select
                    name="contractDuration"
                    value={formData.contractDuration}
                    onChange={handleChange}
                    required
                    className="w-full"
                    label="Contract Duration"
                    error={errors.contractDuration}
                    options={contractDurationOptions}
                  />
                </div>
                <div>
                  <Input
                    name="projectLocation"
                    value={formData.projectLocation}
                    onChange={handleChange}
                    placeholder={t.projectLocationPlaceholder}
                    required
                    className="w-full"
                    label={t.projectLocation}
                    error={errors.projectLocation}
                    id="location"
                  />
                </div>
                <div>
                  <Input
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    type="date"
                    required
                    className="w-full"
                    label={t.startDate}
                    error={errors.startDate}
                    id="date"
                  />
                </div>
              </div>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-6">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">
                {t.workerRequirements}
              </h1>
              <p className="text-base text-gray-700 mb-2">{t.specifySkills}</p>
              <p className="text-xs text-gray-500 italic text-left">
                {t.sectionNoteRequirements}
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-6">
              <div className="col-span-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.languageRequirements}
                    <span className="text-[#FF0404] ml-1">*</span>
                  </label>

                  {errors.languageRequirements && (
                    <p className="text-sm text-[#FF0404] mb-2">
                      {errors.languageRequirements}
                    </p>
                  )}

                  <div className="space-y-2 mb-3">
                    {languageOptions.map((language) => (
                      <div key={language} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`lang-${language}`}
                          checked={formData.languageRequirements.includes(
                            language
                          )}
                          onChange={() => toggleLanguageRequirement(language)}
                          className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`lang-${language}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {language}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddLanguage();
                        }
                      }}
                      placeholder="Add another language"
                      className="w-full"
                    />
                  </div>
                </div>
                <Select
                  label="Previous Experience"
                  name="previousExperience"
                  value={formData.previousExperience}
                  onChange={handleChange}
                  error={errors.previousExperience}
                  required
                  options={previousExperienceOptions}
                />
                <Input
                  label="Total Experience Years (optional)"
                  name="totalExperienceYears"
                  value={formData.totalExperienceYears || ""}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  placeholder="e.g., 5 Years"
                />
              </div>

              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[2px] h-2/3 bg-[#2C0053]/30 rounded-full"></div>
              </div>

              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">
                  {t.additionalRequirements}
                </h2>

                <Input
                  label="Preferred Age (optional)"
                  name="preferredAge"
                  value={formData.preferredAge || ""}
                  onChange={handleChange}
                  type="number"
                  min="18"
                  placeholder="e.g., 30 Years old"
                  // description="±5 years will be considered"
                />

                <Select
                  label="Ticket Details"
                  name="ticketDetails"
                  value={formData.ticketDetails}
                  onChange={handleChange}
                  error={errors.ticketDetails}
                  required
                  options={ticketDetailsOptions}
                />

                <div>
                  <label
                    htmlFor="specialRequirements"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t.specialRequirements}
                  </label>
                  <textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C0053] focus:border-[#2C0053] bg-white"
                    placeholder={t.specialRequirementsPlaceholder}
                  />
                </div>
              </div>
            </div>
          </Card>
        );

      case 4:
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
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    {t.contactPerson}
                  </h2>
                  <ReviewField label={t.fullName} value={formData.fullName} />
                  <ReviewField label={t.jobTitle} value={formData.jobTitle} />
                  <ReviewField label={t.email} value={formData.email} />
                  <ReviewField label={t.phone} value={formData.phone} />
                  <ReviewField
                    label={t.altContact}
                    value={formData.altContact || t.notProvided}
                  />
                </div>
              </div>

              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[2px] h-2/3 bg-[#2C0053]/30 rounded-full"></div>
              </div>

              <div className="col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    {t.jobDetails}
                  </h2>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      {t.jobRoles}:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      {formData.jobRoles.map((role, index) => (
                        <li key={index}>
                          {role.title} ({t.quantity}: {role.quantity}, Salary:{" "}
                          {role.salary})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <ReviewField
                    label={t.projectLocation}
                    value={formData.projectLocation}
                  />
                  <ReviewField label={t.startDate} value={formData.startDate} />
                  <ReviewField
                    label="Contract Duration"
                    value={
                      displayContractDurationMapping[
                        formData.contractDuration as ContractDuration
                      ] || formData.contractDuration
                    }
                  />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    {t.requirements}
                  </h2>
                  <ReviewField
                    label={t.languagesRequired}
                    value={formData.languageRequirements.join(", ")}
                  />
                  <ReviewField
                    label="Previous Experience"
                    value={formData.previousExperience}
                  />
                  <ReviewField
                    label="Ticket Details"
                    value={
                      displayTicketDetailsMapping[
                        formData.ticketDetails as TicketDetails
                      ] || formData.ticketDetails
                    }
                  />

                  <ReviewField
                    label="Previous Experience"
                    value={
                      displayPreviousExperienceMapping[
                        formData.previousExperience as PreviousExperience
                      ] || formData.previousExperience
                    }
                  />
                  <ReviewField
                    label="Total Experience Years"
                    value={
                      formData.totalExperienceYears?.toString() ||
                      t.noneSpecified
                    }
                  />
                  <ReviewField
                    label="Preferred Age"
                    value={formData.preferredAge?.toString() || t.noneSpecified}
                  />
                  <ReviewField
                    label={t.specialRequirements}
                    value={formData.specialRequirements || t.noneSpecified}
                  />
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
                      ? "calc(20% - 35px)"
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
      <p className="text-sm text-gray-600 mt-1">{value}</p>
    </div>
  );
}
