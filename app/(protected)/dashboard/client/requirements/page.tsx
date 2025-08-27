"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/shared/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { useLanguage } from "@/context/LanguageContext";
import { format } from "date-fns";
import { useToast } from "@/context/toast-provider";
import { RequirementStatus } from "@/lib/generated/prisma";
import React from "react";

/* ----------------------------- Types ----------------------------- */

type ROType =
  | "JOB_TITLE"
  | "TICKET_FREQUENCY"
  | "WORK_LOCATION"
  | "PREVIOUS_EXPERIENCE"
  | "LANGUAGE"
  | "CURRENCY"
  | "CONTRACT_DURATION";

interface RequirementOption {
  id: string;
  type: ROType;
  value: string;
  order: number | null;
  isActive: boolean;
}

interface ReviewFieldProps {
  label: string;
  value: string;
}

interface JobRoleFormData {
  id?: string;
  requirementId?: string;
  title: string;
  quantity: number;
  nationality: string;
  startDate: string; // yyyy-MM-dd
  contractDuration?: string | null; // now string from admin-managed list
  basicSalary: number;
  salaryCurrency?: string;
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
  healthInsurance: "asPerLaw" | "providedByCompany";
  ticketFrequency: string;
  workLocations: string;
  previousExperience: string;
  totalExperienceYears?: number | null;
  preferredAge?: number | null;
  languageRequirements: string[];
  specialRequirements?: string;
  assignedAgencyId?: string | null;
  agencyStatus?: RequirementStatus;
}

interface RequirementFormData {
  jobRoles: JobRoleFormData[];
}

interface Requirement {
  id: string;
  status: RequirementStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  jobRoles: JobRoleFormData[];
  client: {
    id: string;
    companyName: string;
  };
}

/* ----------------------------- Utils ----------------------------- */

function ReviewField({ label, value }: ReviewFieldProps) {
  return (
    <div className="mb-3">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-sm text-gray-600 mt-1">{value || "Not specified"}</p>
    </div>
  );
}

async function getRequirements(): Promise<Requirement[]> {
  const response = await fetch("/api/requirements", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok)
    throw new Error(`Failed to fetch requirements: ${response.statusText}`);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

async function getRequirementById(id: string): Promise<Requirement> {
  const response = await fetch(`/api/requirements/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok)
    throw new Error(`Failed to fetch requirement: ${response.statusText}`);
  return await response.json();
}

async function createRequirement(
  jobRoles: Omit<JobRoleFormData, "id" | "requirementId">[],
  status: RequirementStatus
): Promise<Requirement> {
  const response = await fetch("/api/requirements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobRoles, status }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create requirement");
  }
  return await response.json();
}

async function updateRequirement(
  id: string,
  data: { jobRoles: JobRoleFormData[]; status: RequirementStatus }
): Promise<Requirement> {
  const response = await fetch(`/api/requirements/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update requirement");
  }
  return await response.json();
}

async function saveAsDraft(
  jobRoles: Omit<JobRoleFormData, "id" | "requirementId">[],
  existingId?: string
): Promise<Requirement> {
  const url = existingId
    ? `/api/requirements/${existingId}`
    : "/api/requirements";
  const method = existingId ? "PATCH" : "POST";
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobRoles, status: "DRAFT" }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to save draft");
  }
  return await response.json();
}

/** today + 15 days in yyyy-MM-dd */
const getMinStartDate = () => {
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 15);
  return minDate.toISOString().split("T")[0];
};

/** normalize to yyyy-MM-dd without resetting saved values */
const toYMD = (val: string | Date | undefined | null) => {
  if (!val) return getMinStartDate();
  const d = typeof val === "string" ? new Date(val) : val;
  if (Number.isNaN(d.getTime())) return getMinStartDate();
  return d.toISOString().slice(0, 10);
};

/** test if a numeric field is truly empty (not 0) */
const isEmptyNumber = (v: unknown) => v === undefined || v === null || v === "";

