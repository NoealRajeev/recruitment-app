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
  ExperienceLevel,
  RequirementStatus,
  TicketType,
} from "@/lib/generated/prisma";
import { getContractDurationEnumMapping } from "@/lib/utils/enum-mappings";
import { useToast } from "@/context/toast-provider";

interface JobRole {
  id?: string;
  title: string;
  quantity: number;
  nationality: string;
  salary: string;
  salaryCurrency: string;
  startDate: string;
  contractDuration: ContractDuration | "";
}

interface FormData {
  jobRoles: JobRole[];
  contractDuration: ContractDuration | "";
  languageRequirements: string[];
  minExperience?: ExperienceLevel | "";
  maxAge?: number;
  specialRequirements: string;
  ticketType?: TicketType | "";
  ticketProvided?: boolean;
}

interface Requirement {
  id: string;
  jobRoles: JobRole[];
  status: RequirementStatus;
  createdAt: string;
  contractDuration: ContractDuration | null;
  languageRequirements: string[];
  minExperience: ExperienceLevel | null;
  maxAge: number | null;
  specialNotes: string | null;
  ticketType: TicketType | null;
  ticketProvided: boolean;
  client: {
    companyName: string;
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
  };
}

interface Errors {
  [key: string]: string;
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
    useState<Requirement | null>(null);
  const { language, setLanguage, t } = useLanguage();

  // Memoize enum mappings based on language
  const contractDurationMapping = useMemo(
    () => getContractDurationEnumMapping(language),
    [language]
  );

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

  const experienceLevelOptions = useMemo(
    () => [
      { value: "FRESH", label: "Fresh" },
      { value: "ONE_YEAR", label: "1 Year" },
      { value: "TWO_YEARS", label: "2 Years" },
      { value: "THREE_YEARS", label: "3 Years" },
      { value: "FOUR_YEARS", label: "4 Years" },
      { value: "FIVE_PLUS_YEARS", label: "5+ Years" },
    ],
    []
  );

  const ticketTypeOptions = useMemo(
    () => [
      { value: "ONE_WAY", label: "One Way" },
      { value: "TWO_WAY", label: "Two Way" },
      { value: "NONE", label: "None" },
    ],
    []
  );

