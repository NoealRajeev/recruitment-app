// app/(public)/auth/reset-password/ResetPasswordForm.tsx
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

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
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
            callbackUrl,
          });
          if (signInResult?.url) router.push(signInResult.url);
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
    return <LoadingCard message={t.validatingToken} />;
  }
  if (resetMode === "token" && !isValidToken) {
    return (
      <Card className="p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">{t.invalidTokenTitle}</h1>
        <p className="mb-4">{t.invalidTokenMessage}</p>
        <Button onClick={() => router.push("/auth/forgot-password")}>
          {t.requestNewLink}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-semibold mb-2">{t.resetPasswordTitle}</h1>
      <p className="mb-4">{t.resetPasswordSubtitle}</p>
      {resetMode === "token" && userEmail && (
        <p className="text-sm text-gray-600 mb-4">
          {t.resettingFor} <strong>{userEmail}</strong>
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t.newPassword}
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          required
        />
        <div className="text-sm space-y-1 pl-2">
          <p className={hasMinLength ? "text-green-600" : ""}>
            {t.passwordMinLength}
          </p>
          <p className={hasLowercase ? "text-green-600" : ""}>
            {t.passwordLowercase}
          </p>
          <p className={hasUppercase ? "text-green-600" : ""}>
            {t.passwordUppercase}
          </p>
          <p className={hasNumber ? "text-green-600" : ""}>
            {t.passwordNumber}
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
        />
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading || !passwordsMatch}>
            {isLoading ? t.processing : t.resetPassword}
          </Button>
          <Button variant="outline" onClick={() => router.push("/auth/login")}>
            {t.backToLogin}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// —— small helper for the “validating…” state —— //
function LoadingCard({ message }: { message: string }) {
  return (
    <Card className="p-6 text-center">
      <p className="mb-2">{message}</p>
      <div className="animate-spin mx-auto w-6 h-6 border-4 border-t-transparent rounded-full"></div>
    </Card>
  );
}