/* =============================== Page =============================== */

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showInactiveCurrency] = useState(true); // we show inactive label when selected value is inactive

  // Admin-managed options
  const [options, setOptions] = useState<RequirementOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [formData, setFormData] = useState<RequirementFormData>({
    jobRoles: [
      {
        title: "",
        quantity: 1,
        nationality: "",
        startDate: getMinStartDate(),
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
        ticketFrequency: "",
        workLocations: "",
        previousExperience: "",
        totalExperienceYears: undefined,
        preferredAge: undefined,
        languageRequirements: [],
        specialRequirements: "",
      },
    ],
  });

  /* ------------- Pull admin options once ------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/requirement-options");
        const data: RequirementOption[] = await res.json();
        setOptions(
          (Array.isArray(data) ? data : []).sort((a, b) => {
            const ao = a.order ?? 0;
            const bo = b.order ?? 0;
            return ao - bo || a.value.localeCompare(b.value);
          })
        );
      } catch {
        toast({ type: "error", message: "Failed to load form options" });
      } finally {
        setLoadingOptions(false);
      }
    })();
  }, [toast]);

  const byType = useMemo(() => {
    const map: Record<ROType, RequirementOption[]> = {
      JOB_TITLE: [],
      TICKET_FREQUENCY: [],
      WORK_LOCATION: [],
      PREVIOUS_EXPERIENCE: [],
      LANGUAGE: [],
      CURRENCY: [],
      CONTRACT_DURATION: [],
    };
    for (const o of options) map[o.type]?.push(o);
    return map;
  }, [options]);

  const jobTitleOpts = byType.JOB_TITLE.filter((o) => o.isActive);
  const ticketFrequencyOpts = byType.TICKET_FREQUENCY.filter((o) => o.isActive);
  const workLocationOpts = byType.WORK_LOCATION.filter((o) => o.isActive);
  const prevExpOpts = byType.PREVIOUS_EXPERIENCE.filter((o) => o.isActive);
  const languageOpts = byType.LANGUAGE.filter((o) => o.isActive);
  const contractDurationOpts = byType.CONTRACT_DURATION.filter(
    (o) => o.isActive
  );
  const currencyOptsAll = byType.CURRENCY; // we’ll filter per-row (to keep current value if inactive)

  /* ------------- Data loading for existing requirements ------------- */

  const fetchRequirements = useCallback(async () => {
    try {
      const data = await getRequirements();
      setRequirements(data);
    } catch (error: unknown) {
      toast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to load requirements",
        type: "error",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  const steps = [
    { id: 1, label: t.jobDetails },
    { id: 2, label: t.reviewTitle },
  ] as const;

  const solidWidths = { 1: "20%", 2: "100%" } as const;

  const getMinStartDateMemo = useCallback(() => getMinStartDate(), []);

  const handleOpenModal = async (requirement?: Requirement) => {
    if (requirement?.id) {
      try {
        const fullRequirement = await getRequirementById(requirement.id);
        if (fullRequirement) {
          setEditingRequirement(fullRequirement);
          const isDraft = fullRequirement.status === "DRAFT";
          setIsViewMode(!isDraft);
          setCurrentStep(isDraft ? 1 : 2);

          setFormData({
            jobRoles: fullRequirement.jobRoles.map((role) => ({
              ...role,
              startDate: toYMD(role.startDate),
              contractDuration: role.contractDuration || undefined, // now string from admin list
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
        toast({
          message:
            error instanceof Error
              ? error.message
              : "Failed to load requirement details",
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
            startDate: getMinStartDate(),
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
            ticketFrequency: "",
            workLocations: "",
            previousExperience: "",
            totalExperienceYears: undefined,
            preferredAge: undefined,
            languageRequirements: [],
            specialRequirements: "",
          },
        ],
      });
    }
    setIsModalOpen(true);
  };

  const hasValidData = useMemo(
    () =>
      formData.jobRoles.some(
        (role) =>
          role.title ||
          role.nationality ||
          role.startDate ||
          role.contractDuration
      ),
    [formData]
  );

  const handleCloseModal = async (skipSaveCheck = false) => {
    if (!skipSaveCheck && !isViewMode && hasValidData) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Do you want to save as draft before closing?"
      );
      if (confirmClose) {
        try {
          setIsSubmitting(true);
          const jobRoles = formData.jobRoles.map((r) => ({ ...r }));
          if (editingRequirement) {
            await saveAsDraft(jobRoles, editingRequirement.id);
          } else {
            await saveAsDraft(jobRoles);
          }
          await fetchRequirements();
          toast({ message: "Draft saved successfully", type: "success" });
        } catch (error: unknown) {
          toast({
            message:
              error instanceof Error ? error.message : "Failed to save draft",
            type: "error",
          });
        } finally {
          setIsSubmitting(false);
        }
      }
    }
    setIsModalOpen(false);
    setErrors({});
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep((prev) => prev + 1);
  };
  const handleBack = () => setCurrentStep((prev) => Math.max(1, prev - 1));

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      formData.jobRoles.forEach((role, index) => {
        if (!role.title)
          newErrors[`jobRoles[${index}].title`] = "Job title is required";
        if (!role.quantity || role.quantity < 1)
          newErrors[`jobRoles[${index}].quantity`] =
            "Valid quantity is required";
        if (!role.nationality)
          newErrors[`jobRoles[${index}].nationality`] =
            "Nationality is required";
        if (!role.startDate) {
          newErrors[`jobRoles[${index}].startDate`] = "Start date is required";
        } else {
          const minStart = new Date(getMinStartDate());
          const selected = new Date(role.startDate);
          if (selected < minStart) {
            newErrors[`jobRoles[${index}].startDate`] =
              "Start date must be at least 15 days from today";
          }
        }
        if (!role.contractDuration)
          newErrors[`jobRoles[${index}].contractDuration`] =
            "Contract duration is required";
        if (role.basicSalary !== undefined && role.basicSalary < 0)
          newErrors[`jobRoles[${index}].basicSalary`] =
            "Salary cannot be negative";
        if (!role.ticketFrequency)
          newErrors[`jobRoles[${index}].ticketFrequency`] =
            "Ticket frequency is required";
        if (!role.workLocations)
          newErrors[`jobRoles[${index}].workLocations`] =
            "Work location is required";
        if (!role.previousExperience)
          newErrors[`jobRoles[${index}].previousExperience`] =
            "Previous experience is required";
        if (role.previousExperience !== "FRESHER") {
          if (!role.totalExperienceYears || role.totalExperienceYears <= 0)
            newErrors[`jobRoles[${index}].totalExperienceYears`] =
              "Total experience years is required";
        }
        if (!role.preferredAge || role.preferredAge <= 0)
          newErrors[`jobRoles[${index}].preferredAge`] =
            "Preferred age is required";
        if (role.languageRequirements.length === 0)
          newErrors[`jobRoles[${index}].languageRequirements`] =
            "At least one language is required";
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

    if (type === "number" && parseFloat(value) < 0) return;

    setFormData((prev) => {
      const updatedJobRoles = [...prev.jobRoles];
      const key = name.replace(
        `jobRoles[${index}].`,
        ""
      ) as keyof JobRoleFormData;

      if (type === "checkbox") {
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          [key]: checked,
        } as any;
      } else if (type === "number") {
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          [key]: value === "" ? undefined : Math.max(0, parseFloat(value)),
        } as any;
      } else {
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          [key]: value,
        } as any;
      }
      return { ...prev, jobRoles: updatedJobRoles };
    });

    if (errors[name]) {
      setErrors((prev) => {
        const ne = { ...prev };
        delete ne[name];
        return ne;
      });
    }
  };

  const toggleLanguageRequirement = useCallback(
    (lng: string, index: number) => {
      setFormData((prev) => {
        const updatedJobRoles = [...prev.jobRoles];
        const current = updatedJobRoles[index].languageRequirements;
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          languageRequirements: current.includes(lng)
            ? current.filter((x) => x !== lng)
            : [...current, lng],
        };
        return { ...prev, jobRoles: updatedJobRoles };
      });

      const key = `jobRoles[${index}].languageRequirements`;
      if (errors[key]) {
        setErrors((prev) => {
          const ne = { ...prev };
          delete ne[key];
          return ne;
        });
      }
    },
    [errors]
  );

  const addJobRole = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      jobRoles: [
        ...prev.jobRoles,
        {
          title: "",
          quantity: 1,
          nationality: "",
          startDate: getMinStartDate(),
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
          ticketFrequency: "",
          workLocations: "",
          previousExperience: "",
          totalExperienceYears: undefined,
          preferredAge: undefined,
          languageRequirements: [],
          specialRequirements: "",
        },
      ],
    }));
  }, []);

  const removeJobRole = useCallback(
    (index: number) => {
      if (formData.jobRoles.length > 1) {
        setFormData((prev) => {
          const updatedJobRoles = [...prev.jobRoles];
          updatedJobRoles.splice(index, 1);
          return { ...prev, jobRoles: updatedJobRoles };
        });
      }
    },
    [formData.jobRoles.length]
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isModalOpen && !isViewMode && hasValidData) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isModalOpen, isViewMode, hasValidData]);

  const calculateTotalSalary = useCallback((role: JobRoleFormData) => {
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
  }, []);

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      const submissionData = {
        jobRoles: formData.jobRoles.map((role) => ({
          ...role,
          basicSalary: parseFloat(String(role.basicSalary)),
          foodAllowance: isEmptyNumber(role.foodAllowance)
            ? null
            : parseFloat(String(role.foodAllowance)),
          housingAllowance: isEmptyNumber(role.housingAllowance)
            ? null
            : parseFloat(String(role.housingAllowance)),
          transportationAllowance: isEmptyNumber(role.transportationAllowance)
            ? null
            : parseFloat(String(role.transportationAllowance)),
          mobileAllowance: isEmptyNumber(role.mobileAllowance)
            ? null
            : parseFloat(String(role.mobileAllowance)),
          natureOfWorkAllowance: isEmptyNumber(role.natureOfWorkAllowance)
            ? null
            : parseFloat(String(role.natureOfWorkAllowance)),
          otherAllowance: isEmptyNumber(role.otherAllowance)
            ? null
            : parseFloat(String(role.otherAllowance)),
        })),
      };
      if (editingRequirement) {
        await updateRequirement(editingRequirement.id, {
          jobRoles: submissionData.jobRoles,
          status: "SUBMITTED",
        });
      } else {
        await createRequirement(submissionData.jobRoles, "SUBMITTED");
      }
      toast({
        message: editingRequirement
          ? "Requirement updated successfully"
          : "Requirement submitted successfully",
        type: "success",
      });
      await fetchRequirements();
      setFormData({
        jobRoles: [
          {
            title: "",
            quantity: 1,
            nationality: "",
            startDate: getMinStartDate(),
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
            ticketFrequency: "",
            workLocations: "",
            previousExperience: "",
            totalExperienceYears: undefined,
            preferredAge: undefined,
            languageRequirements: [],
            specialRequirements: "",
          },
        ],
      });
      setIsModalOpen(false);
      setEditingRequirement(null);
    } catch (error: unknown) {
      toast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit requirement",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  async function deleteRequirement(id: string): Promise<void> {
    const res = await fetch(`/api/requirements/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || "Failed to delete draft");
    }
  }

  /* ------------------------ Render helpers ------------------------ */

  const AddCard = () => (
    <div
      onClick={() => handleOpenModal()}
      className="bg-[#EDDDF3]/60 rounded-xl p-6 shadow-sm cursor-pointer hover:bg-[#EDDDF3] transition-colors flex items-center justify-center min-h-[140px] border-2 border-dashed border-purple-300"
      role="button"
      aria-label="Add new requirement"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleOpenModal()}
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
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative cursor-pointer flex flex-col justify-between"
        role="button"
        aria-label={`View requirement ${requirement.id}`}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleOpenModal(requirement)}
      >
        <div>
          <div className="absolute top-4 right-4 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ArrowUpRight className="text-gray-500" />
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Request ID:</span>
              <span className="ml-2 text-sm text-gray-400">
                {String(requirement.id).substring(0, 8).toUpperCase()}
              </span>
            </div>

            <div>
              <span className="text-sm text-gray-600">Date:</span>
              <span className="ml-2 text-sm text-gray-400">
                {formattedDate}
              </span>
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

        {requirement.status === "DRAFT" && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (!confirm("Delete this draft? This cannot be undone."))
                  return;
                try {
                  await deleteRequirement(requirement.id);
                  toast({ message: "Draft deleted", type: "success" });
                  await fetchRequirements();
                } catch (err: any) {
                  toast({
                    message: err?.message || "Failed to delete draft",
                    type: "error",
                  });
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md"
              aria-label="Delete draft requirement"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  const modalTitle = editingRequirement
    ? isViewMode
      ? "View Requirement"
      : "Edit Draft Requirement"
    : "Submit New Requirement";

  /* ----------------------------- JSX ----------------------------- */

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AddCard />
          {requirements.map((requirement) => (
            <RequirementCard key={requirement.id} requirement={requirement} />
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={
          isSubmitting
            ? () => {}
            : () => handleCloseModal(currentStep === steps.length)
        }
        title={modalTitle}
        size="7xl"
        showFooter={!isViewMode}
        onConfirm={
          isViewMode
            ? undefined
            : currentStep === steps.length
              ? handleSubmit
              : handleNext
        }
        confirmText={
          isViewMode
            ? undefined
            : currentStep === steps.length
              ? editingRequirement
                ? "Update"
                : "Submit"
              : "Continue"
        }
        isConfirmLoading={isSubmitting}
        onCancel={currentStep > 1 && !isViewMode ? handleBack : undefined}
        cancelText={currentStep > 1 && !isViewMode ? "Back" : undefined}
      >
        <div className="flex flex-col h-full relative">
          {/* Language switcher */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
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

          {/* Stepper */}
          <div className="relative px-4 md:px-16 pt-10 pb-4 md:pb-6">
            <div className="absolute inset-x-0 top-1/2 h-0.5 z-0">
              <div className="absolute -left-44 right-0 h-full flex w-full max-w-[1100px] mx-auto">
                <div
                  className="h-full bg-[#2C0053] transition-all duration-300"
                  style={{
                    width:
                      currentStep === 1
                        ? "calc(20%)"
                        : solidWidths[currentStep as 1 | 2] || "100%",
                  }}
                />
                <div
                  className="h-full border-t-2 border-dotted border-gray-300 transition-all duration-300"
                  style={{
                    width:
                      currentStep === 1
                        ? "calc(80%)"
                        : `calc(${100 - ((currentStep - 1) / (steps.length - 1)) * 100}%)`,
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
                    className={`w-10 h-10 md:w-12 md:h-12 mx-auto rounded-full text-base md:text-lg font-bold mb-2 md:mb-3 flex items-center justify-center ${
                      currentStep >= step.id
                        ? "bg-[#2C0053] text-white"
                        : "bg-gray-200 text-gray-600"
                    } ${currentStep > step.id ? "ring-2 ring-[#2C0053]" : ""}`}
                    aria-current={currentStep === step.id ? "step" : undefined}
                  >
                    {step.id}
                  </div>
                  <span
                    className={`text-xs md:text-sm font-medium ${
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-2 md:px-8 pt-2">
            {loadingOptions ? (
              <Card className="p-6">
                <div className="h-32 bg-gray-100 animate-pulse rounded" />
              </Card>
            ) : (
              <>
                {currentStep === 1 && (
                  <Card className="p-4 md:p-6">
                    <div className="text-center mb-2">
                      <h1 className="text-xl md:text-2xl font-semibold mb-1">
                        {t.jobDetails}
                      </h1>
                      <p className="text-sm md:text-base text-gray-700 mb-2">
                        {t.positionsNeeded}
                      </p>
                      <p className="text-xs text-gray-500 italic text-left">
                        {t.sectionNoteJob}
                      </p>
                    </div>

                    <div className="mt-6">
                      <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center">
                        {t.jobRoles}
                      </h2>

                      <div className="rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto md:overflow-x-visible">
                          <table className="min-w-[860px] md:min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#4C187A]/85 sticky top-0">
                              <tr>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/4">
                                  {t.jobRole}
                                </th>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/8">
                                  {t.quantity}
                                </th>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/8">
                                  {t.nationality}
                                </th>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/8">
                                  Start Date
                                </th>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/8">
                                  Duration
                                </th>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                  {t.actions}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-[#2C0053]/10 divide-y divide-gray-200">
                              {formData.jobRoles.map((role, index) => {
                                const totalSalary = calculateTotalSalary(role);

                                // Build currency options for this row:
                                // - include all active currencies
                                // - also include the currently selected one even if now inactive (marked "(inactive)")
                                const activeCurrencies = currencyOptsAll.filter(
                                  (c) => c.isActive
                                );
                                const currentCurrency = currencyOptsAll.find(
                                  (c) => c.value === role.salaryCurrency
                                );
                                const currencyOpts = [
                                  ...activeCurrencies,
                                  ...(currentCurrency &&
                                  !currentCurrency.isActive
                                    ? [currentCurrency]
                                    : []),
                                ];

                                const currentCurrencyIsInactive =
                                  !!currentCurrency &&
                                  !currentCurrency.isActive;

                                return (
                                  <React.Fragment key={index}>
                                    <tr>
                                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                        <select
                                          name={`jobRoles[${index}].title`}
                                          value={role.title}
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          disabled={isViewMode}
                                          aria-label="Job title"
                                        >
                                          <option value="">
                                            {t.selectOption}
                                          </option>
                                          {jobTitleOpts.map((job) => (
                                            <option
                                              key={job.id}
                                              value={job.value}
                                            >
                                              {job.value}
                                            </option>
                                          ))}
                                        </select>
                                        {errors[`jobRoles[${index}].title`] && (
                                          <p className="text-xs text-red-500 mt-1">
                                            {errors[`jobRoles[${index}].title`]}
                                          </p>
                                        )}
                                      </td>

                                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                        <input
                                          type="number"
                                          min="1"
                                          name={`jobRoles[${index}].quantity`}
                                          value={role.quantity}
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          disabled={isViewMode}
                                          aria-label="Quantity"
                                        />
                                        {errors[
                                          `jobRoles[${index}].quantity`
                                        ] && (
                                          <p className="text-xs text-red-500 mt-1">
                                            {
                                              errors[
                                                `jobRoles[${index}].quantity`
                                              ]
                                            }
                                          </p>
                                        )}
                                      </td>

                                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
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
                                          aria-label="Nationality"
                                        />
                                        {errors[
                                          `jobRoles[${index}].nationality`
                                        ] && (
                                          <p className="text-xs text-red-500 mt-1">
                                            {
                                              errors[
                                                `jobRoles[${index}].nationality`
                                              ]
                                            }
                                          </p>
                                        )}
                                      </td>

                                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                        <div className="mt-1 text-[10px] md:text-xs text-gray-500">
                                          Earliest available start date:{" "}
                                          {format(
                                            new Date(getMinStartDateMemo()),
                                            "MMM d, yyyy"
                                          )}
                                        </div>
                                        <input
                                          type="date"
                                          name={`jobRoles[${index}].startDate`}
                                          value={role.startDate}
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          min={getMinStartDateMemo()}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          disabled={isViewMode}
                                          aria-label="Start date"
                                        />
                                        {errors[
                                          `jobRoles[${index}].startDate`
                                        ] && (
                                          <p className="text-xs text-red-500 mt-1">
                                            {
                                              errors[
                                                `jobRoles[${index}].startDate`
                                              ]
                                            }
                                          </p>
                                        )}
                                      </td>

                                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                        <select
                                          name={`jobRoles[${index}].contractDuration`}
                                          value={role.contractDuration || ""}
                                          onChange={(e) =>
                                            handleJobRoleChange(index, e)
                                          }
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                          disabled={isViewMode}
                                          aria-label="Contract duration"
                                        >
                                          <option value="">
                                            Select duration
                                          </option>
                                          {contractDurationOpts.map(
                                            (option) => (
                                              <option
                                                key={option.id}
                                                value={option.value}
                                              >
                                                {option.value}
                                              </option>
                                            )
                                          )}
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

                                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {!isViewMode && (
                                          <button
                                            onClick={() => removeJobRole(index)}
                                            className="text-red-500 hover:text-red-700"
                                            disabled={
                                              formData.jobRoles.length <= 1
                                            }
                                            aria-label="Remove job role"
                                          >
                                            <Trash2 className="w-5 h-5" />
                                          </button>
                                        )}
                                      </td>
                                    </tr>

                                    <tr>
                                      <td
                                        colSpan={7}
                                        className="px-4 md:px-6 py-4"
                                      >
                                        <div className="p-4 rounded-lg shadow bg-white">
                                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                                            <h3 className="text-lg font-semibold">
                                              Salary Details (Monthly)
                                            </h3>
                                            <div className="p-2 rounded-md bg-gray-50">
                                              <span className="font-medium">
                                                Total Salary:{" "}
                                              </span>
                                              <span className="font-bold">
                                                {totalSalary.toFixed(2)}{" "}
                                                {role.salaryCurrency}
                                              </span>
                                              {currentCurrencyIsInactive &&
                                                showInactiveCurrency && (
                                                  <span className="ml-1 text-xs text-red-600 font-medium">
                                                    (inactive)
                                                  </span>
                                                )}
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* left column */}
                                            <div>
                                              {/* Basic salary */}
                                              <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Basic Salary
                                                </label>
                                                <div className="flex">
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    name={`jobRoles[${index}].basicSalary`}
                                                    value={
                                                      role.basicSalary || ""
                                                    }
                                                    onChange={(e) =>
                                                      handleJobRoleChange(
                                                        index,
                                                        e
                                                      )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                                    placeholder="Amount"
                                                    disabled={isViewMode}
                                                    aria-label="Basic salary"
                                                  />
                                                  <select
                                                    name={`jobRoles[${index}].salaryCurrency`}
                                                    value={
                                                      role.salaryCurrency || ""
                                                    }
                                                    onChange={(e) =>
                                                      handleJobRoleChange(
                                                        index,
                                                        e
                                                      )
                                                    }
                                                    className="px-2 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                                    disabled={isViewMode}
                                                    aria-label="Salary currency"
                                                  >
                                                    <option value="">
                                                      {t.selectOption}
                                                    </option>
                                                    {currencyOpts.map((c) => {
                                                      const isCurrent =
                                                        c.value ===
                                                        role.salaryCurrency;
                                                      const disabled =
                                                        c.isActive
                                                          ? false
                                                          : !isCurrent;
                                                      return (
                                                        <option
                                                          key={c.id}
                                                          value={c.value}
                                                          disabled={disabled}
                                                        >
                                                          {c.value}
                                                          {!disabled &&
                                                          showInactiveCurrency &&
                                                          isCurrent &&
                                                          !c.isActive
                                                            ? " (inactive)"
                                                            : ""}
                                                        </option>
                                                      );
                                                    })}
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

                                              {/* Food */}
                                              <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Food Allowance
                                                </label>
                                                <div className="flex items-center">
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    name={`jobRoles[${index}].foodAllowance`}
                                                    value={
                                                      role.foodProvidedByCompany
                                                        ? 0
                                                        : (role.foodAllowance ??
                                                          "")
                                                    }
                                                    onChange={(e) =>
                                                      handleJobRoleChange(
                                                        index,
                                                        e
                                                      )
                                                    }
                                                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                                    placeholder="Amount"
                                                    disabled={
                                                      isViewMode ||
                                                      role.foodProvidedByCompany
                                                    }
                                                    aria-label="Food allowance"
                                                  />
                                                  <div className="flex items-center ml-4">
                                                    <input
                                                      type="checkbox"
                                                      name={`jobRoles[${index}].foodProvidedByCompany`}
                                                      checked={
                                                        role.foodProvidedByCompany ||
                                                        false
                                                      }
                                                      onChange={(e) => {
                                                        handleJobRoleChange(
                                                          index,
                                                          e
                                                        );
                                                        if (e.target.checked) {
                                                          setFormData(
                                                            (prev) => {
                                                              const updated = [
                                                                ...prev.jobRoles,
                                                              ];
                                                              updated[index] = {
                                                                ...updated[
                                                                  index
                                                                ],
                                                                foodAllowance: 0,
                                                              };
                                                              return {
                                                                ...prev,
                                                                jobRoles:
                                                                  updated,
                                                              };
                                                            }
                                                          );
                                                        }
                                                      }}
                                                      className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                                                      disabled={isViewMode}
                                                      aria-label="Food provided by company"
                                                    />
                                                    <label className="ml-2 block text-sm text-gray-700">
                                                      Provided by Company
                                                    </label>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Housing */}
                                              <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Housing Allowance
                                                </label>
                                                <div className="flex items-center">
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    name={`jobRoles[${index}].housingAllowance`}
                                                    value={
                                                      role.housingProvidedByCompany
                                                        ? 0
                                                        : (role.housingAllowance ??
                                                          "")
                                                    }
                                                    onChange={(e) =>
                                                      handleJobRoleChange(
                                                        index,
                                                        e
                                                      )
                                                    }
                                                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                                    placeholder="Amount"
                                                    disabled={
                                                      isViewMode ||
                                                      role.housingProvidedByCompany
                                                    }
                                                    aria-label="Housing allowance"
                                                  />
                                                  <div className="flex items-center ml-4">
                                                    <input
                                                      type="checkbox"
                                                      name={`jobRoles[${index}].housingProvidedByCompany`}
                                                      checked={
                                                        role.housingProvidedByCompany ||
                                                        false
                                                      }
                                                      onChange={(e) => {
                                                        handleJobRoleChange(
                                                          index,
                                                          e
                                                        );
                                                        if (e.target.checked) {
                                                          setFormData(
                                                            (prev) => {
                                                              const updated = [
                                                                ...prev.jobRoles,
                                                              ];
                                                              updated[index] = {
                                                                ...updated[
                                                                  index
                                                                ],
                                                                housingAllowance: 0,
                                                              };
                                                              return {
                                                                ...prev,
                                                                jobRoles:
                                                                  updated,
                                                              };
                                                            }
                                                          );
                                                        }
                                                      }}
                                                      className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                                                      disabled={isViewMode}
                                                      aria-label="Housing provided by company"
                                                    />
                                                    <label className="ml-2 block text-sm text-gray-700">
                                                      Provided by Company
                                                    </label>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Transport */}
                                              <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Transportation Allowance
                                                </label>
                                                <div className="flex items-center">
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    name={`jobRoles[${index}].transportationAllowance`}
                                                    value={
                                                      role.transportationProvidedByCompany
                                                        ? 0
                                                        : (role.transportationAllowance ??
                                                          "")
                                                    }
                                                    onChange={(e) =>
                                                      handleJobRoleChange(
                                                        index,
                                                        e
                                                      )
                                                    }
                                                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                                    placeholder="Amount"
                                                    disabled={
                                                      isViewMode ||
                                                      role.transportationProvidedByCompany
                                                    }
                                                    aria-label="Transportation allowance"
                                                  />
                                                  <div className="flex items-center ml-4">
                                                    <input
                                                      type="checkbox"
                                                      name={`jobRoles[${index}].transportationProvidedByCompany`}
                                                      checked={
                                                        role.transportationProvidedByCompany ||
                                                        false
                                                      }
                                                      onChange={(e) => {
                                                        handleJobRoleChange(
                                                          index,
                                                          e
                                                        );
                                                        if (e.target.checked) {
                                                          setFormData(
                                                            (prev) => {
                                                              const updated = [
                                                                ...prev.jobRoles,
                                                              ];
                                                              updated[index] = {
                                                                ...updated[
                                                                  index
                                                                ],
                                                                transportationAllowance: 0,
                                                              };
                                                              return {
                                                                ...prev,
                                                                jobRoles:
                                                                  updated,
                                                              };
                                                            }
                                                          );
                                                        }
                                                      }}
                                                      className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                                                      disabled={isViewMode}
                                                      aria-label="Transportation provided by company"
                                                    />
                                                    <label className="ml-2 block text-sm text-gray-700">
                                                      Provided by Company
                                                    </label>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            {/* right column */}
                                            <div>
                                              {/* Health Insurance */}
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
                                                        handleJobRoleChange(
                                                          index,
                                                          e
                                                        )
                                                      }
                                                      className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300"
                                                      disabled={isViewMode}
                                                      aria-label="Health insurance as per law"
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
                                                        handleJobRoleChange(
                                                          index,
                                                          e
                                                        )
                                                      }
                                                      className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300"
                                                      disabled={isViewMode}
                                                      aria-label="Health insurance provided by company"
                                                    />
                                                    <label className="ml-2 block text-sm text-gray-700">
                                                      Provided by Company
                                                    </label>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Mobile */}
                                              <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Mobile Allowance
                                                </label>
                                                <div className="flex items-center">
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    name={`jobRoles[${index}].mobileAllowance`}
                                                    value={
                                                      role.mobileProvidedByCompany
                                                        ? 0
                                                        : (role.mobileAllowance ??
                                                          "")
                                                    }
                                                    onChange={(e) =>
                                                      handleJobRoleChange(
                                                        index,
                                                        e
                                                      )
                                                    }
                                                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                                    placeholder="Amount"
                                                    disabled={
                                                      isViewMode ||
                                                      role.mobileProvidedByCompany
                                                    }
                                                    aria-label="Mobile allowance"
                                                  />
                                                  <div className="flex items-center ml-4">
                                                    <input
                                                      type="checkbox"
                                                      name={`jobRoles[${index}].mobileProvidedByCompany`}
                                                      checked={
                                                        role.mobileProvidedByCompany ||
                                                        false
                                                      }
                                                      onChange={(e) => {
                                                        handleJobRoleChange(
                                                          index,
                                                          e
                                                        );
                                                        if (e.target.checked) {
                                                          setFormData(
                                                            (prev) => {
                                                              const updated = [
                                                                ...prev.jobRoles,
                                                              ];
                                                              updated[index] = {
                                                                ...updated[
                                                                  index
                                                                ],
                                                                mobileAllowance: 0,
                                                              };
                                                              return {
                                                                ...prev,
                                                                jobRoles:
                                                                  updated,
                                                              };
                                                            }
                                                          );
                                                        }
                                                      }}
                                                      className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                                                      disabled={isViewMode}
                                                      aria-label="Mobile provided by company"
                                                    />
                                                    <label className="ml-2 block text-sm text-gray-700">
                                                      Provided by Company
                                                    </label>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Nature of work */}
                                              <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Nature of Work Allowance
                                                </label>
                                                <div className="flex">
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    name={`jobRoles[${index}].natureOfWorkAllowance`}
                                                    value={
                                                      role.natureOfWorkAllowance ??
                                                      ""
                                                    }
                                                    onChange={(e) =>
                                                      handleJobRoleChange(
                                                        index,
                                                        e
                                                      )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                                    placeholder="Amount"
                                                    disabled={isViewMode}
                                                    aria-label="Nature of work allowance"
                                                  />
                                                </div>
                                              </div>

                                              {/* Other */}
                                              <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Other Allowance
                                                </label>
                                                <div className="flex">
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    name={`jobRoles[${index}].otherAllowance`}
                                                    value={
                                                      role.otherAllowance ?? ""
                                                    }
                                                    onChange={(e) =>
                                                      handleJobRoleChange(
                                                        index,
                                                        e
                                                      )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                                    placeholder="Amount"
                                                    disabled={isViewMode}
                                                    aria-label="Other allowance"
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
                                                {/* Ticket Frequency */}
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
                                                    {ticketFrequencyOpts.map(
                                                      (option) => (
                                                        <div
                                                          key={option.id}
                                                          className="flex items-center"
                                                        >
                                                          <input
                                                            type="radio"
                                                            id={`ticketFrequency-${index}-${option.id}`}
                                                            name={`jobRoles[${index}].ticketFrequency`}
                                                            value={option.value}
                                                            checked={
                                                              role.ticketFrequency ===
                                                              option.value
                                                            }
                                                            onChange={(e) =>
                                                              handleJobRoleChange(
                                                                index,
                                                                e
                                                              )
                                                            }
                                                            className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300"
                                                            disabled={
                                                              isViewMode
                                                            }
                                                            aria-label={`Ticket frequency ${option.value}`}
                                                          />
                                                          <label
                                                            htmlFor={`ticketFrequency-${index}-${option.id}`}
                                                            className="ml-2 block text-sm text-gray-700"
                                                          >
                                                            {option.value}
                                                          </label>
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                </div>

                                                {/* Work Locations */}
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
                                                    {workLocationOpts.map(
                                                      (option) => (
                                                        <div
                                                          key={option.id}
                                                          className="flex items-center"
                                                        >
                                                          <input
                                                            type="radio"
                                                            id={`workLocations-${index}-${option.id}`}
                                                            name={`jobRoles[${index}].workLocations`}
                                                            value={option.value}
                                                            checked={
                                                              role.workLocations ===
                                                              option.value
                                                            }
                                                            onChange={(e) =>
                                                              handleJobRoleChange(
                                                                index,
                                                                e
                                                              )
                                                            }
                                                            className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300"
                                                            disabled={
                                                              isViewMode
                                                            }
                                                            aria-label={`Work location ${option.value}`}
                                                          />
                                                          <label
                                                            htmlFor={`workLocations-${index}-${option.id}`}
                                                            className="ml-2 block text-sm text-gray-700"
                                                          >
                                                            {option.value}
                                                          </label>
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                </div>
                                              </div>

                                              <div>
                                                {/* Previous Experience */}
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
                                                    {prevExpOpts.map(
                                                      (option) => (
                                                        <div
                                                          key={option.id}
                                                          className="flex items-center"
                                                        >
                                                          <input
                                                            type="radio"
                                                            id={`previousExperience-${index}-${option.id}`}
                                                            name={`jobRoles[${index}].previousExperience`}
                                                            value={option.value}
                                                            checked={
                                                              role.previousExperience ===
                                                              option.value
                                                            }
                                                            onChange={(e) =>
                                                              handleJobRoleChange(
                                                                index,
                                                                e
                                                              )
                                                            }
                                                            className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300"
                                                            disabled={
                                                              isViewMode
                                                            }
                                                            aria-label={`Previous experience ${option.value}`}
                                                          />
                                                          <label
                                                            htmlFor={`previousExperience-${index}-${option.id}`}
                                                            className="ml-2 block text-sm text-gray-700"
                                                          >
                                                            {option.value}
                                                          </label>
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                </div>

                                                {/* Total Experience */}
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
                                                      role.totalExperienceYears ??
                                                      ""
                                                    }
                                                    onChange={(e) =>
                                                      handleJobRoleChange(
                                                        index,
                                                        e
                                                      )
                                                    }
                                                    required={
                                                      role.previousExperience !==
                                                      "FRESHER"
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                                    placeholder="e.g., 5"
                                                    disabled={
                                                      isViewMode ||
                                                      role.previousExperience ===
                                                        "FRESHER"
                                                    }
                                                    aria-label="Total experience years"
                                                  />
                                                </div>

                                                {/* Preferred age */}
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
                                                    value={
                                                      role.preferredAge ?? ""
                                                    }
                                                    onChange={(e) =>
                                                      handleJobRoleChange(
                                                        index,
                                                        e
                                                      )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                                                    placeholder="e.g., 30"
                                                    disabled={isViewMode}
                                                    aria-label="Preferred age"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Language & Notes */}
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
                                                  {languageOpts.map((lng) => (
                                                    <div
                                                      key={lng.id}
                                                      className="flex items-center"
                                                    >
                                                      <input
                                                        type="checkbox"
                                                        id={`lang-${index}-${lng.id}`}
                                                        checked={
                                                          role.languageRequirements?.includes(
                                                            lng.value
                                                          ) || false
                                                        }
                                                        onChange={() =>
                                                          toggleLanguageRequirement(
                                                            lng.value,
                                                            index
                                                          )
                                                        }
                                                        className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                                                        disabled={isViewMode}
                                                        aria-label={`Language requirement ${lng.value}`}
                                                      />
                                                      <label
                                                        htmlFor={`lang-${index}-${lng.id}`}
                                                        className="ml-2 text-sm text-gray-700"
                                                      >
                                                        {lng.value}
                                                      </label>
                                                    </div>
                                                  ))}
                                                </div>

                                                {/* NOTE: removed the "Add custom language" UI per your request */}
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
                                                  value={
                                                    role.specialRequirements ||
                                                    ""
                                                  }
                                                  onChange={(e) =>
                                                    handleJobRoleChange(
                                                      index,
                                                      e
                                                    )
                                                  }
                                                  rows={5}
                                                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C0053] focus:border-[#2C0053]"
                                                  placeholder={
                                                    t.specialRequirementsPlaceholder
                                                  }
                                                  disabled={isViewMode}
                                                  aria-label="Special requirements"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="px-4 md:px-6 py-3 text-left">
                        {!isViewMode && (
                          <Button
                            type="button"
                            variant="default"
                            onClick={addJobRole}
                            className="mr-0 md:mr-4"
                            disabled={isSubmitting}
                          >
                            {t.addAnotherRole}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {currentStep === 2 && (
                  <Card className="p-4 md:p-6">
                    <div className="text-center mb-0">
                      <h1 className="text-xl md:text-2xl font-semibold mb-1">
                        {t.reviewTitle}
                      </h1>
                      <p className="text-sm md:text-base text-gray-700 mb-2">
                        {t.verifyInfo}
                      </p>
                    </div>

                    <div className="mt-6 space-y-6">
                      {formData.jobRoles.map((role, index) => {
                        const totalSalary = calculateTotalSalary(role);
                        const formattedStartDate = role.startDate
                          ? format(new Date(role.startDate), "MMM d, yyyy")
                          : "Not specified";

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
                                <ReviewField
                                  label="Job Title"
                                  value={role.title}
                                />
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
                                  value={
                                    role.contractDuration || "Not specified"
                                  }
                                />
                                <ReviewField
                                  label="Basic Salary"
                                  value={`${role.basicSalary} ${role.salaryCurrency || ""}`}
                                />
                              </div>
                              <div>
                                <ReviewField
                                  label="Total Salary"
                                  value={`${totalSalary.toFixed(2)} ${role.salaryCurrency || ""}`}
                                />
                                <ReviewField
                                  label="Language Requirements"
                                  value={
                                    role.languageRequirements?.join(", ") ||
                                    "Not specified"
                                  }
                                />
                                <ReviewField
                                  label="Ticket Frequency"
                                  value={
                                    role.ticketFrequency || "Not specified"
                                  }
                                />
                                <ReviewField
                                  label="Work Locations"
                                  value={role.workLocations || "Not specified"}
                                />
                                <ReviewField
                                  label="Previous Experience"
                                  value={
                                    role.previousExperience || "Not specified"
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
                )}
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
