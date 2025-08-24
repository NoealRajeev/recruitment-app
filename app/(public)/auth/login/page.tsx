"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/shared/Card";
import { Eye, EyeOff } from "lucide-react";

// dynamically load language selector (client-only)
const LanguageSelector = dynamic(
  () => import("@/components/ui/LanguageSelector"),
  { ssr: false }
);

interface LoginFormProps {
  callbackUrl: string;
  onSubmit: () => void;
  loading: boolean;
  formError?: string;
}

function LoginForm({
  callbackUrl,
  onSubmit,
  loading,
  formError,
}: LoginFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [isTouched, setIsTouched] = useState({
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return t.required;
    if (!/^\S+@\S+\.\S+$/.test(email)) return t.invalidEmail;
    return undefined;
  };

  const validatePassword = (password: string) => {
    if (!password) return t.required;
    if (password.length < 8) return t.passwordMinLength;
    return undefined;
  };

  const validate = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    return !emailError && !passwordError;
  };

  const handleBlur = (field: "email" | "password") => {
    setIsTouched((prev) => ({ ...prev, [field]: true }));

    // Validate only the blurred field
    if (field === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(formData.email),
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(formData.password),
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));

    // Only validate if the field has been touched
    if (isTouched[name as keyof typeof isTouched]) {
      setErrors((e) => ({
        ...e,
        [name]:
          name === "email" ? validateEmail(value) : validatePassword(value),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTouched({ email: true, password: true }); // Mark all fields as touched
    if (!validate()) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 mt-6">
      <div className="col-span-5 space-y-4">
        <h2 className="text-lg font-semibold mb-2">{t.loginDetails}</h2>

        {(errors.form || formError) && (
          <div className="text-[#FF0404] text-sm text-center p-2 bg-red-50 rounded max-w-xl">
            {errors.form || formError}
          </div>
        )}

        <Input
          label={t.email}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => handleBlur("email")}
          error={errors.email}
          required
          placeholder={t.emailPlaceholder}
          id="email"
          disabled={loading}
        />

        <div className="relative">
          <Input
            label={t.password}
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            onBlur={() => handleBlur("password")}
            error={errors.password}
            required
            placeholder={t.passwordPlaceholder}
            id="password"
            disabled={loading}
            className="pr-10"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-11 -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-2">{t.quickActions}</h2>
        <div className="space-y-4">
          <p
            className="text-sm text-gray-600 cursor-pointer hover:text-[#2C0053]"
            onClick={() => !loading && router.push("/auth/forgot-password")}
          >
            {t.forgotPasswordPrompt}
          </p>
        </div>
      </div>

      {/* Invisible submit so Enter works without changing layout */}
      <button
        type="submit"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />
    </form>
  );
}

function LoginFormWrapper({
  onErrorOccurred,
}: {
  onErrorOccurred?: () => void;
}) {
  const searchParams = useSearchParams();
  const raw = searchParams?.get("callbackUrl") ?? "/dashboard";
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [formError, setFormError] = useState("");

  let callbackUrl = "/dashboard";
  try {
    const url = new URL(raw, window.location.origin);
    const isSameOrigin = url.origin === window.location.origin;
    const isSafePath = url.pathname.startsWith("/");
    // allow same-origin absolute or any relative path; otherwise fallback
    callbackUrl =
      isSameOrigin || isSafePath
        ? url.pathname + url.search + url.hash
        : "/dashboard";
  } catch {
    callbackUrl = "/dashboard";
  }

  const handleSubmit = async () => {
    setLoading(true);
    setFormError("");

    const form = document.querySelector("form");
    if (!form) return;

    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl,
      });

      if (result?.error) {
        if (result.error === "Account not verified") {
          router.push(
            `/auth/verify-account?email=${encodeURIComponent(email)}`
          );
          return;
        }
        setFormError(result.error);
        // Call the callback when an error occurs
        if (onErrorOccurred) onErrorOccurred();
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      setFormError("An unexpected error occurred. Please try again.");
      // Call the callback when an error occurs
      if (onErrorOccurred) onErrorOccurred();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginForm
        callbackUrl={callbackUrl}
        onSubmit={handleSubmit}
        loading={loading}
        formError={formError}
      />
    </>
  );
}

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterRedirect = () => {
    router.push("/auth/register");
  };

  // Reset isSubmitting when an error occurs
  const handleErrorOccurred = () => {
    setIsSubmitting(false);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-6 text-[#2C0053]">
      <div className="relative bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden w-full max-w-md">
        <LanguageSelector />

        <div className="p-6">
          <Card className="p-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-semibold">{t.welcomeBack}</h1>
              <p className="text-gray-700">{t.loginToContinue}</p>
            </div>

            <Suspense
              fallback={<div className="text-center py-8">Loading…</div>}
            >
              <LoginFormWrapper onErrorOccurred={handleErrorOccurred} />
            </Suspense>
          </Card>

          {/* Buttons remain OUTSIDE the form to preserve your original layout */}
          <div className="mt-6 flex justify-center gap-4">
            <Button
              type="button"
              onClick={() => {
                setIsSubmitting(true);
                document.querySelector("form")?.requestSubmit();
              }}
              disabled={isSubmitting}
              className="px-8 py-2"
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
                  {t.signIn}
                </>
              ) : (
                t.signIn
              )}
            </Button>

            <Button
              type="button"
              onClick={handleRegisterRedirect}
              disabled={isSubmitting}
              variant="outline"
              className="px-8 py-2 border-none shadow-sm"
            >
              {t.register}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
