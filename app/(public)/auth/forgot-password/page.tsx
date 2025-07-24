"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/toast-provider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/shared/Card";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the language selector
const LanguageSelector = dynamic(
  () => import("@/components/ui/LanguageSelector"),
  { ssr: false }
);

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: t.invalidEmail });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setIsSubmitted(true);
      toast({
        type: "success",
        message: data.message || t.passwordResetEmailSent,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        type: "error",
        message: error instanceof Error ? error.message : t.errorOccurred,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      toast({
        type: "success",
        message: data.message || t.passwordResetEmailSent,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        type: "error",
        message: error instanceof Error ? error.message : t.errorOccurred,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex justify-center items-start min-h-screen pt-10 pb-6 px-6 text-[#2C0053] bg-gray-100">
        <div className="w-fit h-fit bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden flex flex-col relative">
          <LanguageSelector />
          <div className="flex-1 mx-16 rounded-lg py-8 flex flex-col justify-between">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold mb-2">
                  {t.checkYourEmail}
                </h1>
                <p className="text-base text-gray-700 mb-4">
                  {/* {t.passwordResetEmailSentTo(email)} */}
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  {t.passwordResetInstructions}
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
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
                      {t.sending}
                    </>
                  ) : (
                    t.resendEmail
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full border-none shadow-sm"
                >
                  {t.backToForgotPassword}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen pt-10 pb-6 px-6 text-[#2C0053] bg-gray-100">
      <div className="w-fit h-fit bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden flex flex-col relative">
        <LanguageSelector />
        <div className="flex-1 mx-16 rounded-lg py-8 flex flex-col justify-between">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#2C0053] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold mb-2">
                {t.forgotPasswordTitle}
              </h1>
              <p className="text-base text-gray-700">
                {t.forgotPasswordSubtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t.email}
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
                placeholder={t.emailPlaceholder}
                id="email"
                autoFocus
              />

              <div className="space-y-4">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
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
                      {t.sending}
                    </>
                  ) : (
                    t.sendResetLink
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-none shadow-sm"
                >
                  {t.backToLogin}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
