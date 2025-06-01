"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/shared/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { useLanguage } from "@/context/LanguageContext";
import { format } from "date-fns";
import {
  ContractDuration,
  PreviousExperience,
  TicketDetails,
} from "@/lib/generated/prisma";
import {
  getContractDurationEnumMapping,
  getDisplayContractDurationMapping,
  getDisplayPreviousExperienceMapping,
  getDisplayTicketDetailsMapping,
  getPreviousExperienceEnumMapping,
  getTicketDetailsEnumMapping,
} from "@/lib/utils/enum-mappings";
import { Select } from "@/components/ui/select";
import { useToast } from "@/context/toast-provider";

interface JobRole {
  title: string;
  quantity: number;
  nationality: string;
  salary: string;
}

interface FormData {
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

interface Requirement {
  id: string;
  jobRoles: JobRole[];
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "FULFILLED"
    | "CLOSED";
  createdAt: string;
  startDate: string | null;
  projectLocation: string;
  contractDuration: ContractDuration | null;
  languageRequirements: string[];
  previousExperience: PreviousExperience | null;
  ticketDetails: TicketDetails | null;
  totalExperienceYears: number | null;
  preferredAge: number | null;
  specialRequirements: string;
  client: {
    companyName: string;
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
  };
}

interface ReviewFieldProps {
  label: string;
  value: string;
}

function ReviewField({ label, value }: ReviewFieldProps) {
  return (
    <div className="mb-3">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-sm text-gray-600 mt-1">{value || "Not specified"}</p>
    </div>
  );
}

export default function Requirements() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [languageOptions, setLanguageOptions] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const { toast } = useToast();
  const [editingRequirement, setEditingRequirement] =
    useState<Requirement | null>(null); // Moved declaration up
  const { language, setLanguage, t } = useLanguage();

