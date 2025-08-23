// app/(protected)/dashboard/agency/candidates/page.tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Plus,
  MoreVertical,
  Download,
  Upload,
  Check,
  X,
  Clock,
  User,
  Trash2,
  FileText,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/toast-provider";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import {
  LabourProfileStatus,
  DocumentVerificationStatus,
  Gender,
} from "@/lib/generated/prisma";
import { Card } from "@/components/shared/Card";
import { Select } from "@/components/ui/select";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { FixedSizeGrid as Grid } from "react-window";

interface LabourProfile {
  experience: string;
  education: string;
  languages: never[];
  jobRole: string;
  id: string;
  name: string;
  profileImage?: string;
  age: number;
  gender: Gender;
  nationality: string;
  email?: string;
  phone?: string;
  passportNumber?: string;
  passportExpiry?: Date;
  passportVerified: boolean;
  status: LabourProfileStatus;
  verificationStatus: DocumentVerificationStatus;
  createdAt: Date;
  updatedAt: Date;
  documentsSubmittedAt?: Date;
  documentsVerifiedAt?: Date;
  requirement: {
    id: string;
    jobRoles: {
      title: string;
    }[];
  };
  documents: {
    id: string;
    type: string;
    url: string;
    status: string;
  }[];
  skills: string[];
}

interface FormData {
  id?: string;
  name: string;
  profileImage: File | null;
  passportCopy: File | null;
  age: number;
  gender: Gender;
  nationality: string;
  email: string;
  phone: string;
  passportNumber: string;
  passportExpiry: string;
  countryCode: string;
  jobRole: string;
  skills: string[];
  experience: string;
  education: string;
  languages: string[];
  status: LabourProfileStatus;
  verificationStatus: DocumentVerificationStatus;
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

const languageOptions = [
  "English",
  "Arabic",
  "Hindi",
  "Urdu",
  "Bengali",
  "Tamil",
  "Malayalam",
  "Tagalog",
  "Nepali",
  "Sinhala",
];

const skillOptions = [
  "Construction",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Welding",
  "Masonry",
  "Painting",
  "Driving",
  "Cleaning",
  "Cooking",
  "Housekeeping",
  "Gardening",
  "Security",
  "Mechanical",
  "Fabrication",
];

export default function Candidates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [labourProfiles, setLabourProfiles] = useState<LabourProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { t } = useLanguage();
  const [filters, setFilters] = useState({
    status: "",
    nationality: "",
    verificationStatus: "",
    jobRole: "",
  });
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    profileImage: null,
    passportCopy: null,
    age: 18,
    gender: "MALE",
    nationality: "",
    email: "",
    phone: "",
    passportNumber: "",
    passportExpiry: "",
    countryCode: "+974",
    jobRole: "",
    skills: [],
    experience: "",
    education: "",
    languages: [],
    status: "RECEIVED",
    verificationStatus: "PENDING",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---- NEW: responsive container metrics for virtual grid ----
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [viewportH, setViewportH] = useState<number>(0);

  const recomputeLayout = useCallback(() => {
    if (typeof window === "undefined") return;
    setViewportH(window.innerHeight || 800);
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
  }, []);

