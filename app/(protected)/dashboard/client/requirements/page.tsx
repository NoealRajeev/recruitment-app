"use client";
import { useState, useMemo, useEffect } from "react";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/shared/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { useLanguage } from "@/context/LanguageContext";
import { format } from "date-fns";
import { getContractDurationEnumMapping } from "@/lib/utils/enum-mappings";
import { useToast } from "@/context/toast-provider";
import { RequirementStatus, ContractDuration } from "@/lib/generated/prisma";

interface ReviewFieldProps {
  label: string;
  value: string;
}

interface JobRole {
  id?: string;
  requirementId?: string;
  title: string;
  quantity: number;
  nationality: string;
  startDate: string | Date;
  contractDuration?: ContractDuration | null;
  basicSalary: number;
  salaryCurrency?: string | null;
  foodAllowance?: number | null;
  foodProvidedByCompany: boolean;
  housingAllowance?: number | null;
  housingProvidedByCompany: boolean;
  transportationAllowance?: number | null;
  transportationProvidedByCompany: boolean;
  mobileAllowance?: number | null;
  mobileProvidedByCompany: boolean;
  natureOfWorkAllowance?: number | null;
  otherAllowance?: number | null;
  healthInsurance: string;
  ticketFrequency: string[];
  workLocations: string[];
  previousExperience: string[];
  totalExperienceYears?: number | null;
  preferredAge?: number | null;
  languageRequirements: string[];
  specialRequirements?: string | null;
  assignedAgencyId?: string | null;
  agencyStatus?: RequirementStatus;
}

interface Requirement {
  id: string;
  status: RequirementStatus;
  createdAt: Date;
  updatedAt: Date;
  jobRoles: JobRole[];
  client: {
    id: string;
    companyName: string;
  };
}

interface RequirementFormData {
  jobRoles: JobRole[];
}

function ReviewField({ label, value }: ReviewFieldProps) {
  return (
    <div className="mb-3">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-sm text-gray-600 mt-1">{value || "Not specified"}</p>
    </div>
  );
}

// Add these API call functions at the top of your file, right after the imports
async function getRequirements(): Promise<Requirement[]> {
  try {
    const response = await fetch("/api/requirements", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch requirements");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching requirements:", error);
    throw error;
  }
}

async function getRequirementById(id: string): Promise<Requirement> {
  try {
    const response = await fetch(`/api/requirements/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch requirement");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching requirement:", error);
    throw error;
  }
}

async function createRequirement(
  jobRoles: Omit<JobRole, "id" | "requirementId">[],
  status: RequirementStatus
): Promise<Requirement> {
  try {
    const response = await fetch("/api/requirements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobRoles,
        status,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create requirement");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating requirement:", error);
    throw error;
  }
}

async function updateRequirement(
  id: string,
  data: {
    jobRoles: JobRole[];
    status: RequirementStatus;
  }
): Promise<Requirement> {
  try {
    const response = await fetch(`/api/requirements/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update requirement");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating requirement:", error);
    throw error;
  }
}

