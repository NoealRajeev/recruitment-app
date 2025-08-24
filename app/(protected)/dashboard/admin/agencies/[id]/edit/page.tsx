"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Camera, Loader2, Trash2, Mail } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/toast-provider";
import { useLanguage } from "@/context/LanguageContext";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type AgencyPayload = {
  id: string;
  agencyName: string;
  registrationNo: string | null;
  licenseNumber: string | null;
  licenseExpiry: string | Date | null;
  country: string;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  contactPerson?: string | null;
  user: {
    name: string;
    email: string;
    phone: string | null; // account-level, read-only here; stored like "+974 50000000"
    altContact?: string | null; // optional alt contact; stored like "+974 50000001"
    profilePicture?: string | null;
  };
};

type Errors = Partial<
  Record<
    | "agencyName"
    | "registrationNo"
    | "licenseNumber"
    | "licenseExpiry"
    | "country"
    | "address"
    | "city",
    string
  >
>;

export default function EditAgencyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const [data, setData] = useState<AgencyPayload | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Country select options
  const countryOptions = useMemo(
    () =>
      (t.nationalityOptions ?? []).map((nat: string) => ({
        value: nat,
        label: nat,
      })),
    [t.nationalityOptions]
  );

  // Country codes for phone/alt phone
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

  // Helpers to split/join numbers that may be "+974 55555555" or "+97455555555" or "974 555..."
  const splitPhone = (raw?: string | null) => {
    const phone = (raw ?? "").trim();
    if (!phone) return { code: "+974", number: "" };
    // Ensure leading +
    const withPlus = phone.startsWith("+") ? phone : `+${phone}`;
    const m = /^\+(\d{1,4})\s*(.*)$/.exec(withPlus);
    if (m) {
      return { code: `+${m[1]}`, number: (m[2] ?? "").replace(/\s+/g, "") };
    }
    return { code: "+974", number: withPlus.replace(/[^\d]/g, "") };
  };
  const formatDisplayPhone = (raw?: string | null) => {
    const { code, number } = splitPhone(raw);
    return number ? `${code} ${number}` : code; // show code even if number blank
  };

  // Editable alt contact UI state
  const [altCountryCode, setAltCountryCode] = useState<string>("+974");
  const [altContactLocal, setAltContactLocal] = useState<string>("");

  // Derived, read-only main phone parts (for consistent UI with country code)
  const mainPhoneParts = splitPhone(data?.user.phone);

  useEffect(() => {
    const load = async () => {
      try {
        if (!params?.id) throw new Error("Invalid agency ID");
        const res = await fetch(`/api/agencies/${params.id}`);
        if (!res.ok) throw new Error("Failed to load agency");
        const json = (await res.json()) as AgencyPayload;

        const normalized: AgencyPayload = {
          ...json,
          licenseExpiry: json.licenseExpiry
            ? typeof json.licenseExpiry === "string"
              ? json.licenseExpiry.slice(0, 10)
              : new Date(json.licenseExpiry).toISOString().slice(0, 10)
            : "",
          user: {
            ...json.user,
            profilePicture: json.user.profilePicture ?? null,
            altContact: json.user.altContact ?? null,
          },
        };

        // Seed alt-contact UI from stored value
        const alt = splitPhone(normalized.user.altContact);
        setAltCountryCode(alt.code);
        setAltContactLocal(alt.number);

        setData(normalized);
      } catch (e) {
        console.error(e);
        toast({ type: "error", message: "Failed to load agency" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.id, toast]);

  // ---------- Validation ----------
  const validate = (payload: AgencyPayload): Errors => {
    const e: Errors = {};
    const req = (v?: string | null) => (v ?? "").toString().trim().length > 0;

    if (!req(payload.agencyName)) e.agencyName = "Agency name is required.";
    if (!req(payload.registrationNo))
      e.registrationNo = "Registration number is required.";
    if (!req(payload.licenseNumber))
      e.licenseNumber = "License number is required.";
    if (!req(payload.licenseExpiry as string))
      e.licenseExpiry = "License expiry date is required.";
    if (!req(payload.country)) e.country = "Country is required.";
    if (!req(payload.address)) e.address = "Address is required.";
    if (!req(payload.city)) e.city = "City is required.";

    // basic date sanity
    if (!e.licenseExpiry && payload.licenseExpiry) {
      const d = new Date(payload.licenseExpiry as string);
      if (Number.isNaN(d.getTime())) {
        e.licenseExpiry = "Enter a valid date (YYYY-MM-DD).";
      }
    }
    return e;
  };

  type ErrorKey =
    | "agencyName"
    | "registrationNo"
    | "licenseNumber"
    | "licenseExpiry"
    | "country"
    | "address"
    | "city";

  const errorKeyMap: Partial<Record<keyof AgencyPayload, ErrorKey>> = {
    agencyName: "agencyName",
    registrationNo: "registrationNo",
    licenseNumber: "licenseNumber",
    licenseExpiry: "licenseExpiry",
    country: "country",
    address: "address",
    city: "city",
    // not validated in this form:
    id: undefined,
    postalCode: undefined,
    contactPerson: undefined,
    user: undefined,
  };

  const setField = <K extends keyof AgencyPayload>(
    key: K,
    value: AgencyPayload[K]
  ) => {
    if (!data) return;
    const next = { ...data, [key]: value };
    setData(next);

    const fieldErrors = validate(next);
    const mapped = errorKeyMap[key];
    if (mapped) {
      setErrors((prev) => ({ ...prev, [mapped]: fieldErrors[mapped] }));
    }
  };

  const setUserField = <K extends keyof AgencyPayload["user"]>(
    key: K,
    value: AgencyPayload["user"][K]
  ) => {
    if (!data) return;
    setData({ ...data, user: { ...data.user, [key]: value } });
  };

  // -------- Avatar handlers --------
  const uploadAvatar = async (file: File) => {
    if (!params?.id) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/agencies/${params.id}/avatar`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed");

      setUserField("profilePicture", json.url);
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
      const res = await fetch(`/api/agencies/${params.id}/avatar`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Delete failed");

      setUserField("profilePicture", null);
      toast({ type: "success", message: "Profile picture removed" });
    } catch (e: any) {
      toast({ type: "error", message: e?.message || "Delete failed" });
    } finally {
      setDeletingAvatar(false);
    }
  };

  // -------- Reset password --------
  const sendResetPassword = async () => {
    if (!data?.user.email) {
      toast({ type: "error", message: "No email on file." });
      return;
    }
    setSendingReset(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.user.email }),
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

  // -------- Submit (PATCH) --------
  const submit = async () => {
    if (!data || !params?.id) return;

    const validation = validate(data);
    setErrors(validation);
    if (Object.keys(validation).length) {
      const firstKey = Object.keys(validation)[0] as keyof Errors | undefined;
      if (firstKey) {
        const el = document.querySelector(
          `[aria-describedby="err-${firstKey}"]`
        ) as HTMLElement | null;
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      toast({ type: "error", message: "Please fix the highlighted fields." });
      return;
    }

    // Build altContact string with a SPACE (matches registration): "+974 50000001"
    const altContact =
      altContactLocal.trim().length > 0
        ? `${altCountryCode} ${altContactLocal.trim()}`
        : null;

    setSaving(true);
    try {
      const res = await fetch(`/api/agencies/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: data.agencyName,
          registrationNo: data.registrationNo,
          licenseNumber: data.licenseNumber,
          licenseExpiry: data.licenseExpiry, // server converts to Date
          country: data.country,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          contactPerson: data.contactPerson ?? null,
          user: {
            name: data.user.name,
            profilePicture: data.user.profilePicture,
            // NOTE: we do NOT send main phone/email here (account-level)
            altContact, // <- persisted in registration style: "<code> <number>"
          },
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast({ type: "success", message: "Agency updated" });
      router.push("/dashboard/admin/agencies");
    } catch (e) {
      console.error(e);
      toast({ type: "error", message: "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  // ---------- Loading ----------
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

  const initials = (data.agencyName || "?").charAt(0).toUpperCase();
  const anyBusy = saving || uploading || deletingAvatar || sendingReset;

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Card */}
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
                      alt="Agency logo"
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

              {/* Meta + actions */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-white truncate">
                      {data.agencyName}
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
                            Removing…
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

        {/* Form */}
        <section className="rounded-2xl border bg-white shadow-sm p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Agency name */}
            <div>
              <Input
                label="Agency name"
                value={data.agencyName}
                onChange={(e) => setField("agencyName", e.target.value)}
                aria-invalid={!!errors.agencyName}
                aria-describedby={
                  errors.agencyName ? "err-agencyName" : undefined
                }
                disabled={anyBusy}
                className={errors.agencyName ? "border-red-500" : undefined}
              />
              {errors.agencyName && (
                <p id="err-agencyName" className="mt-1 text-xs text-red-600">
                  {errors.agencyName}
                </p>
              )}
            </div>

            {/* Reg no + License no */}
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
                <Input
                  label="License Number"
                  value={data.licenseNumber ?? ""}
                  onChange={(e) => setField("licenseNumber", e.target.value)}
                  aria-invalid={!!errors.licenseNumber}
                  aria-describedby={
                    errors.licenseNumber ? "err-licenseNumber" : undefined
                  }
                  disabled={anyBusy}
                  className={
                    errors.licenseNumber ? "border-red-500" : undefined
                  }
                />
                {errors.licenseNumber && (
                  <p
                    id="err-licenseNumber"
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.licenseNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Expiry + Country */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Input
                  type="date"
                  label="License Expiry"
                  value={(data.licenseExpiry as string) || ""}
                  onChange={(e) => setField("licenseExpiry", e.target.value)}
                  aria-invalid={!!errors.licenseExpiry}
                  aria-describedby={
                    errors.licenseExpiry ? "err-licenseExpiry" : undefined
                  }
                  disabled={anyBusy}
                  className={
                    errors.licenseExpiry ? "border-red-500" : undefined
                  }
                />
                {errors.licenseExpiry && (
                  <p
                    id="err-licenseExpiry"
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.licenseExpiry}
                  </p>
                )}
              </div>

              {/* Country select */}
              <Select
                label="Country"
                value={data.country}
                onChange={(e: any) =>
                  setField("country", (e?.target?.value ?? e) as string)
                }
                options={countryOptions}
                className="!bg-white"
              />
            </div>

            {/* Address */}
            <div>
              <Input
                label="Address"
                value={data.address ?? ""}
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

            {/* City / Postal */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="City"
                  value={data.city ?? ""}
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
              <Input
                label="Postal code"
                value={data.postalCode ?? ""}
                onChange={(e) => setField("postalCode", e.target.value)}
                disabled={anyBusy}
              />
            </div>

            {/* Account fields (read-only). Show phone split into code+number */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Contact email"
                value={data.user.email}
                disabled
                className="opacity-90"
              />
              <div className="!opacity-90">
                <Label className="mb-1 block text-sm font-medium text-gray-700">
                  Contact phone
                </Label>
                <div className="flex gap-2">
                  <select
                    value={mainPhoneParts.code}
                    disabled
                    className="w-36 rounded-md border border-input bg-background px-3 py-2 text-sm opacity-90"
                  >
                    {COUNTRY_CODES.map((cc) => (
                      <option key={cc.code} value={cc.code}>
                        {cc.code} ({cc.name})
                      </option>
                    ))}
                  </select>
                  <Input
                    value={mainPhoneParts.number}
                    disabled
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm opacity-90"
                  />
                </div>
              </div>
            </div>

            {/* Alt contact (editable) */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Alt. contact (country code)
                </label>
                <select
                  value={altCountryCode}
                  onChange={(e) => setAltCountryCode(e.target.value)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  value={altContactLocal}
                  onChange={(e) =>
                    setAltContactLocal(e.target.value.replace(/[^\d]/g, ""))
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