  const initialFormData: FormData = useMemo(
    () => ({
      jobRoles: [
        {
          title: "",
          quantity: 1,
          nationality: "",
          salary: "",
          salaryCurrency: "QAR",
          startDate: "",
          contractDuration: "",
        },
      ],
      projectLocation: "",
      startDate: "",
      contractDuration: "",
      languageRequirements: [],
      minExperience: "",
      maxAge: undefined,
      specialRequirements: "",
      ticketType: "",
      ticketProvided: false,
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
        setLoading(true);
        const response = await fetch("/api/requirements");
        if (response.ok) {
          const data = await response.json();
          const requirementsWithJobRoles = data.map((req: Requirement) => ({
            ...req,
            jobRoles: req.jobRoles || [],
            languageRequirements: req.languageRequirements || [],
          }));
          setRequirements(requirementsWithJobRoles);
        } else {
          throw new Error("Failed to fetch requirements");
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);
        toast({
          type: "error",
          message: "Failed to load requirements. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, [toast]);

  const checkForChanges = useCallback(() => {
    if (editingRequirement && editingRequirement.status !== "DRAFT") {
      return false;
    }
    const initialState = JSON.stringify(initialFormData);
    const currentState = JSON.stringify(formData);
    return currentState !== initialState;
  }, [formData, editingRequirement, initialFormData]);

  useEffect(() => {
    setHasChanges(checkForChanges());
  }, [formData, checkForChanges]);

  const handleOpenModal = (requirement?: Requirement) => {
    if (requirement) {
      setEditingRequirement(requirement);
      setIsViewMode(requirement.status !== "DRAFT");

      setFormData({
        jobRoles: requirement.jobRoles.map((role) => ({
          title: role.title,
          quantity: role.quantity,
          nationality: role.nationality,
          salary: role.salary?.toString() || "",
          salaryCurrency: role.salaryCurrency || "QAR",
          startDate: role.startDate
            ? format(new Date(role.startDate), "yyyy-MM-dd")
            : "",
          contractDuration: role.contractDuration || "",
        })),
        contractDuration: requirement.contractDuration || "",
        languageRequirements: requirement.languageRequirements || [],
        minExperience: requirement.minExperience || "",
        maxAge: requirement.maxAge || undefined,
        specialRequirements: requirement.specialNotes || "",
        ticketType: requirement.ticketType || "",
        ticketProvided: requirement.ticketProvided || false,
      });

      if (requirement.status !== "DRAFT") {
        setCurrentStep(3);
      } else {
        setCurrentStep(1);
      }
    } else {
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
        ...preparePayload(),
        status: "DRAFT",
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
        toast({
          type: "success",
          message: "Requirement saved as draft successfully",
        });
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

  const preparePayload = () => {
    return {
      contractDuration: formData.contractDuration,
      languageRequirements: formData.languageRequirements,
      minExperience: formData.minExperience || null,
      maxAge: formData.maxAge || null,
      ticketType: formData.ticketType || null,
      ticketProvided: formData.ticketProvided || false,
      specialNotes: formData.specialRequirements,
      jobRoles: formData.jobRoles.map((role) => ({
        title: role.title,
        quantity: role.quantity,
        nationality: role.nationality,
        salary: role.salary ? parseFloat(role.salary) : null,
        salaryCurrency: role.salaryCurrency || "QAR",
        startDate: role.startDate || null,
        contractDuration: role.contractDuration || null,
      })),
      id: editingRequirement?.id,
    };
  };

  const resetAndCloseModal = () => {
    setFormData(initialFormData);
    setIsModalOpen(false);
    setEditingRequirement(null);
    setCurrentStep(1);
    setErrors({});
  };

  const validateStep1 = (isDraft: boolean): boolean => {
    const newErrors: Errors = {};

    if (!isDraft) {
      // Validate job roles
      formData.jobRoles.forEach((role, index) => {
        if (!role.title) {
          newErrors[`jobRoles[${index}].title`] = "Job title is required";
        }
        if (!role.salary) {
          newErrors[`jobRoles[${index}].salary`] = "Salary is required";
        } else if (isNaN(parseFloat(role.salary))) {
          newErrors[`jobRoles[${index}].salary`] = "Salary must be a number";
        }
        if (!role.nationality) {
          newErrors[`jobRoles[${index}].nationality`] =
            "Nationality is required";
        }
        if (!role.startDate) {
          newErrors[`jobRoles[${index}].startDate`] = "Start date is required";
        }
        if (!role.contractDuration) {
          newErrors[`jobRoles[${index}].contractDuration`] =
            "Duration is required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (isDraft: boolean): boolean => {
    const newErrors: Errors = {};

    if (!isDraft) {
      if (formData.languageRequirements.length === 0) {
        newErrors.languageRequirements = "At least one language is required";
      }
      if (formData.maxAge && (formData.maxAge < 18 || formData.maxAge > 70)) {
        newErrors.maxAge = "Age must be between 18 and 70";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    let isValid = true;
    const isDraft = false;

    if (currentStep === 1) isValid = validateStep1(isDraft);
    if (currentStep === 2) isValid = validateStep2(isDraft);

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

    // Clear any errors for this field
    if (
      errors[`jobRoles[${index}].${name.replace(`jobRoles[${index}].`, "")}`]
    ) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[
          `jobRoles[${index}].${name.replace(`jobRoles[${index}].`, "")}`
        ];
        return newErrors;
      });
    }
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
          salaryCurrency: "QAR",
          startDate: "",
          contractDuration: "",
        },
      ],
    }));
  };

  const removeJobRole = (index: number) => {
    if (formData.jobRoles.length <= 1) {
      toast({
        type: "error",
        message: "You must have at least one job role",
      });
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

    if (errors.languageRequirements) {
      setErrors((prev) => ({ ...prev, languageRequirements: "" }));
    }
  };

  const handleAddLanguage = () => {
    const trimmedLang = newLanguage.trim();
    if (!trimmedLang) {
      toast({
        type: "error",
        message: "Please enter a language",
      });
      return;
    }

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
    const isDraft = false;
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
        ...preparePayload(),
        status: "SUBMITTED",
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
        toast({
          type: "success",
          message: editingRequirement
            ? "Requirement updated successfully"
            : "Requirement submitted successfully",
        });
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

            <div className="mt-6">
              <h2 className="text-3xl font-semibold mb-4 text-center">
                {t.jobRoles}
              </h2>
              <div className="rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#4C187A]/85">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/4">
                        {t.jobRole}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/8">
                        {t.quantity}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/8">
                        {t.nationality}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/8">
                        Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/8">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/8">
                        Duration
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
                            disabled={isViewMode}
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
                            disabled={isViewMode}
                          />
                          {errors[`jobRoles[${index}].nationality`] && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors[`jobRoles[${index}].nationality`]}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex">
                            <input
                              type="text"
                              name={`jobRoles[${index}].salary`}
                              value={role.salary}
                              onChange={(e) => handleJobRoleChange(index, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                              placeholder="Amount"
                              disabled={isViewMode}
                            />
                            <select
                              name={`jobRoles[${index}].salaryCurrency`}
                              value={role.salaryCurrency}
                              onChange={(e) => handleJobRoleChange(index, e)}
                              className="px-2 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                              disabled={isViewMode}
                            >
                              <option value="QAR">QAR</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                            </select>
                          </div>
                          {errors[`jobRoles[${index}].salary`] && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors[`jobRoles[${index}].salary`]}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="date"
                            name={`jobRoles[${index}].startDate`}
                            value={role.startDate}
                            onChange={(e) => handleJobRoleChange(index, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                            disabled={isViewMode}
                          />
                          {errors[`jobRoles[${index}].startDate`] && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors[`jobRoles[${index}].startDate`]}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            name={`jobRoles[${index}].contractDuration`}
                            value={role.contractDuration}
                            onChange={(e) => handleJobRoleChange(index, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                            disabled={isViewMode}
                          >
                            <option value="">Select duration</option>
                            {contractDurationOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors[`jobRoles[${index}].contractDuration`] && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors[`jobRoles[${index}].contractDuration`]}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!isViewMode && (
                            <button
                              onClick={() => removeJobRole(index)}
                              className="text-red-500 hover:text-red-700"
                              disabled={formData.jobRoles.length <= 1}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 text-left">
                {!isViewMode && (
                  <Button
                    type="button"
                    variant="default"
                    onClick={addJobRole}
                    className="mr-4"
                  >
                    {t.addAnotherRole}
                  </Button>
                )}
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddLanguage}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Experience
                    </label>
                    <select
                      name="minExperience"
                      value={formData.minExperience}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                      disabled={isViewMode}
                    >
                      <option value="">Select</option>
                      {experienceLevelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Input
                      label="Maximum Age"
                      name="maxAge"
                      value={formData.maxAge || ""}
                      onChange={handleChange}
                      type="number"
                      min="18"
                      max="70"
                      placeholder="e.g., 45"
                      error={errors.maxAge}
                      disabled={isViewMode}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticket Details
                  </label>
                  <div className="space-y-2">
                    <div>
                      <select
                        name="ticketType"
                        value={formData.ticketType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                        disabled={isViewMode}
                      >
                        <option value="">Select ticket type</option>
                        {ticketTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="ticketProvided"
                        name="ticketProvided"
                        checked={formData.ticketProvided || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ticketProvided: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                        disabled={isViewMode}
                      />
                      <label
                        htmlFor="ticketProvided"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Ticket provided by employer
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[2px] h-2/3 bg-[#2C0053]/30 rounded-full"></div>
              </div>

              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">
                  {t.additionalRequirements}
                </h2>
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
                          {role.title} ({t.quantity}: {role.quantity},{" "}
                          {t.nationality}: {role.nationality}, Salary:{" "}
                          {role.salary} {role.salaryCurrency}
                          {role.startDate &&
                            `, Start Date: ${format(new Date(role.startDate), "MMM d, yyyy")}`}
                          {role.contractDuration &&
                            `, Duration: ${contractDurationOptions.find((o) => o.value === role.contractDuration)?.label || role.contractDuration}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <ReviewField
                    label="Contract Duration"
                    value={
                      formData.contractDuration
                        ? contractDurationOptions.find(
                            (o) => o.value === formData.contractDuration
                          )?.label || formData.contractDuration
                        : "Not specified"
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
                    label="Minimum Experience"
                    value={
                      formData.minExperience
                        ? experienceLevelOptions.find(
                            (o) => o.value === formData.minExperience
                          )?.label || formData.minExperience
                        : "Not specified"
                    }
                  />
                  <ReviewField
                    label="Maximum Age"
                    value={formData.maxAge?.toString() || "Not specified"}
                  />
                  <ReviewField
                    label="Ticket Type"
                    value={
                      formData.ticketType
                        ? ticketTypeOptions.find(
                            (o) => o.value === formData.ticketType
                          )?.label || formData.ticketType
                        : "Not specified"
                    }
                  />
                  <ReviewField
                    label="Ticket Provided"
                    value={formData.ticketProvided ? "Yes" : "No"}
                  />
                  <ReviewField
                    label={t.specialRequirements}
                    value={formData.specialRequirements || "None specified"}
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
