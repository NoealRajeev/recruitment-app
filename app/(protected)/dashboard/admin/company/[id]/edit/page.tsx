"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, Trash2, Mail } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/context/toast-provider";
import { useLanguage } from "@/context/LanguageContext";
import {
  getSectorEnumMapping,
  getCompanySizeEnumMapping,
} from "@/lib/utils/enum-mappings";

type ClientPayload = {
  id: string;
  companyName: string;
  registrationNo: string | null;
  companySector: string;
  companySize: string;
  website: string | null;
  address: string;
  city: string;
  country: string;
  postalCode: string | null;
  designation: string;
  user: {
    name: string;
    email: string;
    phone: string | null; // stored like "+974 50000000"
    altContact?: string | null; // stored like "+974 50000001"
    profilePicture?: string | null;
  };
};

type Errors = Partial<
  Record<
    | "companyName"
    | "registrationNo"
    | "companySector"
    | "companySize"
    | "address"
    | "city"
    | "country",
    string
  >
>;

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const [data, setData] = useState<ClientPayload | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Country codes (same list you used on the agency side)
  const COUNTRY_CODES = useMemo(
    () => [
      { code: "+974", name: "Qatar" },
      { code: "+971", name: "UAE" },
      { code: "+966", name: "Saudi Arabia" },
      { code: "+965", name: "Kuwait" },
      { code: "+973", name: "Bahrain" },
      { code: "+968", name: "Oman" },
      { code: "+20", name: "Egypt" },
      { code: "+91", name: "India" },
      { code: "+92", name: "Pakistan" },
      { code: "+94", name: "Sri Lanka" },
      { code: "+880", name: "Bangladesh" },
      { code: "+95", name: "Myanmar" },
      { code: "+977", name: "Nepal" },
    ],
    []
  );

  // enums / options
  const sectorMapping = useMemo(
    () => getSectorEnumMapping(language),
    [language]
  );
  const companySizeMapping = useMemo(
    () => getCompanySizeEnumMapping(language),
    [language]
  );
  const sectorOptions = useMemo(
    () =>
      (t.sectorOptions ?? []).map((opt: string) => ({
        value: sectorMapping[opt] || opt.toLowerCase().replace(/\s+/g, "-"),
        label: opt,
      })),
    [t.sectorOptions, sectorMapping]
  );
  const companySizeOptions = useMemo(
    () =>
      (t.companySizeOptions ?? []).map((opt: string) => ({
        value:
          companySizeMapping[opt] || opt.toLowerCase().replace(/\s+/g, "-"),
        label: opt,
      })),
    [t.companySizeOptions, companySizeMapping]
  );
  const countryOptions = useMemo(
    () =>
      (t.nationalityOptions ?? []).map((nat: string) => ({
        value: nat,
        label: nat,
      })),
    [t.nationalityOptions]
  );

  // ---------- helpers to split/format phones ----------
  const splitPhone = (raw?: string | null) => {
    const phone = (raw ?? "").trim();
    if (!phone) return { code: "+974", number: "" };
    const withPlus = phone.startsWith("+") ? phone : `+${phone}`;
    const m = /^\+(\d{1,4})\s*(.*)$/.exec(withPlus);
    if (m) {
      return { code: `+${m[1]}`, number: (m[2] ?? "").replace(/\s+/g, "") };
    }
    return { code: "+974", number: withPlus.replace(/[^\d]/g, "") };
  };
  const formatDisplayPhone = (raw?: string | null) => {
    const { code, number } = splitPhone(raw);
    return number ? `${code} ${number}` : code;
  };

  // Editable alt contact (code + digits)
  const [altCountryCode, setAltCountryCode] = useState<string>("+974");
  const [altLocal, setAltLocal] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        if (!params?.id) throw new Error("Invalid company ID");
        const res = await fetch(`/api/clients/${params.id}`);
        if (!res.ok) throw new Error("Failed to load");
        const json = (await res.json()) as ClientPayload;

        // Seed alt-contact UI parts from stored value (if any)
        const alt = splitPhone(json.user.altContact);
        setAltCountryCode(alt.code);
        setAltLocal(alt.number);

        setData({
          ...json,
          user: {
            ...json.user,
            profilePicture: json.user.profilePicture ?? null,
            altContact: json.user.altContact ?? null,
          },
        });
      } catch (e) {
        console.error(e);
        toast({ type: "error", message: "Failed to load company" });
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  // ---------- validation ----------
  const validate = (payload: ClientPayload): Errors => {
    const e: Errors = {};
    const req = (v?: string | null) => (v ?? "").toString().trim().length > 0;

    if (!req(payload.companyName)) e.companyName = "Company name is required.";
    if (!req(payload.registrationNo))
      e.registrationNo = "Registration number is required.";
    if (!req(payload.companySector))
      e.companySector = "Company sector is required.";
    if (!req(payload.companySize)) e.companySize = "Company size is required.";
    if (!req(payload.address)) e.address = "Address is required.";
    if (!req(payload.city)) e.city = "City is required.";
    if (!req(payload.country)) e.country = "Country is required.";

    return e;
  };

  const setField = <K extends keyof ClientPayload>(
    key: K,
    value: ClientPayload[K]
  ) => {
    if (!data) return;
    const next = { ...data, [key]: value };
    setData(next);

    // per-field validation update
    const fieldErrors = validate(next);
    setErrors((prev) => ({
      ...prev,
      [key as keyof Errors]: fieldErrors[key as keyof Errors],
    }));
  };

  // ---------- avatar ----------
  const uploadAvatar = async (file: File) => {
    if (!params?.id) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/clients/${params.id}/avatar`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed");

      setData((d) =>
        d ? { ...d, user: { ...d.user, profilePicture: json.url } } : d
      );
      toast({ type: "success", message: "Profile picture updated" });
    } catch (err: any) {
      console.error(err);
      toast({ type: "error", message: err?.message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async () => {
    if (!params?.id) return;
    setDeletingAvatar(true);
    try {
      const res = await fetch(`/api/clients/${params.id}/avatar`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Delete failed");

      setData((d) =>
        d ? { ...d, user: { ...d.user, profilePicture: null } } : d
      );
      toast({ type: "success", message: "Profile picture removed" });
    } catch (e: any) {
      toast({ type: "error", message: e?.message || "Delete failed" });
    } finally {
      setDeletingAvatar(false);
    }
  };

  // ---------- submit ----------
  const submit = async () => {
    if (!data || !params?.id) return;

    const validation = validate(data);
    setErrors(validation);
    if (Object.keys(validation).length) {
      const firstKey = Object.keys(validation)[0] as keyof Errors | undefined;
      if (firstKey) {
        const el = document.querySelector(
          `[aria-describedby="err-${String(firstKey)}"]`
        ) as HTMLElement | null;
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      toast({ type: "error", message: "Please fix the highlighted fields." });
      return;
    }

    // Build altContact value to match stored format: "+974 50000001"
    const altContact =
      altLocal.trim().length > 0
        ? `${altCountryCode} ${altLocal.trim()}`
        : null;

    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: data.companyName,
          registrationNo: data.registrationNo,
          companySector: data.companySector,
          companySize: data.companySize,
          website: data.website,
          address: data.address,
          city: data.city,
          country: data.country,
          postalCode: data.postalCode,
          designation: data.designation,
          user: {
            // do NOT send email/phone (account-level)
            profilePicture: data.user.profilePicture,
            altContact, // <- new
          },
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast({ type: "success", message: "Company updated" });
      router.push("/dashboard/admin/company");
    } catch (e) {
      console.error(e);
      toast({ type: "error", message: "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  // ---------- reset password ----------
  const sendResetPassword = async () => {
    const email = data?.user.email;
    if (!email) {
      toast({ type: "error", message: "No email on file." });
      return;
    }
    setSendingReset(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to send reset email");
      toast({
        type: "success",
        message:
          json.message ||
          "If an account exists, a password reset link has been sent.",
      });
    } catch (e: any) {
      toast({ type: "error", message: e?.message || "Failed to send email" });
    } finally {
      setSendingReset(false);
    }
  };

  // ---------- loading ----------
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-44 rounded-2xl bg-white shadow border" />
            <div className="h-80 rounded-2xl bg-white shadow border" />
          </div>
        </div>
      </div>
    );
  }
  if (!data) return <div className="p-6">Not found</div>;

  const initials = (data.companyName || "?").charAt(0).toUpperCase();
  const anyBusy = saving || uploading || deletingAvatar || sendingReset;

  const mainPhone = splitPhone(data.user.phone);

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Card (avatar + quick actions) */}
        <section className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="h-20 w-full bg-gradient-to-r from-[#3D1673]/90 via-[#6E36C6]/70 to-[#3D1673]/90" />
          <div className="p-4 sm:p-6 pt-0">
            <div className="flex items-start gap-4 -mt-12">
              {/* Avatar */}
              <div className="relative">
                <div className="relative h-24 w-24 rounded-full overflow-hidden ring-4 ring-white shadow-md bg-gray-100">
                  {data.user.profilePicture ? (
                    <Image
                      src={data.user.profilePicture}
                      alt="Company logo"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-purple-50">
                      <span className="text-2xl font-semibold text-[#3D1673]">
                        {initials}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 inline-flex items-center justify-center rounded-full bg-[#3D1673] p-2 shadow text-white hover:bg-[#2B0E54] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D1673]/50 disabled:opacity-60"
                  title="Change logo"
                  disabled={uploading || anyBusy}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadAvatar(f);
                    e.currentTarget.value = "";
                  }}
                />
              </div>

              {/* Title + meta + actions */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-white truncate">
                      {data.companyName}
                    </h2>
                    <p className="text-sm text-gray-800 truncate">
                      {data.user.email}
                    </p>
                    {data.user.phone && (
                      <p className="text-sm text-gray-800 truncate">
                        {formatDisplayPhone(data.user.phone)}
                      </p>
                    )}
                    {data.user.altContact && (
                      <p className="text-xs text-gray-700 truncate">
                        Alt: {formatDisplayPhone(data.user.altContact)}
                      </p>
                    )}
                  </div>

                  <div className="sm:ml-auto flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={sendResetPassword}
                      className="border-[#3D1673]/30"
                      disabled={sendingReset || anyBusy}
                    >
                      {sendingReset ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send password reset
                        </>
                      )}
                    </Button>

                    {data.user.profilePicture && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={deleteAvatar}
                        disabled={deletingAvatar || anyBusy}
                      >
                        {deletingAvatar ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove picture
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-3 rounded-lg border bg-purple-50/40 border-[#3D1673]/10 text-[12px] text-[#3D1673] px-3 py-2">
                  Email and phone are managed at the account level and cannot be
                  edited here.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company form */}
        <section className="rounded-2xl border bg-white shadow-sm p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Input
                label="Company name"
                value={data.companyName}
                onChange={(e) => setField("companyName", e.target.value)}
                aria-invalid={!!errors.companyName}
                aria-describedby={
                  errors.companyName ? "err-companyName" : undefined
                }
                disabled={anyBusy}
                className={errors.companyName ? "border-red-500" : undefined}
              />
              {errors.companyName && (
                <p id="err-companyName" className="mt-1 text-xs text-red-600">
                  {errors.companyName}
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Registration No"
                  value={data.registrationNo ?? ""}
                  onChange={(e) => setField("registrationNo", e.target.value)}
                  aria-invalid={!!errors.registrationNo}
                  aria-describedby={
                    errors.registrationNo ? "err-registrationNo" : undefined
                  }
                  disabled={anyBusy}
                  className={
                    errors.registrationNo ? "border-red-500" : undefined
                  }
                />
                {errors.registrationNo && (
                  <p
                    id="err-registrationNo"
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.registrationNo}
                  </p>
                )}
              </div>

              <div>
                <Select
                  label="Sector"
                  value={data.companySector}
                  onChange={(e: any) =>
                    setField("companySector", e?.target?.value ?? e)
                  }
                  options={sectorOptions}
                  className="!bg-white"
                />
                {errors.companySector && (
                  <p
                    id="err-companySector"
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.companySector}
                  </p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Company size"
                  value={data.companySize}
                  onChange={(e: any) =>
                    setField("companySize", e?.target?.value ?? e)
                  }
                  options={companySizeOptions}
                  className="!bg-white"
                />
                {errors.companySize && (
                  <p id="err-companySize" className="mt-1 text-xs text-red-600">
                    {errors.companySize}
                  </p>
                )}
              </div>

              <Input
                label="Website"
                value={data.website ?? ""}
                onChange={(e) => setField("website", e.target.value)}
                disabled={anyBusy}
              />
            </div>

            <div>
              <Input
                label="Address"
                value={data.address}
                onChange={(e) => setField("address", e.target.value)}
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? "err-address" : undefined}
                disabled={anyBusy}
                className={errors.address ? "border-red-500" : undefined}
              />
              {errors.address && (
                <p id="err-address" className="mt-1 text-xs text-red-600">
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <Input
                  label="City"
                  value={data.city}
                  onChange={(e) => setField("city", e.target.value)}
                  aria-invalid={!!errors.city}
                  aria-describedby={errors.city ? "err-city" : undefined}
                  disabled={anyBusy}
                  className={errors.city ? "border-red-500" : undefined}
                />
                {errors.city && (
                  <p id="err-city" className="mt-1 text-xs text-red-600">
                    {errors.city}
                  </p>
                )}
              </div>

              <div className="sm:col-span-1">
                <Select
                  label="Country"
                  value={data.country}
                  onChange={(e: any) =>
                    setField("country", e?.target?.value ?? e)
                  }
                  options={countryOptions}
                  className="!bg-white"
                />
                {errors.country && (
                  <p id="err-country" className="mt-1 text-xs text-red-600">
                    {errors.country}
                  </p>
                )}
              </div>

              <Input
                label="Postal code"
                value={data.postalCode ?? ""}
                onChange={(e) => setField("postalCode", e.target.value)}
                disabled={anyBusy}
              />
            </div>

            <Input
              label="Designation"
              value={data.designation}
              onChange={(e) => setField("designation", e.target.value)}
              disabled={anyBusy}
            />

            {/* Contact email/phone (read-only), plus editable altContact */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Contact email"
                value={data.user.email}
                disabled
                className="opacity-90"
              />

              {/* Display contact phone as code + number (disabled) */}
              <div className="opacity-90">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contact phone
                </label>
                <div className="flex gap-2">
                  <select
                    value={mainPhone.code}
                    disabled
                    className="w-36 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {COUNTRY_CODES.map((cc) => (
                      <option key={cc.code} value={cc.code}>
                        {cc.code} ({cc.name})
                      </option>
                    ))}
                  </select>
                  <Input value={mainPhone.number} disabled />
                </div>
              </div>
            </div>

            {/* Editable Alt contact */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Alt. contact (country code)
                </label>
                <select
                  value={altCountryCode}
                  onChange={(e) => setAltCountryCode(e.target.value)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={anyBusy}
                >
                  {COUNTRY_CODES.map((cc) => (
                    <option key={cc.code} value={cc.code}>
                      {cc.code} ({cc.name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Alt. contact number (optional)"
                  value={altLocal}
                  onChange={(e) =>
                    setAltLocal(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="e.g., 50000001"
                  disabled={anyBusy}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={anyBusy}
              className="border-[#3D1673]/30"
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={anyBusy}
              className="bg-[#3D1673] hover:bg-[#2B0E54]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