export default function Requirements() {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingRequirement, setEditingRequirement] =
    useState<Requirement | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newLanguage, setNewLanguage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<RequirementFormData>({
    jobRoles: [
      {
        title: "",
        quantity: 1,
        nationality: "",
        startDate: "",
        contractDuration: undefined,
        basicSalary: 0,
        salaryCurrency: "QAR",
        foodAllowance: undefined,
        foodProvidedByCompany: false,
        housingAllowance: undefined,
        housingProvidedByCompany: false,
        transportationAllowance: undefined,
        transportationProvidedByCompany: false,
        mobileAllowance: undefined,
        mobileProvidedByCompany: false,
        natureOfWorkAllowance: undefined,
        otherAllowance: undefined,
        healthInsurance: "asPerLaw",
        ticketFrequency: [],
        workLocations: [],
        previousExperience: [],
        totalExperienceYears: undefined,
        preferredAge: undefined,
        languageRequirements: [],
        specialRequirements: "",
      },
    ],
  });

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const data = await getRequirements();
        setRequirements(data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load requirements";
        toast({
          message: errorMessage,
          type: "error",
        });
      }
    };

    fetchRequirements();
  }, [toast]);

  const steps = [
    { id: 1, label: t.jobDetails },
    { id: 2, label: t.reviewTitle },
  ];

  const solidWidths = {
    1: "20%",
    2: "100%",
  };

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

  const ticketFrequencyOptions = [
    { value: "ANNUAL", label: "Annual" },
    { value: "BIENNIAL", label: "Biennial" },
    { value: "END_OF_CONTRACT", label: "End of Contract" },
  ];

  const workLocationOptions = [
    { value: "OFFICE", label: "Office" },
    { value: "SITE", label: "Site" },
    { value: "HYBRID", label: "Hybrid" },
    { value: "REMOTE", label: "Remote" },
  ];

  const previousExperienceOptions = [
    { value: "GCC", label: "GCC Experience" },
    { value: "QATAR", label: "Qatar Experience" },
    { value: "OVERSEAS", label: "Overseas Experience" },
  ];

  const languageOptions = [
    "English",
    "Arabic",
    "Hindi",
    "Urdu",
    "Malayalam",
    "Tagalog",
  ];

  const handleOpenModal = async (requirement?: Requirement) => {
    if (requirement?.id) {
      try {
        const fullRequirement = await getRequirementById(requirement.id);
        if (fullRequirement) {
          setEditingRequirement(fullRequirement);

          // Determine if we're in view mode (not a DRAFT)
          const isDraft = fullRequirement.status === "DRAFT";
          setIsViewMode(!isDraft);

          // Set initial step based on status
          setCurrentStep(isDraft ? 1 : 2);
          setFormData({
            jobRoles: fullRequirement.jobRoles.map((role) => ({
              ...role,
              startDate:
                role.startDate instanceof Date
                  ? format(role.startDate, "yyyy-MM-dd")
                  : role.startDate,
              contractDuration: role.contractDuration || undefined,
              salaryCurrency: role.salaryCurrency || "QAR",
              foodAllowance: role.foodAllowance ?? undefined,
              housingAllowance: role.housingAllowance ?? undefined,
              transportationAllowance:
                role.transportationAllowance ?? undefined,
              mobileAllowance: role.mobileAllowance ?? undefined,
              natureOfWorkAllowance: role.natureOfWorkAllowance ?? undefined,
              otherAllowance: role.otherAllowance ?? undefined,
              totalExperienceYears: role.totalExperienceYears ?? undefined,
              preferredAge: role.preferredAge ?? undefined,
              specialRequirements: role.specialRequirements || "",
              languageRequirements: role.languageRequirements || [],
            })),
          });
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load requirement details";
        toast({
          message: errorMessage,
          type: "error",
        });
      }
    } else {
      setEditingRequirement(null);
      setIsViewMode(false);
      setCurrentStep(1);
      setFormData({
        jobRoles: [
          {
            title: "",
            quantity: 1,
            nationality: "",
            startDate: "",
            contractDuration: undefined,
            basicSalary: 0,
            salaryCurrency: "QAR",
            foodAllowance: undefined,
            foodProvidedByCompany: false,
            housingAllowance: undefined,
            housingProvidedByCompany: false,
            transportationAllowance: undefined,
            transportationProvidedByCompany: false,
            mobileAllowance: undefined,
            mobileProvidedByCompany: false,
            natureOfWorkAllowance: undefined,
            otherAllowance: undefined,
            healthInsurance: "asPerLaw",
            ticketFrequency: [],
            workLocations: [],
            previousExperience: [],
            totalExperienceYears: undefined,
            preferredAge: undefined,
            languageRequirements: [],
            specialRequirements: "",
          },
        ],
      });
    }
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      formData.jobRoles.forEach((role, index) => {
        // Basic job role info validation
        if (!role.title) {
          newErrors[`jobRoles[${index}].title`] = "Job title is required";
        }
        if (!role.quantity || role.quantity < 1) {
          newErrors[`jobRoles[${index}].quantity`] =
            "Valid quantity is required";
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
            "Contract duration is required";
        }

        // Salary validation
        if (!role.basicSalary || role.basicSalary <= 0) {
          newErrors[`jobRoles[${index}].basicSalary`] =
            "Basic salary is required";
        }

        // Additional Job Details validation
        if (role.ticketFrequency.length === 0) {
          newErrors[`jobRoles[${index}].ticketFrequency`] =
            "At least one ticket frequency option is required";
        }

        if (role.workLocations.length === 0) {
          newErrors[`jobRoles[${index}].workLocations`] =
            "At least one work location is required";
        }

        if (role.previousExperience.length === 0) {
          newErrors[`jobRoles[${index}].previousExperience`] =
            "At least one previous experience option is required";
        }

        if (!role.totalExperienceYears || role.totalExperienceYears <= 0) {
          newErrors[`jobRoles[${index}].totalExperienceYears`] =
            "Total experience years is required";
        }

        if (!role.preferredAge || role.preferredAge <= 0) {
          newErrors[`jobRoles[${index}].preferredAge`] =
            "Preferred age is required";
        }

        // Language validation
        if (role.languageRequirements.length === 0) {
          newErrors[`jobRoles[${index}].languageRequirements`] =
            "At least one language is required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJobRoleChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => {
      const updatedJobRoles = [...prev.jobRoles];
      const key = name.replace(`jobRoles[${index}].`, "") as keyof JobRole;

      if (type === "checkbox") {
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          [key]: checked,
        };
      } else if (type === "number") {
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          [key]: value === "" ? undefined : parseFloat(value),
        };
      } else {
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          [key]: value,
        };
      }

      return {
        ...prev,
        jobRoles: updatedJobRoles,
      };
    });

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleMultiSelectChange = (
    index: number,
    field: string,
    value: string,
    isChecked: boolean
  ) => {
    setFormData((prev) => {
      const updatedJobRoles = [...prev.jobRoles];
      const currentValues =
        (updatedJobRoles[index][field as keyof JobRole] as string[]) || [];

      if (isChecked) {
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          [field]: [...currentValues, value],
        };
      } else {
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          [field]: currentValues.filter((v) => v !== value),
        };
      }

      return {
        ...prev,
        jobRoles: updatedJobRoles,
      };
    });
  };

  const toggleLanguageRequirement = (language: string, index: number) => {
    setFormData((prev) => {
      const updatedJobRoles = [...prev.jobRoles];
      const currentLanguages =
        updatedJobRoles[index].languageRequirements || [];

      if (currentLanguages.includes(language)) {
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          languageRequirements: currentLanguages.filter(
            (lang) => lang !== language
          ),
        };
      } else {
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          languageRequirements: [...currentLanguages, language],
        };
      }

      return {
        ...prev,
        jobRoles: updatedJobRoles,
      };
    });

    // Clear error when language is selected
    if (errors[`jobRoles[${index}].languageRequirements`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`jobRoles[${index}].languageRequirements`];
        return newErrors;
      });
    }
  };

  const handleAddLanguage = (index: number) => {
    if (newLanguage.trim() && !languageOptions.includes(newLanguage.trim())) {
      setFormData((prev) => {
        const updatedJobRoles = [...prev.jobRoles];
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          languageRequirements: [
            ...(updatedJobRoles[index].languageRequirements || []),
            newLanguage.trim(),
          ],
        };
        return {
          ...prev,
          jobRoles: updatedJobRoles,
        };
      });
      setNewLanguage("");
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
          startDate: "",
          contractDuration: undefined,
          basicSalary: 0,
          salaryCurrency: "QAR",
          foodAllowance: undefined,
          foodProvidedByCompany: false,
          housingAllowance: undefined,
          housingProvidedByCompany: false,
          transportationAllowance: undefined,
          transportationProvidedByCompany: false,
          mobileAllowance: undefined,
          mobileProvidedByCompany: false,
          natureOfWorkAllowance: undefined,
          otherAllowance: undefined,
          healthInsurance: "asPerLaw",
          ticketFrequency: [],
          workLocations: [],
          previousExperience: [],
          totalExperienceYears: undefined,
          preferredAge: undefined,
          languageRequirements: [],
          specialRequirements: "",
        },
      ],
    }));
  };

  const removeJobRole = (index: number) => {
    if (formData.jobRoles.length > 1) {
      setFormData((prev) => {
        const updatedJobRoles = [...prev.jobRoles];
        updatedJobRoles.splice(index, 1);
        return {
          ...prev,
          jobRoles: updatedJobRoles,
        };
      });
    }
  };

  const calculateTotalSalary = (role: JobRole) => {
    const basic = role.basicSalary || 0;
    const food = role.foodProvidedByCompany ? 0 : role.foodAllowance || 0;
    const housing = role.housingProvidedByCompany
      ? 0
      : role.housingAllowance || 0;
    const transport = role.transportationProvidedByCompany
      ? 0
      : role.transportationAllowance || 0;
    const mobile = role.mobileProvidedByCompany ? 0 : role.mobileAllowance || 0;
    const nature = role.natureOfWorkAllowance || 0;
    const other = role.otherAllowance || 0;

    return basic + food + housing + transport + mobile + nature + other;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const submissionData = {
        jobRoles: formData.jobRoles.map((role) => ({
          ...role,
          startDate: new Date(role.startDate),
          basicSalary: parseFloat(role.basicSalary.toString()),
          foodAllowance: role.foodAllowance
            ? parseFloat(role.foodAllowance.toString())
            : null,
          housingAllowance: role.housingAllowance
            ? parseFloat(role.housingAllowance.toString())
            : null,
          transportationAllowance: role.transportationAllowance
            ? parseFloat(role.transportationAllowance.toString())
            : null,
          mobileAllowance: role.mobileAllowance
            ? parseFloat(role.mobileAllowance.toString())
            : null,
          natureOfWorkAllowance: role.natureOfWorkAllowance
            ? parseFloat(role.natureOfWorkAllowance.toString())
            : null,
          otherAllowance: role.otherAllowance
            ? parseFloat(role.otherAllowance.toString())
            : null,
          languageRequirements: role.languageRequirements,
        })),
      };

      if (editingRequirement) {
        await updateRequirement(editingRequirement.id, {
          jobRoles: submissionData.jobRoles,
          status: "SUBMITTED",
        });
      } else {
        await createRequirement(
          submissionData.jobRoles as Omit<JobRole, "id" | "requirementId">[],
          "SUBMITTED"
        );
      }

      toast({
        message: editingRequirement
          ? "Requirement updated successfully"
          : "Requirement submitted successfully",
        type: "success",
      });

      // Refresh the list
      const updatedRequirements = await getRequirements();
      setRequirements(updatedRequirements);

      handleCloseModal();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit requirement";
      toast({
        message: errorMessage,
        type: "error",
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
                    {formData.jobRoles.map((role, index) => {
                      const totalSalary = calculateTotalSalary(role);
                      return (
                        <>
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
                                {t.jobPositions?.map((job: string) => (
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
                              <input
                                type="date"
                                name={`jobRoles[${index}].startDate`}
                                value={
                                  typeof role.startDate === "string"
                                    ? role.startDate
                                    : format(
                                        role.startDate as Date,
                                        "yyyy-MM-dd"
                                      )
                                }
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
                                value={role.contractDuration || ""}
                                onChange={(e) => handleJobRoleChange(index, e)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                disabled={isViewMode}
                              >
                                <option value="">Select duration</option>
                                {contractDurationOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              {errors[
                                `jobRoles[${index}].contractDuration`
                              ] && (
                                <p className="text-xs text-red-500 mt-1">
                                  {
                                    errors[
                                      `jobRoles[${index}].contractDuration`
                                    ]
                                  }
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
                          <tr>
                            <td colSpan={7} className="px-6 py-4">
                              <div className="p-4 rounded-lg shadow">
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-lg font-semibold">
                                    Salary Details (Monthly)
                                  </h3>
                                  <div className="p-2 rounded-md">
                                    <span className="font-medium">
                                      Total Salary:{" "}
                                    </span>
                                    <span className="font-bold">
                                      {totalSalary.toFixed(2)}{" "}
                                      {role.salaryCurrency}
                                    </span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Basic Salary
                                      </label>
                                      <div className="flex">
                                        <input
                                          type="number"
                                          name={`jobRoles[${index}].basicSalary`}
                                          value={role.basicSalary || ""}
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          placeholder="Amount"
                                          disabled={isViewMode}
                                        />
                                        <select
                                          name={`jobRoles[${index}].salaryCurrency`}
                                          value={role.salaryCurrency || "QAR"}
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          className="px-2 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          disabled={isViewMode}
                                        >
                                          <option value="QAR">QAR</option>
                                          <option value="USD">USD</option>
                                          <option value="EUR">EUR</option>
                                        </select>
                                      </div>
                                      {errors[
                                        `jobRoles[${index}].basicSalary`
                                      ] && (
                                        <p className="text-xs text-red-500 mt-1">
                                          {
                                            errors[
                                              `jobRoles[${index}].basicSalary`
                                            ]
                                          }
                                        </p>
                                      )}
                                    </div>

                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Food Allowance
                                      </label>
                                      <div className="flex items-center">
                                        <input
                                          type="number"
                                          name={`jobRoles[${index}].foodAllowance`}
                                          value={role.foodAllowance || ""}
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          placeholder="Amount"
                                          disabled={
                                            isViewMode ||
                                            role.foodProvidedByCompany
                                          }
                                        />
                                        <div className="flex items-center ml-4">
                                          <input
                                            type="checkbox"
                                            name={`jobRoles[${index}].foodProvidedByCompany`}
                                            checked={
                                              role.foodProvidedByCompany ||
                                              false
                                            }
                                            onChange={(e) =>
                                              handleJobRoleChange(index, e)
                                            }
                                            className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                                            disabled={isViewMode}
                                          />
                                          <label className="ml-2 block text-sm text-gray-700">
                                            Provided by Company
                                          </label>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Housing Allowance
                                      </label>
                                      <div className="flex items-center">
                                        <input
                                          type="number"
                                          name={`jobRoles[${index}].housingAllowance`}
                                          value={role.housingAllowance || ""}
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          placeholder="Amount"
                                          disabled={
                                            isViewMode ||
                                            role.housingProvidedByCompany
                                          }
                                        />
                                        <div className="flex items-center ml-4">
                                          <input
                                            type="checkbox"
                                            name={`jobRoles[${index}].housingProvidedByCompany`}
                                            checked={
                                              role.housingProvidedByCompany ||
                                              false
                                            }
                                            onChange={(e) =>
                                              handleJobRoleChange(index, e)
                                            }
                                            className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                                            disabled={isViewMode}
                                          />
                                          <label className="ml-2 block text-sm text-gray-700">
                                            Provided by Company
                                          </label>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Transportation Allowance
                                      </label>
                                      <div className="flex items-center">
                                        <input
                                          type="number"
                                          name={`jobRoles[${index}].transportationAllowance`}
                                          value={
                                            role.transportationAllowance || ""
                                          }
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          placeholder="Amount"
                                          disabled={
                                            isViewMode ||
                                            role.transportationProvidedByCompany
                                          }
                                        />
                                        <div className="flex items-center ml-4">
                                          <input
                                            type="checkbox"
                                            name={`jobRoles[${index}].transportationProvidedByCompany`}
                                            checked={
                                              role.transportationProvidedByCompany ||
                                              false
                                            }
                                            onChange={(e) =>
                                              handleJobRoleChange(index, e)
                                            }
                                            className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                                            disabled={isViewMode}
                                          />
                                          <label className="ml-2 block text-sm text-gray-700">
                                            Provided by Company
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Health Insurance
                                      </label>
                                      <div className="flex items-center space-x-4">
                                        <div className="flex items-center">
                                          <input
                                            type="radio"
                                            name={`jobRoles[${index}].healthInsurance`}
                                            value="asPerLaw"
                                            checked={
                                              role.healthInsurance ===
                                              "asPerLaw"
                                            }
                                            onChange={(e) =>
                                              handleJobRoleChange(index, e)
                                            }
                                            className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300"
                                            disabled={isViewMode}
                                          />
                                          <label className="ml-2 block text-sm text-gray-700">
                                            As per Qatar Labor law
                                          </label>
                                        </div>
                                        <div className="flex items-center">
                                          <input
                                            type="radio"
                                            name={`jobRoles[${index}].healthInsurance`}
                                            value="providedByCompany"
                                            checked={
                                              role.healthInsurance ===
                                              "providedByCompany"
                                            }
                                            onChange={(e) =>
                                              handleJobRoleChange(index, e)
                                            }
                                            className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300"
                                            disabled={isViewMode}
                                          />
                                          <label className="ml-2 block text-sm text-gray-700">
                                            Provided by Company
                                          </label>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mobile Allowance
                                      </label>
                                      <div className="flex items-center">
                                        <input
                                          type="number"
                                          name={`jobRoles[${index}].mobileAllowance`}
                                          value={role.mobileAllowance || ""}
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          placeholder="Amount"
                                          disabled={
                                            isViewMode ||
                                            role.mobileProvidedByCompany
                                          }
                                        />
                                        <div className="flex items-center ml-4">
                                          <input
                                            type="checkbox"
                                            name={`jobRoles[${index}].mobileProvidedByCompany`}
                                            checked={
                                              role.mobileProvidedByCompany ||
                                              false
                                            }
                                            onChange={(e) =>
                                              handleJobRoleChange(index, e)
                                            }
                                            className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                                            disabled={isViewMode}
                                          />
                                          <label className="ml-2 block text-sm text-gray-700">
                                            Provided by Company
                                          </label>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nature of Work Allowance
                                      </label>
                                      <div className="flex">
                                        <input
                                          type="number"
                                          name={`jobRoles[${index}].natureOfWorkAllowance`}
                                          value={
                                            role.natureOfWorkAllowance || ""
                                          }
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          placeholder="Amount"
                                          disabled={isViewMode}
                                        />
                                      </div>
                                    </div>

                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Other Allowance
                                      </label>
                                      <div className="flex">
                                        <input
                                          type="number"
                                          name={`jobRoles[${index}].otherAllowance`}
                                          value={role.otherAllowance || ""}
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          placeholder="Amount"
                                          disabled={isViewMode}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Additional Job Role Details */}
                                <div className="mt-8">
                                  <h3 className="text-lg font-semibold mb-4">
                                    Additional Job Details
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Ticket Frequency
                                          <span className="text-[#FF0404] ml-1">
                                            *
                                          </span>
                                        </label>
                                        {errors[
                                          `jobRoles[${index}].ticketFrequency`
                                        ] && (
                                          <p className="text-xs text-red-500 mb-2">
                                            {
                                              errors[
                                                `jobRoles[${index}].ticketFrequency`
                                              ]
                                            }
                                          </p>
                                        )}
                                        <div className="space-y-2">
                                          {ticketFrequencyOptions.map(
                                            (option) => (
                                              <div
                                                key={option.value}
                                                className="flex items-center"
                                              >
                                                <input
                                                  type="checkbox"
                                                  id={`ticketFrequency-${index}-${option.value}`}
                                                  checked={
                                                    role.ticketFrequency?.includes(
                                                      option.value
                                                    ) || false
                                                  }
                                                  onChange={(e) =>
                                                    handleMultiSelectChange(
                                                      index,
                                                      "ticketFrequency",
                                                      option.value,
                                                      e.target.checked
                                                    )
                                                  }
                                                  className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                                                  disabled={isViewMode}
                                                />
                                                <label
                                                  htmlFor={`ticketFrequency-${index}-${option.value}`}
                                                  className="ml-2 block text-sm text-gray-700"
                                                >
                                                  {option.label}
                                                </label>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>

                                      <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Work Locations
                                          <span className="text-[#FF0404] ml-1">
                                            *
                                          </span>
                                        </label>
                                        {errors[
                                          `jobRoles[${index}].workLocations`
                                        ] && (
                                          <p className="text-xs text-red-500 mb-2">
                                            {
                                              errors[
                                                `jobRoles[${index}].workLocations`
                                              ]
                                            }
                                          </p>
                                        )}
                                        <div className="space-y-2">
                                          {workLocationOptions.map((option) => (
                                            <div
                                              key={option.value}
                                              className="flex items-center"
                                            >
                                              <input
                                                type="checkbox"
                                                id={`workLocations-${index}-${option.value}`}
                                                checked={
                                                  role.workLocations?.includes(
                                                    option.value
                                                  ) || false
                                                }
                                                onChange={(e) =>
                                                  handleMultiSelectChange(
                                                    index,
                                                    "workLocations",
                                                    option.value,
                                                    e.target.checked
                                                  )
                                                }
                                                className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                                                disabled={isViewMode}
                                              />
                                              <label
                                                htmlFor={`workLocations-${index}-${option.value}`}
                                                className="ml-2 block text-sm text-gray-700"
                                              >
                                                {option.label}
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Previous Experience
                                          <span className="text-[#FF0404] ml-1">
                                            *
                                          </span>
                                        </label>
                                        {errors[
                                          `jobRoles[${index}].previousExperience`
                                        ] && (
                                          <p className="text-xs text-red-500 mb-2">
                                            {
                                              errors[
                                                `jobRoles[${index}].previousExperience`
                                              ]
                                            }
                                          </p>
                                        )}
                                        <div className="space-y-2">
                                          {previousExperienceOptions.map(
                                            (option) => (
                                              <div
                                                key={option.value}
                                                className="flex items-center"
                                              >
                                                <input
                                                  type="checkbox"
                                                  id={`previousExperience-${index}-${option.value}`}
                                                  checked={
                                                    role.previousExperience?.includes(
                                                      option.value
                                                    ) || false
                                                  }
                                                  onChange={(e) =>
                                                    handleMultiSelectChange(
                                                      index,
                                                      "previousExperience",
                                                      option.value,
                                                      e.target.checked
                                                    )
                                                  }
                                                  className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                                                  disabled={isViewMode}
                                                />
                                                <label
                                                  htmlFor={`previousExperience-${index}-${option.value}`}
                                                  className="ml-2 block text-sm text-gray-700"
                                                >
                                                  {option.label}
                                                </label>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>

                                      <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Total Experience Years
                                          <span className="text-[#FF0404] ml-1">
                                            *
                                          </span>
                                        </label>
                                        {errors[
                                          `jobRoles[${index}].totalExperienceYears`
                                        ] && (
                                          <p className="text-xs text-red-500 mb-1">
                                            {
                                              errors[
                                                `jobRoles[${index}].totalExperienceYears`
                                              ]
                                            }
                                          </p>
                                        )}
                                        <input
                                          type="number"
                                          name={`jobRoles[${index}].totalExperienceYears`}
                                          value={
                                            role.totalExperienceYears || ""
                                          }
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          required
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          placeholder="e.g., 5"
                                          disabled={isViewMode}
                                        />
                                      </div>
                                      <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Preferred Age (±5 years)
                                          <span className="text-[#FF0404] ml-1">
                                            *
                                          </span>
                                        </label>
                                        {errors[
                                          `jobRoles[${index}].preferredAge`
                                        ] && (
                                          <p className="text-xs text-red-500 mb-1">
                                            {
                                              errors[
                                                `jobRoles[${index}].preferredAge`
                                              ]
                                            }
                                          </p>
                                        )}
                                        <input
                                          type="number"
                                          name={`jobRoles[${index}].preferredAge`}
                                          value={role.preferredAge || ""}
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          placeholder="e.g., 30"
                                          disabled={isViewMode}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Language Requirements and Special Notes */}
                                <div className="mt-8">
                                  <h3 className="text-lg font-semibold mb-4">
                                    Language & Special Requirements
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t.languageRequirements}
                                        <span className="text-[#FF0404] ml-1">
                                          *
                                        </span>
                                      </label>

                                      {errors[
                                        `jobRoles[${index}].languageRequirements`
                                      ] && (
                                        <p className="text-sm text-[#FF0404] mb-2">
                                          {
                                            errors[
                                              `jobRoles[${index}].languageRequirements`
                                            ]
                                          }
                                        </p>
                                      )}

                                      <div className="space-y-2 mb-3">
                                        {languageOptions.map((language) => (
                                          <div
                                            key={language}
                                            className="flex items-center"
                                          >
                                            <input
                                              type="checkbox"
                                              id={`lang-${index}-${language}`}
                                              checked={
                                                role.languageRequirements?.includes(
                                                  language
                                                ) || false
                                              }
                                              onChange={() =>
                                                toggleLanguageRequirement(
                                                  language,
                                                  index
                                                )
                                              }
                                              className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                                              disabled={isViewMode}
                                            />
                                            <label
                                              htmlFor={`lang-${index}-${language}`}
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
                                            onChange={(e) =>
                                              setNewLanguage(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddLanguage(index);
                                              }
                                            }}
                                            placeholder="Add another language"
                                            className="w-full"
                                          />
                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                              handleAddLanguage(index)
                                            }
                                          >
                                            Add
                                          </Button>
                                        </div>
                                      )}
                                    </div>

                                    <div>
                                      <label
                                        htmlFor={`specialRequirements-${index}`}
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                      >
                                        {t.specialRequirements}
                                      </label>
                                      <textarea
                                        id={`specialRequirements-${index}`}
                                        name={`jobRoles[${index}].specialRequirements`}
                                        value={role.specialRequirements || ""}
                                        onChange={(e) =>
                                          handleJobRoleChange(index, e)
                                        }
                                        rows={5}
                                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C0053] focus:border-[#2C0053] "
                                        placeholder={
                                          t.specialRequirementsPlaceholder
                                        }
                                        disabled={isViewMode}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </>
                      );
                    })}
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
            <div className="text-center mb-0">
              <h1 className="text-2xl font-semibold mb-1">{t.reviewTitle}</h1>
              <p className="text-base text-gray-700 mb-2">{t.verifyInfo}</p>
            </div>

            <div className="mt-6 space-y-6">
              {formData.jobRoles.map((role, index) => {
                const totalSalary = calculateTotalSalary(role);
                const formattedStartDate = role.startDate
                  ? format(new Date(role.startDate), "MMM d, yyyy")
                  : "Not specified";
                const contractDuration = contractDurationOptions.find(
                  (o) => o.value === role.contractDuration
                )?.label;

                return (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-sm"
                  >
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                      Job Role {index + 1}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <ReviewField label="Job Title" value={role.title} />
                        <ReviewField
                          label="Quantity"
                          value={role.quantity.toString()}
                        />
                        <ReviewField
                          label="Nationality"
                          value={role.nationality}
                        />
                        <ReviewField
                          label="Start Date"
                          value={formattedStartDate}
                        />
                        <ReviewField
                          label="Contract Duration"
                          value={contractDuration || "Not specified"}
                        />
                        <ReviewField
                          label="Basic Salary"
                          value={`${role.basicSalary} ${role.salaryCurrency || "QAR"}`}
                        />
                      </div>
                      <div>
                        <ReviewField
                          label="Total Salary"
                          value={`${totalSalary.toFixed(2)} ${role.salaryCurrency || "QAR"}`}
                        />
                        <ReviewField
                          label="Language Requirements"
                          value={
                            role.languageRequirements?.join(", ") ||
                            "Not specified"
                          }
                        />
                        <ReviewField
                          label="Work Locations"
                          value={
                            role.workLocations
                              ?.map(
                                (loc) =>
                                  workLocationOptions.find(
                                    (o) => o.value === loc
                                  )?.label
                              )
                              .join(", ") || "Not specified"
                          }
                        />
                        <ReviewField
                          label="Previous Experience"
                          value={
                            role.previousExperience
                              ?.map(
                                (exp) =>
                                  previousExperienceOptions.find(
                                    (o) => o.value === exp
                                  )?.label
                              )
                              .join(", ") || "Not specified"
                          }
                        />
                        {role.totalExperienceYears && (
                          <ReviewField
                            label="Total Experience"
                            value={`${role.totalExperienceYears} years`}
                          />
                        )}
                        {role.specialRequirements && (
                          <ReviewField
                            label="Special Requirements"
                            value={role.specialRequirements || ""}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
    const statusMap: Record<string, { text: string; color: string }> = {
      DRAFT: { text: "Draft", color: "text-gray-600" },
      SUBMITTED: { text: "Submitted", color: "text-blue-600" },
      UNDER_REVIEW: { text: "Under Review", color: "text-yellow-600" },
      FORWARDED: { text: "Forwarded", color: "text-purple-600" },
      ACCEPTED: { text: "Accepted", color: "text-green-600" },
      REJECTED: { text: "Rejected", color: "text-red-600" },
      CLIENT_REVIEW: { text: "Review Pending", color: "text-indigo-600" },
      COMPLETED: { text: "Completed", color: "text-gray-600" },
    };

    const statusInfo = statusMap[requirement.status] || {
      text: "Unknown",
      color: "text-gray-500",
    };
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AddCard />
          {requirements.map((requirement) => (
            <RequirementCard key={requirement.id} requirement={requirement} />
          ))}
        </div>
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
