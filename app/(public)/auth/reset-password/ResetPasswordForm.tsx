"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/toast-provider";
import { resetPassword } from "@/lib/auth/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/shared/Card";
import LanguageSelector from "@/components/ui/LanguageSelector";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const rawCallback = searchParams?.get("callbackUrl") || "/dashboard";
  const isSafePath = (p: string) =>
    typeof p === "string" && p.startsWith("/") && !p.startsWith("//");
  const safeCallback = isSafePath(rawCallback) ? rawCallback : "/dashboard";
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState<"session" | "token">("session");

  // password checks
  const hasLowercase = /[a-z]/.test(formData.newPassword);
  const hasUppercase = /[A-Z]/.test(formData.newPassword);
  const hasNumber = /[0-9]/.test(formData.newPassword);
  const hasMinLength = formData.newPassword.length >= 8;
  const passwordsMatch = formData.newPassword === formData.confirmPassword;

  // decide flow on mount
  useEffect(() => {
    if (token) {
      setResetMode("token");
      validateToken();
    } else if (status === "loading") {
      // wait for session
    } else if (status === "authenticated" && session?.user?.email) {
      setResetMode("session");
      setIsValidating(false);
    } else {
      router.push("/auth/login");
    }
  }, [token, status, session, router]);

  async function validateToken() {
    try {
      const res = await fetch("/api/auth/validate-reset-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.valid) {
        setIsValidToken(true);
        setUserEmail(data.email);
      } else {
        toast({ type: "error", message: data.error || t.invalidToken });
      }
    } catch {
      toast({ type: "error", message: t.validationFailed });
    } finally {
      setIsValidating(false);
    }
  }

  function validateForm() {
    const errs: Record<string, string> = {};
    if (!hasLowercase || !hasUppercase || !hasNumber || !hasMinLength)
      errs.newPassword = t.passwordRequirements;
    if (!passwordsMatch) errs.confirmPassword = t.passwordsDontMatch;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      if (resetMode === "session") {
        // first-time login flow
        const result = await resetPassword(formData.newPassword);
        if (result?.error) {
          toast({ type: "error", message: result.error });
        } else {
          toast({ type: "success", message: t.passwordResetSuccess });
          const signInResult = await signIn("credentials", {
            email: session!.user!.email!,
            password: formData.newPassword,
            redirect: false,
          });
          if (signInResult?.error) {
            toast({ type: "error", message: signInResult.error });
          } else {
            router.replace("/dashboard"); // Let middleware route by role
          }
        }
      } else {
        // token‐based forgot-password
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: formData.newPassword }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Reset failed");
        }
        toast({ type: "success", message: t.passwordResetSuccess });
        router.push("/auth/login");
      }
    } catch (err: any) {
      toast({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  }

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
                <h1 className="text-xl font-semibold mb-2">
                  {t.validatingToken}
                </h1>
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
                  {t.invalidTokenTitle}
                </h1>
                <p className="text-gray-600 mb-6">{t.invalidTokenMessage}</p>
                <Button
                  type="button"
                  onClick={() => router.push("/auth/forgot-password")}
                  className="w-full"
                >
                  {t.requestNewLink}
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
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">
                {t.resetPasswordTitle}
              </h1>
              <p className="text-base text-gray-700 mb-2">
                {t.resetPasswordSubtitle}
              </p>
              {resetMode === "token" && userEmail && (
                <p className="text-sm text-gray-600 mb-4">
                  {t.resettingFor} <strong>{userEmail}</strong>
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8 mt-6">
              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">
                  {t.passwordDetails}
                </h2>

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
