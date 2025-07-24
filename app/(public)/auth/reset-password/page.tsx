// app/(public)/auth/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/toast-provider";
import { resetPassword } from "@/lib/auth/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/shared/Card";
import { signIn, useSession } from "next-auth/react";

export default function ResetPasswordPage() {
  const { language, setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resetMode, setResetMode] = useState<"session" | "token">("session");
  const router = useRouter();

  const rawParams = useSearchParams();
  const searchParams = rawParams ?? new URLSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const token = searchParams.get("token");

  const { toast } = useToast();
  const { data: session, status } = useSession();
  const sessionUserEmail = session?.user?.email;

  // Password validation checks
  const hasLowercase = /[a-z]/.test(formData.newPassword);
  const hasUppercase = /[A-Z]/.test(formData.newPassword);
  const hasNumber = /[0-9]/.test(formData.newPassword);
  const hasMinLength = formData.newPassword.length >= 8;
  const passwordsMatch = formData.newPassword === formData.confirmPassword;

  // Determine reset mode based on session and token
  useEffect(() => {
    const determineMode = async () => {
      // If there's a token in the URL, it's a forgot password flow
      if (token) {
        setResetMode("token");
        await validateToken();
      } else if (status === "loading") {
        // Still loading session
        return;
      } else if (status === "authenticated" && session?.user) {
        // User is authenticated, it's a first-time login flow
        setResetMode("session");
        setIsValidating(false);
      } else {
        // No token and no session, redirect to login
        router.push("/auth/login");
      }
    };

    determineMode();
  }, [token, status, session, router]);

  const validateToken = async () => {
    if (!token) {
      setIsValidating(false);
      setIsValidToken(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/validate-reset-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.valid) {
        setIsValidToken(true);
        setUserEmail(data.email);
      } else {
        setIsValidToken(false);
        toast({
          type: "error",
          message: data.error || "Invalid or expired reset token",
        });
      }
    } catch (error) {
      console.error("Token validation error:", error);
      setIsValidToken(false);
      toast({
        type: "error",
        message: "Failed to validate reset token",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!hasLowercase || !hasUppercase || !hasNumber || !hasMinLength) {
      newErrors.newPassword = t.passwordRequirements;
    }

    if (!passwordsMatch) {
      newErrors.confirmPassword = t.passwordsDontMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (resetMode === "session") {
        // First-time login flow (existing functionality)
        const result = await resetPassword(formData.newPassword);
        if (result?.error) {
          toast({
            type: "error",
            message: result.error,
          });
        } else {
          toast({
            type: "success",
            message: t.passwordResetSuccess,
          });

          // Re-authenticate with new password
          const signInResult = await signIn("credentials", {
            email: sessionUserEmail,
            password: formData.newPassword,
            redirect: false,
            callbackUrl,
          });

          if (signInResult?.error) {
            toast({ type: "error", message: t.loginFailed });
            router.push("/auth/login");
          } else if (signInResult?.url) {
            router.push(signInResult.url);
          } else {
            router.push(callbackUrl);
          }
        }
      } else {
        // Forgot password flow (token-based)
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            newPassword: formData.newPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to reset password");
        }

        toast({
          type: "success",
          message: t.passwordResetSuccess,
        });

        // Redirect to login page
        router.push("/auth/login");
      }
    } catch (error) {
      console.error(error);
      toast({
        type: "error",
        message: error instanceof Error ? error.message : t.errorOccurred,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while determining mode
  if (isValidating) {
    return (
      <div className="flex justify-center items-start min-h-screen pt-10 pb-6 px-6 text-[#2C0053] bg-gray-100">
        <div className="w-fit h-fit bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden flex flex-col relative">
          <div className="flex-1 mx-16 rounded-lg py-8 flex flex-col justify-center">
            <Card className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#2C0053] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="animate-spin w-8 h-8 text-white"
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
                </div>
                <h1 className="text-xl font-semibold mb-2">Validating...</h1>
                <p className="text-gray-600">
                  Please wait while we verify your request.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for invalid token
  if (resetMode === "token" && !isValidToken) {
    return (
      <div className="flex justify-center items-start min-h-screen pt-10 pb-6 px-6 text-[#2C0053] bg-gray-100">
        <div className="w-fit h-fit bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden flex flex-col relative">
          <div className="flex-1 mx-16 rounded-lg py-8 flex flex-col justify-center">
            <Card className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold mb-2">
                  Invalid Reset Link
                </h1>
                <p className="text-gray-600 mb-6">
                  This password reset link is invalid or has expired. Please
                  request a new one.
                </p>
                <Button
                  type="button"
                  onClick={() => router.push("/auth/forgot-password")}
                  className="w-full"
                >
                  Request New Reset Link
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
                {t.resetPasswordTitle}
              </h1>
              <p className="text-base text-gray-700 mb-2">
                {t.resetPasswordSubtitle}
              </p>
              {resetMode === "token" && userEmail && (
                <p className="text-sm text-gray-600 mb-4">
                  Resetting password for: <strong>{userEmail}</strong>
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8 mt-6">
              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">
                  {t.passwordDetails}
                </h2>

                {/* New Password */}
                <Input
                  label={t.newPassword}
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                  required
                  placeholder={t.newPasswordPlaceholder}
                  id="newPassword"
                />

                {/* Password Requirements */}
                <div className="text-sm text-gray-600 space-y-1 mt-2 pl-2">
                  <p
                    className={`flex items-center ${
                      hasMinLength ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {hasMinLength ? "✓" : "•"} {t.passwordMinLength}
                  </p>
                  <p
                    className={`flex items-center ${
                      hasLowercase ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {hasLowercase ? "✓" : "•"} {t.passwordLowercase}
                  </p>
                  <p
                    className={`flex items-center ${
                      hasUppercase ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {hasUppercase ? "✓" : "•"} {t.passwordUppercase}
                  </p>
                  <p
                    className={`flex items-center ${
                      hasNumber ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {hasNumber ? "✓" : "•"} {t.passwordNumber}
                  </p>
                </div>

                {/* Confirm Password */}
                <Input
                  label={t.confirmPassword}
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                  placeholder={t.confirmPasswordPlaceholder}
                  id="confirmPassword"
                />
              </div>
            </form>
          </Card>
          <div className="col-span-12 mt-6 flex justify-center gap-12">
            <Button
              type="submit"
              onClick={() => document.querySelector("form")?.requestSubmit()}
              disabled={
                isLoading ||
                !hasLowercase ||
                !hasUppercase ||
                !hasNumber ||
                !hasMinLength ||
                !passwordsMatch
              }
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
                t.resetPassword
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
          </div>
        </div>
      </div>
    </div>
  );
}