  useEffect(() => {
    // measure on mount
    recomputeLayout();
    if (typeof window !== "undefined") {
      const onResize = () => recomputeLayout();
      window.addEventListener("resize", onResize);
      // ResizeObserver for container width changes
      const ro =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => recomputeLayout())
          : null;
      if (ro && containerRef.current) ro.observe(containerRef.current);
      return () => {
        window.removeEventListener("resize", onResize);
        if (ro && containerRef.current) ro.unobserve(containerRef.current);
      };
    }
  }, [recomputeLayout]);

  // Fetch labour profiles from API
  useEffect(() => {
    const fetchLabourProfiles = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/agencies/labour-profiles");
        if (response.ok) {
          const data = await response.json();
          setLabourProfiles(data.labourProfiles);
        } else {
          throw new Error("Failed to fetch labour profiles");
        }
      } catch (error) {
        console.error("Error fetching labour profiles:", error);
        toast({
          type: "error",
          message: "Failed to load labour profiles",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLabourProfiles();
  }, [toast]);

  // ---- NEW: responsive column logic for react-window grid ----
  const getColumnCount = (width: number): 1 | 2 | 3 | 4 => {
    if (width < 640) return 1;
    if (width < 1024) return 2;
    if (width < 1280) return 3;
    return 4;
  };

  const columnCount = useMemo(
    () => getColumnCount(containerWidth),
    [containerWidth]
  );

  // keep card aspect ~ original (300x500). Clamp widths to avoid giant/super-narrow cards.
  const columnWidth = useMemo(() => {
    if (containerWidth === 0) return 320;
    const padding = 16; // grid gutter compensation
    const raw = Math.floor(
      (containerWidth - padding * (columnCount + 1)) / columnCount
    );
    return Math.max(280, Math.min(raw, 360));
  }, [columnCount, containerWidth]);

  const CARD_HEIGHT = useMemo(() => {
    // Scale height proportionally, slightly taller on desktop
    const ratio = 1.6; // 300x480-ish
    return Math.round(columnWidth * ratio);
  }, [columnWidth]);

  const gridHeight = useMemo(() => {
    // viewport minus header/filters/modal padding (approx)
    const headerOffset = 220; // keeps bottom padding and avoids hidden content
    const h = Math.max(320, viewportH - headerOffset);
    return h;
  }, [viewportH]);

  // Delete a labour profile
  const handleDeleteProfile = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/agencies/labour-profiles?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLabourProfiles((prev) =>
          prev.filter((profile) => profile.id !== id)
        );
        toast({
          type: "success",
          message: "Labour profile deleted successfully",
        });
      } else {
        throw new Error("Failed to delete profile");
      }
    } catch (error) {
      console.error("Error deleting labour profile:", error);
      toast({
        type: "error",
        message: "Failed to delete labour profile",
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit a labour profile
  const handleEditProfile = (profile: LabourProfile) => {
    setIsEditMode(true);
    setFormData({
      id: profile.id,
      name: profile.name,
      profileImage: null,
      passportCopy: null,
      age: profile.age,
      gender: profile.gender,
      nationality: profile.nationality,
      email: profile.email || "",
      phone: profile.phone || "",
      passportNumber: profile.passportNumber || "",
      passportExpiry: profile.passportExpiry
        ? format(profile.passportExpiry, "yyyy-MM-dd")
        : "",
      countryCode: "+974",
      jobRole: profile.jobRole || "",
      skills: profile.skills || [],
      experience: profile.experience || "",
      education: profile.education || "",
      languages: profile.languages || [],
      status: profile.status,
      verificationStatus: profile.verificationStatus,
    });
    setIsConfirmed(false);
    setIsModalOpen(true);
  };

  // Download Excel template
  const downloadTemplate = () => {
    const templateData = [
      {
        "Full Name": "Example: John Smith",
        Age: "30",
        Gender: "MALE/FEMALE/OTHER",
        Nationality: "Country name",
        Email: "example@email.com",
        Phone: "+1234567890",
        "Passport Number": "A12345678",
        "Passport Expiry": "2025-12-31",
        Status: "RECEIVED/UNDER_REVIEW/APPROVED/REJECTED",
        "Job Role": "Construction/Plumbing/etc",
        Skills: "Construction,Plumbing",
        Experience: "5 years",
        Education: "High School",
        Languages: "English,Hindi",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LabourProfiles");

    const columnWidths = [
      { wch: 20 },
      { wch: 5 },
      { wch: 10 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.writeFile(workbook, "labour_profile_template.xlsx");
  };

  const countryOptions = useMemo(
    () =>
      t.nationalityOptions?.map((nat) => ({
        value: nat,
        label: nat,
      })) || [],
    [t.nationalityOptions]
  );

  // Handle Excel file import
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const response = await fetch("/api/agencies/labour-profiles/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profiles: jsonData }),
      });

      if (response.ok) {
        const result = await response.json();
        setLabourProfiles((prev) => [...result.profiles, ...prev]);
        toast({
          type: "success",
          message: `Imported ${result.count} profiles successfully`,
        });
      } else {
        throw new Error("Failed to import profiles");
      }
    } catch (error) {
      console.error("Error importing profiles:", error);
      toast({
        type: "error",
        message: "Failed to import profiles. Please check the file format.",
      });
    } finally {
      setLoading(false);
      if (e.target) e.target.value = "";
    }
  };

  // Filter profiles
  const filteredProfiles = labourProfiles.filter((profile) => {
    return (
      (!filters.status || profile.status === filters.status) &&
      (!filters.nationality || profile.nationality === filters.nationality) &&
      (!filters.verificationStatus ||
        profile.verificationStatus === filters.verificationStatus) &&
      (!filters.jobRole ||
        (profile.jobRole && profile.jobRole === filters.jobRole))
    );
  });

  // Document Verification Status Component
  const VerificationStatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "VERIFIED":
        return <Check className="w-4 h-4 text-green-500" />;
      case "PARTIALLY_VERIFIED":
        return <Check className="w-4 h-4 text-yellow-500" />;
      case "REJECTED":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Steps handlers (unchanged)
  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast({
        type: "error",
        message: "Please fill all required fields",
      });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const validateStep = (step: number): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = "Name is required";
      if (!formData.age || formData.age < 18 || formData.age > 70)
        newErrors.age = "Age must be between 18 and 70";
      if (!formData.nationality)
        newErrors.nationality = "Nationality is required";
      if (!formData.passportNumber)
        newErrors.passportNumber = "Passport number is required";
      if (!formData.passportExpiry)
        newErrors.passportExpiry = "Passport expiry is required";
      if (!formData.jobRole) newErrors.jobRole = "Job role is required";
    }
    if (step === 2 && !isEditMode) {
      if (!formData.profileImage)
        newErrors.profileImage = "Profile image is required";
      if (!formData.passportCopy)
        newErrors.passportCopy = "Passport copy is required";
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      if (formData.profileImage)
        formDataToSend.append("profileImage", formData.profileImage);
      if (formData.passportCopy)
        formDataToSend.append("passportCopy", formData.passportCopy);
      formDataToSend.append("age", formData.age.toString());
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("nationality", formData.nationality);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("passportNumber", formData.passportNumber);
      formDataToSend.append("passportExpiry", formData.passportExpiry);
      formDataToSend.append("jobRole", formData.jobRole);
      formDataToSend.append("skills", formData.skills.join(","));
      formDataToSend.append("experience", formData.experience);
      formDataToSend.append("education", formData.education);
      formDataToSend.append("languages", formData.languages.join(","));
      formDataToSend.append("status", formData.status);
      formDataToSend.append("verificationStatus", formData.verificationStatus);

      const url =
        isEditMode && formData.id
          ? `/api/agencies/labour-profiles?id=${formData.id}`
          : "/api/agencies/labour-profiles";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, { method, body: formDataToSend });

      if (response.ok) {
        const updatedProfile = await response.json();
        if (isEditMode) {
          setLabourProfiles((prev) =>
            prev.map((profile) =>
              profile.id === updatedProfile.id ? updatedProfile : profile
            )
          );
        } else {
          setLabourProfiles((prev) => [updatedProfile, ...prev]);
        }
        toast({
          type: "success",
          message: `Labour profile ${isEditMode ? "updated" : "submitted"} successfully`,
        });
        setIsModalOpen(false);
        resetForm();
      } else {
        throw new Error(
          `Failed to ${isEditMode ? "update" : "submit"} profile`
        );
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "submitting"} profile:`,
        error
      );
      toast({
        type: "error",
        message: `Failed to ${isEditMode ? "update" : "submit"} profile. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      profileImage: null,
      passportCopy: null,
      age: 18,
      gender: "MALE",
      nationality: "",
      email: "",
      phone: "",
      passportNumber: "",
      passportExpiry: "",
      countryCode: "+974",
      jobRole: "",
      skills: [],
      experience: "",
      education: "",
      languages: [],
      status: "RECEIVED",
      verificationStatus: "PENDING",
    });
    setCurrentStep(1);
    setErrors({});
    setIsEditMode(false);
    setIsConfirmed(false);
  };

  const handleFileChange = (field: keyof FormData, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleLanguage = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
  };

  const LabourProfileSkeleton = () => (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden h-full flex flex-col animate-pulse">
      <div className="relative h-40 bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="flex flex-wrap gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderModalFooter = () => (
    <div className="flex justify-end gap-3">
      {currentStep > 1 && (
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
      )}
      {currentStep < 3 && (
        <Button variant="default" onClick={handleNext} disabled={isSubmitting}>
          Next
        </Button>
      )}
      {currentStep === 3 && (
        <Button
          variant="default"
          onClick={handleSubmit}
          disabled={isSubmitting || !isConfirmed}
        >
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Submitting..."
            : isEditMode
              ? "Update"
              : "Submit"}
        </Button>
      )}
    </div>
  );

  // Labour Profile Card (unchanged UI)
  const LabourProfileCard = ({ profile }: { profile: LabourProfile }) => {
    const statusColors = {
      RECEIVED: "bg-blue-100 text-blue-800",
      UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      SHORTLISTED: "bg-purple-100 text-purple-800",
      DEPLOYED: "bg-indigo-100 text-indigo-800",
    };
    const verificationColors = {
      PENDING: "bg-gray-100 text-gray-800",
      PARTIALLY_VERIFIED: "bg-yellow-100 text-yellow-800",
      VERIFIED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="relative h-40 bg-gray-100">
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <User className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        <div className="p-4 flex justify-between items-start border-b border-gray-200">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {profile.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {profile.nationality} • {profile.age} years •{" "}
              {profile.gender.toLowerCase()}
            </p>
            {profile.jobRole && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                Job Role: {profile.jobRole}
              </p>
            )}
            {profile.requirement?.jobRoles?.length > 0 && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                For:{" "}
                {profile.requirement.jobRoles.map((r) => r.title).join(", ")}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditProfile(profile)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => handleDeleteProfile(profile.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                statusColors[profile.status as keyof typeof statusColors] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {profile.status.replace("_", " ")}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                verificationColors[
                  profile.verificationStatus as keyof typeof verificationColors
                ]
              }`}
            >
              <div className="flex items-center gap-1">
                <VerificationStatusIcon status={profile.verificationStatus} />
                {profile.verificationStatus.replace("_", " ")}
              </div>
            </span>
          </div>

          <div className="text-sm">
            <p className="text-gray-500">Passport</p>
            <div className="flex items-center gap-1">
              {profile.passportVerified ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <X className="w-3 h-3 text-red-500" />
              )}
              <span className="truncate">
                {profile.passportNumber || "Not provided"}
              </span>
            </div>
          </div>

          {profile.skills?.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Skills</p>
              <div className="flex flex-wrap gap-1">
                {profile.skills.slice(0, 3).map((skill: string) => (
                  <span
                    key={skill}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
                {profile.skills.length > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    +{profile.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {profile.documents?.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Documents</p>
              <div className="flex flex-wrap gap-1">
                {profile.documents.slice(0, 3).map((doc) => (
                  <span
                    key={doc.id}
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                  >
                    {doc.type}
                  </span>
                ))}
                {profile.documents.length > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    +{profile.documents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {profile.documentsSubmittedAt && (
            <div className="text-xs text-gray-500 mt-2">
              Submitted:{" "}
              {format(new Date(profile.documentsSubmittedAt), "MMM d, yyyy")}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add Card with Import/Export options (unchanged UI)
  const AddCard = () => (
    <div className="flex flex-col gap-4 h-full">
      <div
        onClick={() => {
          setIsEditMode(false);
          setIsModalOpen(true);
        }}
        className="bg-purple-50 rounded-lg border-2 border-dashed border-purple-300 p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 transition-colors h-full"
      >
        <Plus className="w-10 h-10 text-purple-600 mb-2" />
        <span className="text-purple-700 font-medium">Add Labour Profile</span>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Template
        </Button>

        <label className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
          <Upload className="w-4 h-4" />
          Import Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );

  // ---- NEW: Responsive virtual grid component ----
  const GridVirtual = () => {
    const items = useMemo(
      () => [null, ...filteredProfiles],
      [filteredProfiles]
    ); // index 0 = AddCard
    const rowCount = Math.ceil(items.length / Math.max(1, columnCount));

    // guard while measuring first time
    if (containerWidth === 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AddCard />
          {filteredProfiles.slice(0, 7).map((_, i) => (
            <LabourProfileSkeleton key={i} />
          ))}
        </div>
      );
    }

    return (
      <div className="overflow-auto">
        <Grid
          columnCount={Math.max(1, columnCount)}
          columnWidth={columnWidth}
          height={gridHeight}
          rowCount={rowCount}
          rowHeight={CARD_HEIGHT}
          width={Math.min(
            containerWidth,
            columnWidth * columnCount + 16 * (columnCount + 1)
          )}
        >
          {({ columnIndex, rowIndex, style }) => {
            const index = rowIndex * Math.max(1, columnCount) + columnIndex;
            const profile = items[index];

            return (
              <div
                style={{
                  ...style,
                  left: (style as any).left + 16,
                  top: (style as any).top + 16,
                }}
              >
                <div
                  className="px-2 py-2 h-full w-full"
                  style={{ width: columnWidth }}
                >
                  {index === 0 ? (
                    <AddCard />
                  ) : profile ? (
                    <LabourProfileCard profile={profile as LabourProfile} />
                  ) : null}
                </div>
              </div>
            );
          }}
        </Grid>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filter controls (already responsive) */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full md:w-auto flex-wrap">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="DEPLOYED">Deployed</option>
            </select>

            <select
              value={filters.verificationStatus}
              onChange={(e) =>
                setFilters({ ...filters, verificationStatus: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Verification</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIALLY_VERIFIED">Partially Verified</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={filters.nationality}
              onChange={(e) =>
                setFilters({ ...filters, nationality: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Nationalities</option>
              {countryOptions.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>

            <select
              value={filters.jobRole}
              onChange={(e) =>
                setFilters({ ...filters, jobRole: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Job Roles</option>
              {t.jobPositions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <LabourProfileSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div ref={containerRef} className="w-full">
            <GridVirtual />
          </div>
        )}
      </div>

      {/* Add/Edit Profile Modal (unchanged, just keeps your layout) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEditMode ? "Edit Labour Profile" : "Add Labour Profile"}
        size="7xl"
        showFooter={true}
        footerContent={renderModalFooter()}
        className="w-full max-w-[95vw] h-[calc(100vh-40px)] flex flex-col"
      >
        <div className="flex flex-col h-full relative">
          {/* Progress bar with steps */}
          <div className="relative px-6 sm:px-12 md:px-16 pt-8 pb-6">
            <div className="absolute inset-x-0 top-1/2 h-0.5 z-0">
              <div className="absolute -left-10 sm:-left-20 md:-left-44 right-0 h-full flex w-full max-w-[1555px] mx-auto">
                <div
                  className="h-full bg-[#2C0053] transition-all duration-300"
                  style={{
                    width:
                      currentStep === 1
                        ? "calc(30% - 75px)"
                        : currentStep === 2
                          ? "calc(50% + 340px)"
                          : "2800px",
                  }}
                />
                <div
                  className="h-full border-t-2 border-dotted border-gray-300 transition-all duration-300"
                  style={{
                    width:
                      currentStep === 1
                        ? `calc(100% - 60px)`
                        : `calc(${100 - ((currentStep - 1) / 2) * 100}% + 60px)`,
                  }}
                />
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex justify-between relative z-10 mt-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className="text-center flex-1 max-w-[200px] relative"
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full text-base sm:text-lg font-bold mb-3 flex items-center justify-center ${
                      currentStep >= step
                        ? "bg-[#2C0053] text-white"
                        : "bg-gray-200 text-gray-600"
                    } ${currentStep > step ? "ring-2 ring-[#2C0053]" : ""}`}
                    aria-current={currentStep === step ? "step" : undefined}
                  >
                    {step}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      currentStep >= step ? "text-[#2C0053]" : "text-gray-500"
                    }`}
                  >
                    {step === 1
                      ? "Details"
                      : step === 2
                        ? "Documents"
                        : "Review"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-2 pb-6">
            {currentStep === 1 && (
              <Card className="p-6">
                <div className="text-center mb-2">
                  <h1 className="text-2xl font-semibold mb-1">
                    Personal Information
                  </h1>
                  <p className="text-base text-gray-700 mb-2">
                    {isEditMode ? "Update" : "Enter"} the labour&apos;s personal
                    details
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                  <div className="lg:col-span-5 space-y-4">
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      required
                      error={errors.name}
                      placeholder="Enter full name"
                    />

                    <Input
                      label="Age"
                      name="age"
                      type="number"
                      max="70"
                      value={formData.age.toString()}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          age: parseInt(e.target.value) || 18,
                        });
                        if (errors.age) setErrors({ ...errors, age: "" });
                      }}
                      required
                      error={errors.age}
                      placeholder="Enter age"
                    />

                    <Select
                      label="Gender"
                      name="gender"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as Gender,
                        })
                      }
                      options={[
                        { value: "MALE", label: "Male" },
                        { value: "FEMALE", label: "Female" },
                        { value: "OTHER", label: "Other" },
                      ]}
                    />

                    <AutocompleteInput
                      label="Nationality"
                      value={formData.nationality}
                      onChangeValue={(value) => {
                        setFormData({ ...formData, nationality: value });
                        if (errors.nationality)
                          setErrors({ ...errors, nationality: "" });
                      }}
                      options={countryOptions.map((c) => c.label)}
                      placeholder="Type nationality..."
                      error={errors.nationality}
                    />

                    <Select
                      label="Job Role"
                      name="jobRole"
                      value={formData.jobRole}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jobRole: e.target.value,
                        })
                      }
                      options={[
                        { value: "", label: "Select a job role" },
                        ...t.jobPositions.map((role) => ({
                          value: role,
                          label: role,
                        })),
                      ]}
                      required
                      error={errors.jobRole}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skills
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {skillOptions.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1 text-xs rounded-full ${
                              formData.skills.includes(skill)
                                ? "bg-blue-100 text-blue-800 border border-blue-300"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:flex lg:col-span-2 justify-center items-center">
                    <div className="w-[2px] h-2/3 bg-[#2C0053]/30 rounded-full"></div>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Enter email address"
                    />

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select
                        label="Country Code"
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            countryCode: e.target.value,
                          })
                        }
                        options={countryCodes.map((cc) => ({
                          value: cc.code,
                          label: `${cc.code} (${cc.name})`,
                        }))}
                        className="sm:w-40"
                      />
                      <Input
                        label="Phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="Enter phone number"
                        className="flex-1"
                      />
                    </div>

                    <Input
                      label="Passport Number"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          passportNumber: e.target.value,
                        });
                        if (errors.passportNumber)
                          setErrors({ ...errors, passportNumber: "" });
                      }}
                      required
                      error={errors.passportNumber}
                      placeholder="Enter passport number"
                    />

                    <Input
                      label="Passport Expiry"
                      name="passportExpiry"
                      type="date"
                      value={formData.passportExpiry}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          passportExpiry: e.target.value,
                        });
                        if (errors.passportExpiry)
                          setErrors({ ...errors, passportExpiry: "" });
                      }}
                      required
                      error={errors.passportExpiry}
                    />

                    <Input
                      label="Experience"
                      name="experience"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                      placeholder="e.g. 5 years in construction"
                    />

                    <Input
                      label="Education"
                      name="education"
                      value={formData.education}
                      onChange={(e) =>
                        setFormData({ ...formData, education: e.target.value })
                      }
                      placeholder="e.g. High School Diploma"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Languages
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {languageOptions.map((language) => (
                          <button
                            key={language}
                            type="button"
                            onClick={() => toggleLanguage(language)}
                            className={`px-3 py-1 text-xs rounded-full ${
                              formData.languages.includes(language)
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {language}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="p-6">
                <div className="text-center mb-2">
                  <h1 className="text-2xl font-semibold mb-1">
                    Document Submission
                  </h1>
                  <p className="text-base text-gray-700 mb-2">
                    {isEditMode ? "Update" : "Upload"} required documents for
                    verification
                  </p>
                </div>

                <div className="space-y-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Photo
                      {!isEditMode && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300">
                        {formData.profileImage ? (
                          <Image
                            src={URL.createObjectURL(formData.profileImage)}
                            alt="Profile preview"
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : isEditMode && formData.id ? (
                          <img
                            src={
                              labourProfiles.find((p) => p.id === formData.id)
                                ?.profileImage || ""
                            }
                            alt="Current profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(
                              "profileImage",
                              e.target.files?.[0] || null
                            )
                          }
                          className="hidden"
                          id="profileImage"
                        />
                        <label
                          htmlFor="profileImage"
                          className="inline-block px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          {formData.profileImage || (isEditMode && formData.id)
                            ? "Change Photo"
                            : "Upload Photo"}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Clear face photo, max 5MB
                        </p>
                        {errors.profileImage && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.profileImage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passport Copy (PDF)
                      {!isEditMode && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative w-24 h-24 rounded-md bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                        {formData.passportCopy ? (
                          <div className="p-2 text-center">
                            <FileText className="w-8 h-8 text-blue-500 mx-auto" />
                            <p className="text-xs mt-1 text-gray-600 truncate w-20">
                              {formData.passportCopy.name}
                            </p>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FileText className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 w-full">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) =>
                            handleFileChange(
                              "passportCopy",
                              e.target.files?.[0] || null
                            )
                          }
                          className="hidden"
                          id="passportCopy"
                        />
                        <label
                          htmlFor="passportCopy"
                          className="inline-block px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          {formData.passportCopy
                            ? "Change Passport"
                            : "Upload Passport"}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Scanned copy of passport, PDF only, max 5MB
                        </p>
                        {errors.passportCopy && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.passportCopy}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="p-6">
                <div className="text-center mb-2">
                  <h1 className="text-2xl font-semibold mb-1">
                    Review & {isEditMode ? "Update" : "Submit"}
                  </h1>
                  <p className="text-base text-gray-700 mb-2">
                    Verify all information before{" "}
                    {isEditMode ? "updating" : "submission"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                      Personal Information
                    </h2>
                    <div className="space-y-3">
                      <ReviewField label="Full Name" value={formData.name} />
                      <ReviewField
                        label="Age"
                        value={formData.age.toString()}
                      />
                      <ReviewField label="Gender" value={formData.gender} />
                      <ReviewField
                        label="Nationality"
                        value={formData.nationality}
                      />
                      <ReviewField
                        label="Job Role"
                        value={formData.jobRole || "Not specified"}
                      />
                      <ReviewField label="Email" value={formData.email} />
                      <ReviewField
                        label="Phone"
                        value={`${formData.countryCode}${formData.phone}`}
                      />
                      <ReviewField
                        label="Passport Number"
                        value={formData.passportNumber}
                      />
                      <ReviewField
                        label="Passport Expiry"
                        value={
                          formData.passportExpiry
                            ? format(
                                new Date(formData.passportExpiry),
                                "MMM d, yyyy"
                              )
                            : "Not provided"
                        }
                      />
                      <ReviewField
                        label="Experience"
                        value={formData.experience || "Not provided"}
                      />
                      <ReviewField
                        label="Education"
                        value={formData.education || "Not provided"}
                      />
                      <ReviewField
                        label="Skills"
                        value={
                          formData.skills.length > 0
                            ? formData.skills.join(", ")
                            : "Not provided"
                        }
                      />
                      <ReviewField
                        label="Languages"
                        value={
                          formData.languages.length > 0
                            ? formData.languages.join(", ")
                            : "Not provided"
                        }
                      />
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <Select
                          label="Status"
                          name="status"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as LabourProfileStatus,
                            })
                          }
                          options={[
                            { value: "RECEIVED", label: "Received" },
                            { value: "UNDER_REVIEW", label: "Under Review" },
                            { value: "APPROVED", label: "Approved" },
                            { value: "REJECTED", label: "Rejected" },
                            { value: "SHORTLISTED", label: "Shortlisted" },
                            { value: "DEPLOYED", label: "Deployed" },
                          ]}
                          className="flex-1"
                        />
                        <Select
                          label="Verification Status"
                          name="verificationStatus"
                          value={formData.verificationStatus}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              verificationStatus: e.target
                                .value as DocumentVerificationStatus,
                            })
                          }
                          options={[
                            { value: "PENDING", label: "Pending" },
                            {
                              value: "PARTIALLY_VERIFIED",
                              label: "Partially Verified",
                            },
                            { value: "VERIFIED", label: "Verified" },
                            { value: "REJECTED", label: "Rejected" },
                          ]}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                      Documents
                    </h2>
                    <div className="space-y-3">
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">
                          Profile Photo
                        </p>
                        {formData.profileImage ? (
                          <div className="mt-2 w-24 h-24 rounded-full overflow-hidden border border-gray-200">
                            <Image
                              src={URL.createObjectURL(formData.profileImage)}
                              alt="Profile preview"
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : isEditMode && formData.id ? (
                          <div className="mt-2 w-24 h-24 rounded-full overflow-hidden border border-gray-200">
                            <img
                              src={
                                labourProfiles.find((p) => p.id === formData.id)
                                  ?.profileImage || ""
                              }
                              alt="Current profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">
                            Not provided
                          </p>
                        )}
                      </div>
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">
                          Passport Copy
                        </p>
                        {formData.passportCopy ? (
                          <div className="mt-2 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <span className="text-sm text-gray-600">
                              {formData.passportCopy.name}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">
                            {isEditMode
                              ? "Existing document will remain unchanged"
                              : "Not provided"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-start sm:items-center gap-2">
                    <input
                      type="checkbox"
                      id="confirm"
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                      className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded mt-1 sm:mt-0"
                    />
                    <label htmlFor="confirm" className="text-sm text-gray-700">
                      I confirm all information is accurate and documents are
                      genuine
                    </label>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Modal>
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
