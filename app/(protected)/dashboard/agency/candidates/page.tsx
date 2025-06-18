// app/(protected)/dashboard/agency/candidates/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  MoreVertical,
  Download,
  Upload,
  Check,
  X,
  Clock,
  Trash2,
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

interface LabourProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  nationality: string;
  email?: string;
  phone?: string;
  passportNumber?: string;
  passportExpiry?: Date;
  passportVerified: boolean;
  visaType?: string;
  visaExpiry?: Date;
  visaVerified: boolean;
  medicalReport?: string;
  medicalVerified: boolean;
  policeClearance?: string;
  policeVerified: boolean;
  contractVerified: boolean;
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
}

interface FormData {
  name: string;
  age: number;
  gender: Gender;
  nationality: string;
  email: string;
  phone: string;
  passportNumber: string;
  passportExpiry: string;
  visaType: string;
  visaExpiry: string;
  medicalReport: File | null;
  policeClearance: File | null;
  contractCopy: File | null;
  countryCode: string;
  jobRole: string;
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

export default function Candidates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [labourProfiles, setLabourProfiles] = useState<LabourProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useLanguage();
  const [filters, setFilters] = useState({
    status: "",
    nationality: "",
    verificationStatus: "",
  });
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: 18,
    gender: "MALE",
    nationality: "",
    email: "",
    phone: "",
    passportNumber: "",
    passportExpiry: "",
    visaType: "",
    visaExpiry: "",
    medicalReport: null,
    policeClearance: null,
    contractCopy: null,
    countryCode: "+974",
    jobRole: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        "Visa Type": "Employment/Work/etc",
        "Visa Expiry": "2024-12-31",
        Status: "RECEIVED/UNDER_REVIEW/APPROVED/REJECTED",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LabourProfiles");

    // Auto-size columns
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

