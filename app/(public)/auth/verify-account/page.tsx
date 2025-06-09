"use client";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AccountStatus, UserRole } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

export default function VerifyAccount() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userStatus, setUserStatus] = useState<AccountStatus | null>(null);
  const { language, setLanguage, t } = useLanguage();

  // Form state for documents
  const [formData, setFormData] = useState({
    crFile: null as File | null,
    licenseFile: null as File | null,
    insuranceFile: null as File | null,
    idProof: null as File | null,
    addressProof: null as File | null,
    otherDocuments: [] as File[],
  });

  // Fetch user data based on email from URL
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      fetchUserData(emailParam);
    }
  }, [searchParams]);

  const fetchUserData = async (email: string) => {
    try {
      const response = await fetch(
        `/api/users?email=${encodeURIComponent(email)}`
      );
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role);
        setUserStatus(userData.status);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof formData
  ) => {
    if (e.target.files) {
      if (field === "otherDocuments") {
        setFormData((prev) => ({
          ...prev,
          otherDocuments: Array.from(e.target.files || []),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [field]: e.target.files?.[0] || null,
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!email) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("email", email);

      // Append files based on user role
      if (userRole === UserRole.RECRUITMENT_AGENCY) {
        if (formData.licenseFile)
          formDataToSend.append("licenseFile", formData.licenseFile);
        if (formData.insuranceFile)
          formDataToSend.append("insuranceFile", formData.insuranceFile);
        if (formData.idProof)
          formDataToSend.append("idProof", formData.idProof);
        if (formData.addressProof)
          formDataToSend.append("addressProof", formData.addressProof);
      } else if (userRole === UserRole.CLIENT_ADMIN) {
        if (formData.crFile) formDataToSend.append("crFile", formData.crFile);
        if (formData.licenseFile)
          formDataToSend.append("licenseFile", formData.licenseFile);
      }

      formData.otherDocuments.forEach((file, index) => {
        formDataToSend.append(`otherDocuments[${index}]`, file);
      });

      const response = await fetch("/api/verify-account", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        router.push("/auth/verify-account?status=submitted");
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If documents have been submitted, show success message
  if (userStatus === "SUBMITTED") {
    return (
      <div className="flex justify-center items-start min-h-screen pt-10 pb-6 px-6 text-[#2C0053] bg-gray-100">
        <div className="w-fit h-fit bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden flex flex-col relative">
          <div className="flex-1 mx-16 rounded-lg py-8 flex flex-col justify-between">
            <div className="absolute top-6 right-6">
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
            <Card className="p-6 text-center">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                {t.documentsSubmitted}
              </h1>
              <p className="text-gray-600 mb-6">
                {t.documentsSubmittedMessage}
              </p>
              <Button
                onClick={() => router.push("/")}
                className="w-full max-w-xs mx-auto"
              >
                {t.returnToHome}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show document upload form for users with PENDING_SUBMISSION status
  if (userStatus === "PENDING_SUBMISSION") {
    return (
      <div className="flex justify-center items-start min-h-screen pt-10 pb-6 px-6 text-[#2C0053] bg-gray-100">
        <div className="w-fit h-fit bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden flex flex-col relative">
          <div className="flex-1 mx-16 rounded-lg py-8 flex flex-col justify-between">
            <div className="absolute top-6 right-6">
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
            <Card className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-semibold mb-1">
                  {t.completeYourRegistration}
                </h1>
                <p className="text-gray-600">
                  {t.uploadRequiredDocuments}{" "}
                  <span className="font-medium">{email}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 mt-6">
                {/* Show different documents based on user role */}
                {userRole === UserRole.RECRUITMENT_AGENCY ? (
                  <>
                    <div className="space-y-4">
                      <Input
                        label={t.businessLicense}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, "licenseFile")}
                        required
                        id="licenseFile"
                      />
                      <Input
                        label={t.insuranceCertificate}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, "insuranceFile")}
                        required
                        id="insuranceFile"
                      />
                      <Input
                        label={t.idProof}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, "idProof")}
                        required
                        id="idProof"
                      />
                    </div>

                    <div className="space-y-4">
                      <Input
                        label={t.addressProof}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, "addressProof")}
                        required
                        id="addressProof"
                      />
                    </div>
                  </>
                ) : userRole === UserRole.CLIENT_ADMIN ? (
                  <div className="space-y-4">
                    <Input
                      label={t.companyRegistration}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "crFile")}
                      required
                      id="crFile"
                    />
                    <Input
                      label={t.businessLicense}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "licenseFile")}
                      required
                      id="licenseFile"
                    />
                  </div>
                ) : null}

                <div className="space-y-4">
                  <Input
                    label={t.otherDocuments}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "otherDocuments")}
                    id="otherDocuments"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    (userRole === UserRole.RECRUITMENT_AGENCY &&
                      (!formData.licenseFile ||
                        !formData.insuranceFile ||
                        !formData.idProof ||
                        !formData.addressProof)) ||
                    (userRole === UserRole.CLIENT_ADMIN &&
                      (!formData.crFile || !formData.licenseFile))
                  }
                  className="px-8 py-2 w-full max-w-xs"
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
                      {t.submitting}
                    </>
                  ) : (
                    t.submitDocuments
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Default view for users not in PENDING_SUBMISSION status
  return (
    <div className="flex justify-center items-start min-h-screen pt-10 pb-6 px-6 text-[#2C0053] bg-gray-100">
      <div className="w-fit h-fit bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden flex flex-col relative ">
        <div className="flex-1 mx-16 rounded-lg py-8 flex flex-col justify-between">
          <div className="absolute top-6 right-6">
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
          <Card className="p-6 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-[#2C0053]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              {userStatus === "PENDING_REVIEW"
                ? t.registrationSubmitted
                : t.verificationComplete}
            </h1>
            <p className="text-gray-600 mb-4">
              {userStatus === "PENDING_REVIEW"
                ? t.registrationUnderReview
                : t.accountVerified}
            </p>
            {userStatus === "PENDING_REVIEW" && (
              <p className="text-gray-500 text-sm mb-6">
                {t.reviewProcessTime}
              </p>
            )}
            <Button
              onClick={() => router.push("/")}
              className="w-full max-w-xs mx-auto"
            >
              {t.returnToHome}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
