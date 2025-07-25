/* eslint-disable @typescript-eslint/no-unused-expressions */
// app/(public)/auth/verify-account/page.tsx
"use client";

import { Suspense } from "react";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/toast-provider";

// top‐level page component: just renders a suspense boundary
export default function VerifyAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading…</p>
        </div>
      }
    >
      <VerifyAccountForm />
    </Suspense>
  );
}

// inner component: now safe to call useSearchParams(), useRouter(), etc.
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AccountStatus, UserRole } from "@prisma/client";

function VerifyAccountForm() {
  const router = useRouter();
  const rawParams = useSearchParams();
  const statusParam = rawParams?.get("status");
  const emailParam = rawParams?.get("email") || "";
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState(emailParam);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userStatus, setUserStatus] = useState<AccountStatus | null>(null);

  const [formData, setFormData] = useState<{
    crFile: File | null;
    licenseFile: File | null;
    insuranceFile: File | null;
    idProof: File | null;
    addressProof: File | null;
    otherDocuments: File[];
  }>({
    crFile: null,
    licenseFile: null,
    insuranceFile: null,
    idProof: null,
    addressProof: null,
    otherDocuments: [],
  });

  // fetch user on mount if we have an email
  useEffect(() => {
    if (!emailParam) return;
    fetchUserData(emailParam);
  }, [emailParam]);

  async function fetchUserData(email: string) {
    try {
      const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role);
        setUserStatus(data.status);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    field:
      | "crFile"
      | "licenseFile"
      | "insuranceFile"
      | "idProof"
      | "addressProof"
      | "otherDocuments"
  ) {
    if (!e.target.files) return;
    if (field === "otherDocuments") {
      setFormData((f) => ({
        ...f,
        otherDocuments: Array.from(e.target.files!),
      }));
    } else {
      setFormData((f) => ({ ...f, [field]: e.target.files![0] }));
    }
  }

  async function handleSubmit() {
    if (!email || !userRole) return;
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("email", email);
      fd.append("userRole", userRole);

      if (userRole === UserRole.RECRUITMENT_AGENCY) {
        formData.licenseFile && fd.append("licenseFile", formData.licenseFile);
        formData.insuranceFile &&
          fd.append("insuranceFile", formData.insuranceFile);
        formData.idProof && fd.append("idProof", formData.idProof);
        formData.addressProof &&
          fd.append("addressProof", formData.addressProof);
      } else if (userRole === UserRole.CLIENT_ADMIN) {
        formData.crFile && fd.append("crFile", formData.crFile);
        formData.licenseFile && fd.append("licenseFile", formData.licenseFile);
      }
      formData.otherDocuments.forEach((f) => fd.append("otherDocuments", f));

      const res = await fetch("/api/verify-account", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error((await res.json()).error || "Submit failed");

      toast({ type: "success", message: t.documentsSubmitted });
      router.push(`/auth/verify-account?status=submitted`);
    } catch (err: any) {
      toast({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  // —— views based on statusParam —— //

  if (statusParam === "submitted") {
    return (
      <CenterLayout>
        <Card className="p-6 text-center">
          <CheckmarkIcon />
          <h1 className="text-2xl font-semibold mb-2">
            {t.documentsSubmitted}
          </h1>
          <p className="mb-6">{t.documentsSubmittedMessage}</p>
          <Button onClick={() => router.push("/")}>{t.returnToHome}</Button>
        </Card>
      </CenterLayout>
    );
  }

  if (
    userRole === UserRole.RECRUITMENT_AGENCY &&
    userStatus === AccountStatus.NOT_VERIFIED
  ) {
    return (
      <CenterLayout>
        <Card className="p-6">
          <h1 className="text-xl font-semibold mb-2">
            {t.completeYourRegistration}
          </h1>
          <p className="mb-4">
            {t.uploadRequiredDocuments} <strong>{email}</strong>
          </p>
          <div className="grid gap-4">
            <Input
              label={t.businessLicense}
              type="file"
              onChange={(e) => handleFileChange(e, "licenseFile")}
              required
            />
            <Input
              label={t.insuranceCertificate}
              type="file"
              onChange={(e) => handleFileChange(e, "insuranceFile")}
              required
            />
            <Input
              label={t.idProof}
              type="file"
              onChange={(e) => handleFileChange(e, "idProof")}
              required
            />
            <Input
              label={t.addressProof}
              type="file"
              onChange={(e) => handleFileChange(e, "addressProof")}
              required
            />
            <Input
              label={t.otherDocuments}
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, "otherDocuments")}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.licenseFile ||
              !formData.insuranceFile ||
              !formData.idProof ||
              !formData.addressProof
            }
            className="mt-6 w-full"
          >
            {isSubmitting ? t.submitting : t.submitDocuments}
          </Button>
        </Card>
      </CenterLayout>
    );
  }

  // default “under review” state
  return (
    <CenterLayout>
      <Card className="p-6 text-center">
        <CheckmarkIcon />
        <h1 className="text-2xl font-semibold mb-2">
          {userStatus === AccountStatus.NOT_VERIFIED
            ? t.registrationSubmitted
            : t.verificationComplete}
        </h1>
        <p className="mb-4">
          {userStatus === AccountStatus.NOT_VERIFIED
            ? t.registrationUnderReview
            : t.accountVerified}
        </p>
        <Button onClick={() => router.push("/")}>{t.returnToHome}</Button>
      </Card>
    </CenterLayout>
  );
}

// ——— small helpers ——— //

function CenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-6 text-[#2C0053]">
      <div className="w-fit bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden relative">
        <LanguageSelect />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

import dynamic from "next/dynamic";
const LanguageSelect = dynamic(
  () => import("@/components/ui/LanguageSelector"),
  { ssr: false }
);

function CheckmarkIcon() {
  return (
    <svg
      className="mx-auto h-16 w-16 text-green-500 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4"
      />
    </svg>
  );
}