  // Filter profiles based on search and filters
  const filteredProfiles = labourProfiles.filter((profile) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (profile.name.toLowerCase().includes(searchLower) ||
        profile.nationality.toLowerCase().includes(searchLower)) &&
      (!filters.status || profile.status === filters.status) &&
      (!filters.nationality || profile.nationality === filters.nationality) &&
      (!filters.verificationStatus ||
        profile.verificationStatus === filters.verificationStatus)
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

  // Handle next step in modal
  const handleNext = () => {
    // Validate current step
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

  // Handle previous step in modal
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Validate current step
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

    if (step === 2) {
      if (!formData.medicalReport)
        newErrors.medicalReport = "Medical report is required";
      if (!formData.policeClearance)
        newErrors.policeClearance = "Police clearance is required";
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("age", formData.age.toString());
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("nationality", formData.nationality);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("passportNumber", formData.passportNumber);
      formDataToSend.append("passportExpiry", formData.passportExpiry);
      formDataToSend.append("visaType", formData.visaType);
      formDataToSend.append("visaExpiry", formData.visaExpiry);
      formDataToSend.append("jobRole", formData.jobRole);
      if (formData.medicalReport)
        formDataToSend.append("medicalReport", formData.medicalReport);
      if (formData.policeClearance)
        formDataToSend.append("policeClearance", formData.policeClearance);
      if (formData.contractCopy)
        formDataToSend.append("contractCopy", formData.contractCopy);

      const response = await fetch("/api/agencies/labour-profiles", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const newProfile = await response.json();
        setLabourProfiles((prev) => [newProfile, ...prev]);
        toast({
          type: "success",
          message: "Labour profile submitted successfully",
        });
        setIsModalOpen(false);
        resetForm();
      } else {
        throw new Error("Failed to submit profile");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
      toast({
        type: "error",
        message: "Failed to submit profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      age: 18,
      gender: "MALE",
      nationality: "",
      email: "",
      phone: "",
      passportNumber: "",
      passportExpiry: "",
      visaType: "",
      visaExpiry: "",
      medicalReport: null,
      policeClearance: null,
      contractCopy: null,
      countryCode: "+974",
      jobRole: "",
    });
    setCurrentStep(1);
    setErrors({});
  };

  // Handle file upload
  const handleFileChange = (field: keyof FormData, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderModalFooter = () => {
    return (
      <div className="flex justify-end gap-3">
        {currentStep > 1 && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        {currentStep < 3 && (
          <Button
            variant="default"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            Next
          </Button>
        )}
        {currentStep === 3 && (
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        )}
      </div>
    );
  };

  // Labour Profile Card Component
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
        <div className="p-4 flex justify-between items-start border-b border-gray-200">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {profile.name}
            </h3>
            <p className="text-sm text-gray-500">
              {profile.nationality} • {profile.age} years •{" "}
              {profile.gender.toLowerCase()}
            </p>
            {profile.requirement?.jobRoles?.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                For:{" "}
                {profile.requirement.jobRoles.map((r) => r.title).join(", ")}
              </p>
            )}
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span
              className={`text-xs px-2 py-1 rounded-full ${statusColors[profile.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}
            >
              {profile.status.replace("_", " ")}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${verificationColors[profile.verificationStatus as keyof typeof verificationColors]}`}
            >
              <div className="flex items-center gap-1">
                <VerificationStatusIcon status={profile.verificationStatus} />
                {profile.verificationStatus.replace("_", " ")}
              </div>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Passport</p>
              <div className="flex items-center gap-1">
                {profile.passportVerified ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <X className="w-3 h-3 text-red-500" />
                )}
                <span>{profile.passportNumber || "Not provided"}</span>
              </div>
            </div>

            <div>
              <p className="text-gray-500">Visa</p>
              <div className="flex items-center gap-1">
                {profile.visaVerified ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <X className="w-3 h-3 text-red-500" />
                )}
                <span>{profile.visaType || "Not provided"}</span>
              </div>
            </div>

            <div>
              <p className="text-gray-500">Medical</p>
              <div className="flex items-center gap-1">
                {profile.medicalVerified ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : profile.medicalReport ? (
                  <Clock className="w-3 h-3 text-yellow-500" />
                ) : (
                  <X className="w-3 h-3 text-red-500" />
                )}
                <span>
                  {profile.medicalReport ? "Submitted" : "Not provided"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-500">Police</p>
              <div className="flex items-center gap-1">
                {profile.policeVerified ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : profile.policeClearance ? (
                  <Clock className="w-3 h-3 text-yellow-500" />
                ) : (
                  <X className="w-3 h-3 text-red-500" />
                )}
                <span>
                  {profile.policeClearance ? "Submitted" : "Not provided"}
                </span>
              </div>
            </div>
          </div>

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

  // Add Card with Import/Export options
  const AddCard = () => (
    <div className="flex flex-col gap-4">
      <div
        onClick={() => setIsModalOpen(true)}
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filter controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full md:w-auto">
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
          </div>
        </div>

        {/* Profiles Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading labour profiles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AddCard />
            {filteredProfiles.map((profile) => (
              <LabourProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>

      {/* Add Profile Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Add Labour Profile"
        size="7xl"
        showFooter={true}
        footerContent={renderModalFooter()}
        className="w-full max-w-[90vw] h-[calc(100vh-40px)] flex flex-col"
      >
        <div className="flex flex-col h-full relative">
          {/* Progress bar with steps */}
          <div className="relative px-16 pt-10 pb-6">
            <div className="absolute inset-x-0 top-1/2 h-0.5 z-0">
              <div className="absolute -left-44 right-0 h-full flex w-full max-w-[1555px] mx-auto">
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
                    className={`w-12 h-12 mx-auto rounded-full text-lg font-bold mb-3 flex items-center justify-center ${
                      currentStep >= step
                        ? "bg-[#2C0053] text-white"
                        : "bg-gray-200 text-gray-600"
                    } ${currentStep > step ? "ring-2 ring-[#2C0053]" : ""}`}
                    aria-current={currentStep === step ? "step" : undefined}
                  >
                    {step}
                  </div>
                  <span
                    className={`text-sm font-medium ${
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
                    Enter the labour&apos;s personal details
                  </p>
                </div>

                <div className="grid grid-cols-12 gap-8 mt-6">
                  <div className="col-span-5 space-y-4">
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
                      min="18"
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
                        ...t.sectorOptions.map((role) => ({
                          value: role,
                          label: role,
                        })),
                      ]}
                      required
                      error={errors.jobRole}
                    />
                  </div>

                  <div className="col-span-2 flex justify-center items-center">
                    <div className="w-[2px] h-2/3 bg-[#2C0053]/30 rounded-full"></div>
                  </div>

                  <div className="col-span-5 space-y-4">
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
                    <div className="flex gap-2">
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
                        className="w-32"
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
                      label="Visa Type"
                      name="visaType"
                      value={formData.visaType}
                      onChange={(e) =>
                        setFormData({ ...formData, visaType: e.target.value })
                      }
                      placeholder="Enter visa type"
                    />

                    <Input
                      label="Visa Expiry"
                      name="visaExpiry"
                      type="date"
                      value={formData.visaExpiry}
                      onChange={(e) =>
                        setFormData({ ...formData, visaExpiry: e.target.value })
                      }
                    />
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
                    Upload required documents for verification
                  </p>
                </div>

                <div className="space-y-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Report
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange(
                            "medicalReport",
                            e.target.files?.[0] || null
                          )
                        }
                        className="hidden"
                        id="medicalReport"
                      />
                      <label
                        htmlFor="medicalReport"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        {formData.medicalReport
                          ? formData.medicalReport.name
                          : "Select file"}
                      </label>
                      {formData.medicalReport && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleFileChange("medicalReport", null)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {errors.medicalReport && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.medicalReport}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Police Clearance
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange(
                            "policeClearance",
                            e.target.files?.[0] || null
                          )
                        }
                        className="hidden"
                        id="policeClearance"
                      />
                      <label
                        htmlFor="policeClearance"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        {formData.policeClearance
                          ? formData.policeClearance.name
                          : "Select file"}
                      </label>
                      {formData.policeClearance && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleFileChange("policeClearance", null)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {errors.policeClearance && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.policeClearance}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Copy
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange(
                            "contractCopy",
                            e.target.files?.[0] || null
                          )
                        }
                        className="hidden"
                        id="contractCopy"
                      />
                      <label
                        htmlFor="contractCopy"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        {formData.contractCopy
                          ? formData.contractCopy.name
                          : "Select file"}
                      </label>
                      {formData.contractCopy && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFileChange("contractCopy", null)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="p-6">
                <div className="text-center mb-2">
                  <h1 className="text-2xl font-semibold mb-1">
                    Review & Submit
                  </h1>
                  <p className="text-base text-gray-700 mb-2">
                    Verify all information before submission
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
                        label="Visa Type"
                        value={formData.visaType || "Not provided"}
                      />
                      <ReviewField
                        label="Visa Expiry"
                        value={
                          formData.visaExpiry
                            ? format(
                                new Date(formData.visaExpiry),
                                "MMM d, yyyy"
                              )
                            : "Not provided"
                        }
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                      Documents
                    </h2>
                    <div className="space-y-3">
                      <ReviewField
                        label="Medical Report"
                        value={formData.medicalReport?.name || "Not provided"}
                      />
                      <ReviewField
                        label="Police Clearance"
                        value={formData.policeClearance?.name || "Not provided"}
                      />
                      <ReviewField
                        label="Contract Copy"
                        value={formData.contractCopy?.name || "Not provided"}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="confirm"
                      required
                      className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                    />
                    <label
                      htmlFor="confirm"
                      className="ml-2 text-sm text-gray-700"
                    >
                      I confirm all information is accurate
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
