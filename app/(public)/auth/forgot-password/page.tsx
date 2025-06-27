// app/(public)/auth/forgot-password/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/toast-provider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/shared/Card";

export default function ForgotPasswordPage() {
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { toast } = useToast();

  const checkEmailAvailability = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/auth/check-identifier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "email", value: email }),
        });

        if (!response.ok) {
          throw new Error("Failed to check email availability");
        }

        const data = await response.json();
        return data.available;
      } catch (error) {
        console.error("Email check failed:", error);
        return false;
      }
    },
    []
  );

  const handleSendOtp = async () => {
    setIsLoading(true);
    setErrors({});

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: t.invalidEmail });
      setIsLoading(false);
      return;
    }

    try {
      const isEmailAvailable = await checkEmailAvailability(email);

      if (!isEmailAvailable) {
        setErrors({ email: t.emailNotRegistered });
        setIsLoading(false);
        return;
      }

      // Send OTP
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email", value: email }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Move to OTP verification step
      setStep("otp");
      toast({
        type: "success",
        message: t.otpSentSuccessfully,
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

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setErrors({});

    if (!otp || otp.length !== 6) {
      setErrors({ otp: t.invalidOtp });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email", value: email, otp }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Navigate to reset password page with email as query param
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
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

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email", value: email }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        type: "success",
        message: t.otpResentSuccessfully,
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

  return (
    <div className="flex justify-center items-start min-h-screen pt-10 pb-6 px-6 text-[#2C0053] bg-gray-100">
      <div className="w-fit h-fit bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden flex flex-col relative">
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
        <div className="flex-1 mx-16 rounded-lg py-8 flex flex-col justify-between">
          <Card className="p-6">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">
                {step === "email" ? t.forgotPasswordTitle : t.verifyOtpTitle}
              </h1>
              <p className="text-base text-gray-700 mb-2">
                {step === "email"
                  ? t.forgotPasswordSubtitle
                  : t.verifyOtpSubtitle(email)}
              </p>
            </div>

            {step === "email" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOtp();
                }}
                className="grid gap-8 mt-6"
              >
                <div className="col-span-5 space-y-4">
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
                </div>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyOtp();
                }}
                className="grid gap-8 mt-6"
              >
                <div className="col-span-5 space-y-4">
                  <Input
                    label={t.otp}
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    error={errors.otp}
                    required
                    placeholder={t.otpPlaceholder}
                    id="otp"
                    autoFocus
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                  />
                  <div className="text-sm text-gray-600 mt-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-[#2C0053] hover:underline disabled:opacity-50"
                    >
                      {t.resendOtp}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </Card>
          <div className="col-span-12 mt-6 flex justify-center gap-12">
            {step === "email" ? (
              <>
                <Button
                  type="submit"
                  onClick={() =>
                    document.querySelector("form")?.requestSubmit()
                  }
                  disabled={isLoading || !email}
                  className="px-8 py-2"
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
                      {t.processing}
                    </>
                  ) : (
                    t.sendOtp
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  disabled={isLoading}
                  variant="outline"
                  className="px-8 py-2 border-none shadow-sm"
                >
                  {t.backToLogin}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="submit"
                  onClick={() =>
                    document.querySelector("form")?.requestSubmit()
                  }
                  disabled={isLoading || !otp || otp.length !== 6}
                  className="px-8 py-2"
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
                      {t.processing}
                    </>
                  ) : (
                    t.verifyOtp
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep("email")}
                  disabled={isLoading}
                  variant="outline"
                  className="px-8 py-2 border-none shadow-sm"
                >
                  {t.back}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