  // Memoize enum mappings based on language
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
      contractDuration: "",
      languageRequirements: [],
      previousExperience: "",
      ticketDetails: "",
      specialRequirements: "",
    }),
    []
  );

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Errors>({});

  const steps = [
    { id: 1, label: t.jobDetails || "Job Details" },
    { id: 2, label: t.requirements || "Requirements" },
    { id: 3, label: t.reviewTitle || "Review" },
  ];

  const solidWidths: Record<number, string> = {
    2: "calc(50% + 340px)",
    3: "2800px",
  };

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const response = await fetch("/api/requirements");
        if (response.ok) {
          const data = await response.json();
          const requirementsWithJobRoles = data.map((req: Requirement) => ({
            ...req,
            jobRoles: req.jobRoles || [], // Default to empty array if undefined
            languageRequirements: req.languageRequirements || [], // Also handle this if needed
          }));
          setRequirements(requirementsWithJobRoles);
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, []);

  const checkForChanges = useCallback(() => {
    if (editingRequirement && editingRequirement.status !== "DRAFT") {
      return false;
    }
    const initialState = JSON.stringify(initialFormData);
    const currentState = JSON.stringify(formData);
    return currentState !== initialState;
  }, [formData, editingRequirement, initialFormData]); // Added initialFormData to dependencies

  useEffect(() => {
    setHasChanges(checkForChanges());
  }, [formData, checkForChanges]);

  const handleOpenModal = (requirement?: Requirement) => {
    if (requirement) {
      // Load existing requirement data
      setEditingRequirement(requirement);
      setIsViewMode(requirement.status !== "DRAFT");

      setFormData({
        jobRoles: requirement.jobRoles.map((role) => ({
          title: role.title,
          quantity: role.quantity,
          nationality: role.nationality,
          salary: role.salary || "",
        })),
        projectLocation: requirement.projectLocation,
        startDate: requirement.startDate || "",
        contractDuration: requirement.contractDuration || "",
        languageRequirements: requirement.languageRequirements || [],
        previousExperience: requirement.previousExperience || "",
        ticketDetails: requirement.ticketDetails || "",
        totalExperienceYears: requirement.totalExperienceYears || undefined,
        preferredAge: requirement.preferredAge || undefined,
        specialRequirements: requirement.specialRequirements,
      });

      // If not draft, go directly to review step
      if (requirement.status !== "DRAFT") {
        setCurrentStep(3);
      } else {
        setCurrentStep(1);
      }
    } else {
      // New requirement
      setEditingRequirement(null);
      setIsViewMode(false);
      setFormData(initialFormData);
      setCurrentStep(1);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (
      hasChanges &&
      (!editingRequirement || editingRequirement.status === "DRAFT")
    ) {
      if (confirm("You have unsaved changes. Save as draft?")) {
        saveAsDraft();
      } else {
        resetAndCloseModal();
      }
    } else {
      resetAndCloseModal();
    }
  };

  const saveAsDraft = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        projectLocation: formData.projectLocation || null,
        startDate: formData.startDate || null,
        contractDuration: formData.contractDuration || null,
        previousExperience: formData.previousExperience || null,
        totalExperienceYears: formData.totalExperienceYears || null,
        preferredAge: formData.preferredAge || null,
        specialNotes: formData.specialRequirements || null,
        status: "DRAFT",
        languages: formData.languageRequirements || [],
        jobRoles: formData.jobRoles.map((role) => ({
          title: role.title || "",
          quantity: role.quantity || 1,
          nationality: role.nationality || "",
          salary: role.salary || "",
        })),
        ticketDetails: formData.ticketDetails || null,
        id: editingRequirement?.id,
      };

      const response = await fetch("/api/requirements", {
        method: editingRequirement ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedRequirement = await response.json();
        const requirementWithRoles = {
          ...savedRequirement,
          jobRoles: savedRequirement.jobRoles || formData.jobRoles,
        };

        if (editingRequirement) {
          setRequirements((prev) =>
            prev.map((req) =>
              req.id === requirementWithRoles.id ? requirementWithRoles : req
            )
          );
        } else {
          setRequirements((prev) => [requirementWithRoles, ...prev]);
        }
        resetAndCloseModal();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to save draft",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndCloseModal = () => {
    setFormData(initialFormData);
    setIsModalOpen(false);
    setEditingRequirement(null);
    setCurrentStep(1);
  };

  const validateStep1 = (isDraft: boolean): boolean => {
    const newErrors: Errors = {};

    if (!isDraft) {
      if (formData.jobRoles.some((role) => !role.title || !role.salary))
        newErrors.jobRoles = t.required || "Required";
      if (!formData.projectLocation)
        newErrors.projectLocation = t.required || "Required";
      if (!formData.startDate) newErrors.startDate = t.required || "Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (isDraft: boolean): boolean => {
    const newErrors: Errors = {};
    if (!isDraft) {
      if (formData.languageRequirements.length === 0)
        newErrors.languageRequirements = t.required || "Required";
      if (!formData.previousExperience)
        newErrors.previousExperience = t.required || "Required";
      if (!formData.ticketDetails)
        newErrors.ticketDetails = t.required || "Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    let isValid = true;
    const isDraft = false;

    if (currentStep === 1) isValid = validateStep1(isDraft);
    if (currentStep === 2) isValid = validateStep2(isDraft);

    if (!isValid) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      setIsSubmitting(false);
    }, 800);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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

  const handleJobRoleChange = (
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
  };

  const addJobRole = () => {
    setFormData((prev) => ({
      ...prev,
      jobRoles: [
        ...prev.jobRoles,
        {
          title: "",
          quantity: 1,
          nationality: "",
          salary: "",
        },
      ],
    }));
  };

  const removeJobRole = (index: number) => {
    if (formData.jobRoles.length <= 1) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      jobRoles: prev.jobRoles.filter((_, i) => i !== index),
    }));
  };

  const toggleLanguageRequirement = (language: string) => {
    setFormData((prev) => {
      const exists = prev.languageRequirements.includes(language);
      const updated = exists
        ? prev.languageRequirements.filter((l) => l !== language)
        : [...prev.languageRequirements, language];
      return { ...prev, languageRequirements: updated };
    });
  };

  const handleAddLanguage = () => {
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
  };

  const handleSubmit = async () => {
    const isDraft = false; // This is a final submission, not a draft
    const step1Valid = validateStep1(isDraft);
    const step2Valid = validateStep2(isDraft);

    if (!step1Valid || !step2Valid) {
      toast({
        type: "error",
        message: "Please fix all errors before submitting",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        projectLocation: formData.projectLocation,
        startDate: formData.startDate,
        contractDuration: formData.contractDuration,
        previousExperience: formData.previousExperience,
        totalExperienceYears: formData.totalExperienceYears,
        preferredAge: formData.preferredAge,
        specialNotes: formData.specialRequirements,
        status: "SUBMITTED",
        languages: formData.languageRequirements,
        jobRoles: formData.jobRoles.map((role) => ({
          title: role.title,
          quantity: role.quantity,
          nationality: role.nationality,
          salary: role.salary,
        })),
        ticketDetails: formData.ticketDetails,
        id: editingRequirement?.id,
      };

      const response = await fetch("/api/requirements", {
        method: editingRequirement ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedRequirement = await response.json();
        const requirementWithRoles = {
          ...savedRequirement,
          jobRoles: savedRequirement.jobRoles || formData.jobRoles,
        };
        if (editingRequirement) {
          setRequirements((prev) =>
            prev.map((req) =>
              req.id === requirementWithRoles.id ? requirementWithRoles : req
            )
          );
        } else {
          setRequirements((prev) => [savedRequirement, ...prev]);
        }
        resetAndCloseModal();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit requirement");
      }
    } catch (error) {
      console.error("Error submitting requirement:", error);
      toast({
        type: "error",
        message: error instanceof Error ? error.message : "Submission failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
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
                              disabled={isViewMode}
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
                              disabled={isViewMode}
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
                              disabled={isViewMode}
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
                              disabled={isViewMode}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {!isViewMode && (
                              <button onClick={() => removeJobRole(index)}>
                                <Trash2 />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!isViewMode && (
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
                )}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
                  />
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
                          disabled={isViewMode}
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

                  {!isViewMode && (
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
                  )}
                </div>
                <Select
                  label="Previous Experience"
                  name="previousExperience"
                  value={formData.previousExperience}
                  onChange={handleChange}
                  error={errors.previousExperience}
                  required
                  options={previousExperienceOptions}
                  disabled={isViewMode}
                />
                <Input
                  label="Total Experience Years (optional)"
                  name="totalExperienceYears"
                  value={formData.totalExperienceYears || ""}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  placeholder="e.g., 5 Years"
                  disabled={isViewMode}
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
                  disabled={isViewMode}
                />

                <Select
                  label="Ticket Details"
                  name="ticketDetails"
                  value={formData.ticketDetails}
                  onChange={handleChange}
                  error={errors.ticketDetails}
                  required
                  options={ticketDetailsOptions}
                  disabled={isViewMode}
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
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-6">
            <div className="text-center mb-0">
              <h1 className="text-2xl font-semibold mb-1">{t.reviewTitle}</h1>
              <p className="text-base text-gray-700 mb-2">{t.verifyInfo}</p>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-6">
              <div className="col-span-6 space-y-6">
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
              </div>

              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[2px] h-2/3 bg-[#2C0053]/30 rounded-full"></div>
              </div>

              <div className="col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    {t.requirements}
                  </h2>
                  <ReviewField
                    label={t.languagesRequired}
                    value={
                      formData.languageRequirements &&
                      formData.languageRequirements.length > 0
                        ? formData.languageRequirements.join(", ")
                        : "None specified"
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
                    label="Ticket Details"
                    value={
                      displayTicketDetailsMapping[
                        formData.ticketDetails as TicketDetails
                      ] || formData.ticketDetails
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

  const AddCard = () => (
    <div
      onClick={() => handleOpenModal()}
      className="bg-[#EDDDF3]/60 rounded-xl p-6 shadow-sm cursor-pointer hover:bg-[#EDDDF3] transition-colors flex items-center justify-center min-h-[140px] border-2 border-dashed border-purple-300"
    >
      <Plus className="w-12 h-12 text-[#150B3D]" />
    </div>
  );

  const RequirementCard = ({ requirement }: { requirement: Requirement }) => {
    const statusMap = {
      DRAFT: { text: "Draft", color: "text-gray-500" },
      SUBMITTED: { text: "Submitted", color: "text-blue-600" },
      UNDER_REVIEW: { text: "Under Review", color: "text-yellow-600" },
      APPROVED: { text: "Approved", color: "text-green-600" },
      REJECTED: { text: "Rejected", color: "text-red-600" },
      FULFILLED: { text: "Fulfilled", color: "text-purple-600" },
      CLOSED: { text: "Closed", color: "text-gray-600" },
    };

    const statusInfo = statusMap[requirement.status] || statusMap.DRAFT;
    const formattedDate = format(
      new Date(requirement.createdAt),
      "MMM d, yyyy"
    );

    return (
      <div
        onClick={() => handleOpenModal(requirement)}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative cursor-pointer"
      >
        <div className="absolute top-4 right-4 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
          <ArrowUpRight className="text-gray-500" />
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-600">Request ID:</span>
            <span className="ml-2 text-sm text-gray-400">
              {requirement.id.substring(0, 8).toUpperCase()}
            </span>
          </div>

          <div>
            <span className="text-sm text-gray-600">Date:</span>
            <span className="ml-2 text-sm text-gray-400">{formattedDate}</span>
          </div>

          <div>
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`ml-2 text-sm ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>

          <div>
            <span className="text-sm text-gray-600">Roles:</span>
            <span className="ml-2 text-sm text-gray-400">
              {requirement.jobRoles && requirement.jobRoles.length > 0
                ? requirement.jobRoles
                    .map((role) => `${role.title} (${role.quantity})`)
                    .join(", ")
                : "No roles specified"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const modalTitle = editingRequirement
    ? isViewMode
      ? "View Requirement"
      : "Edit Draft Requirement"
    : "Submit New Requirement";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#150B3D] mb-8">Requirements</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading requirements...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <AddCard />
            {requirements.map((requirement) => (
              <RequirementCard key={requirement.id} requirement={requirement} />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        size="7xl"
        showFooter={!isViewMode}
        onConfirm={currentStep === steps.length ? handleSubmit : handleNext}
        confirmText={
          currentStep === steps.length
            ? editingRequirement
              ? "Update"
              : "Submit"
            : "Continue"
        }
        confirmVariant="default"
        isLoading={isSubmitting}
        className="w-full max-w-[90vw] h-[calc(100vh-40px)] flex flex-col"
      >
        <div className="flex flex-col h-full relative">
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
              <div className="absolute -left-44 right-0 h-full flex w-full max-w-[1555px] mx-auto">
                <div
                  className="h-full bg-[#2C0053] transition-all duration-300"
                  style={{
                    width:
                      currentStep === 1
                        ? "calc(20% - 75px)"
                        : solidWidths[
                            currentStep as keyof typeof solidWidths
                          ] || "100%",
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
                      currentStep >= step.id
                        ? "text-[#2C0053]"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-2">
            {renderStepContent()}
            {currentStep > 1 && !isViewMode && (
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
          </div>
        </div>
      </Modal>
    </div>
  );
}
