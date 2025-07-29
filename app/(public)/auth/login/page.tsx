"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
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

// ——— LoginForm ———
// All the form state & submit logic lives here,
// but it gets its callbackUrl as a prop.
interface LoginFormProps {
  callbackUrl: string;
}
function LoginForm({ callbackUrl }: LoginFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setErrors({});

    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      if (result.error === "Account not verified") {
        router.push(
          `/auth/verify-account?email=${encodeURIComponent(formData.email)}`
        );
        return;
      }
      setErrors({ form: result.error });
    } else if (result?.url) {
      router.push(result.url);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 mt-6">
      <div className="col-span-5 space-y-4">
        <h2 className="text-lg font-semibold mb-2">{t.loginDetails}</h2>

        {errors.form && (
          <div className="text-[#FF0404] text-sm text-center p-2 bg-red-50 rounded max-w-xl">
            {errors.form}
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

// ——— LoginFormWrapper ———
// Only this tiny component calls `useSearchParams()`
import { useSearchParams } from "next/navigation";
function LoginFormWrapper() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/dashboard";
  return <LoginForm callbackUrl={callbackUrl} />;
}

// ——— Page Component ———
export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();

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

            {/* wrap only the part that uses useSearchParams in Suspense */}
            <Suspense
              fallback={<div className="text-center py-8">Loading…</div>}
            >
              <LoginFormWrapper />
            </Suspense>
          </Card>
        </div>
      </div>
    </div>
  );
}
