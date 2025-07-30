"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/shared/Card";

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

  const validate = () => {
    const errs: typeof errors = {};
    if (!formData.email) errs.email = t.required;
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errs.email = t.invalidEmail;
    if (!formData.password) errs.password = t.required;
    else if (formData.password.length < 8) errs.password = t.passwordMinLength;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((e) => ({ ...e, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          error={errors.email}
          required
          placeholder={t.emailPlaceholder}
          id="email"
        />

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
  );
}

function LoginFormWrapper() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/dashboard";
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [formError, setFormError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setFormError("");

    const form = document.querySelector("form");
    if (!form) return;

    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      if (result.error === "Account not verified") {
        router.push(`/auth/verify-account?email=${encodeURIComponent(email)}`);
        return;
      }
      setFormError(result.error);
    } else if (result?.url) {
      router.push(result.url);
    }

    setLoading(false);
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

  const handleRegisterRedirect = () => {
    router.push("/auth/register");
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
              <LoginFormWrapper />
            </Suspense>
          </Card>

          <div className="mt-6 flex justify-center gap-4">
            <Button
              type="submit"
              onClick={() => document.querySelector("form")?.requestSubmit()}
              disabled={false}
              className="px-8 py-2"
            >
              {t.signIn}
            </Button>
            <Button
              type="button"
              onClick={handleRegisterRedirect}
              disabled={false}
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
