"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/shared/Card";

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

export default function LoginPage() {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const rawParams = useSearchParams();
  const searchParams = rawParams ?? new URLSearchParams();
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Email validation
    if (!formData.email) {
      newErrors.email = t.required;
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t.required;
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = t.passwordMinLength;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    // Use callbackUrl, not from
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    console.log("Login page callback URL:", callbackUrl);
    console.log(
      "All search params:",
      Object.fromEntries(searchParams.entries())
    );

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        if (result.error === "Account not verified") {
          // Redirect to verification page with email as query param
          router.push(
            `/auth/verify-account?email=${encodeURIComponent(formData.email)}`
          );
          return;
        }
        throw new Error(result.error);
      }

      // Redirect to result.url (provided by NextAuth)
      if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : t.loginFailed,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    router.push("/auth/register");
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
              <h1 className="text-2xl font-semibold mb-1">{t.welcomeBack}</h1>
              <p className="text-base text-gray-700 mb-2">
                {t.loginToContinue}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8 mt-6">
              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">{t.loginDetails}</h2>

                {/* Form-level error */}
                {errors.form && (
                  <div className="text-[#FF0404] text-sm text-center p-2 bg-red-50 rounded max-w-xl">
                    {errors.form}
                  </div>
                )}

                {/* Email field */}
                <Input
                  label={t.email}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder={t.emailPlaceholder}
                  id="email"
                />

                {/* Password field */}
                <Input
                  label={t.password}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  placeholder={t.passwordPlaceholder}
                  id="password"
                />

                <h2 className="text-lg font-semibold mb-2">{t.quickActions}</h2>
                <div className="space-y-4">
                  <p
                    className="text-sm text-gray-600 cursor-pointer hover:text-[#2C0053]"
                    onClick={() => router.push("/auth/forgot-password")}
                  >
                    {t.forgotPasswordPrompt}
                  </p>
                </div>
              </div>
            </form>
          </Card>
          <div className="col-span-12 mt-6 flex justify-center gap-12">
            <Button
              type="submit"
              onClick={() => document.querySelector("form")?.requestSubmit()}
              disabled={loading}
              className="px-8 py-2"
            >
              {loading ? (
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
                t.signIn
              )}
            </Button>
            <Button
              type="button"
              onClick={handleRegisterRedirect}
              disabled={loading}
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
