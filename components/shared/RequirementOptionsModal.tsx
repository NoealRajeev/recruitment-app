// components/shared/RequirementOptionsModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Trash2, GripVertical, Plus, X, Save, Lock, Info } from "lucide-react";
import { useToast } from "@/context/toast-provider";

type OptionType =
  | "JOB_TITLE"
  | "TICKET_FREQUENCY"
  | "WORK_LOCATION"
  | "PREVIOUS_EXPERIENCE"
  | "LANGUAGE"
  | "CURRENCY"
  | "CONTRACT_DURATION";

type Option = {
  id: string;
  type: OptionType;
  value: string;
  isActive: boolean;
  order: number;
  usageCount?: number;
};

const TABS: { key: OptionType; label: string }[] = [
  { key: "JOB_TITLE", label: "Job Titles" },
  { key: "CONTRACT_DURATION", label: "Contract Durations" },
  { key: "TICKET_FREQUENCY", label: "Ticket Frequencies" },
  { key: "WORK_LOCATION", label: "Work Locations" },
  { key: "PREVIOUS_EXPERIENCE", label: "Previous Experience" },
  { key: "LANGUAGE", label: "Languages" },
  { key: "CURRENCY", label: "Currencies" },
];

const brand = {
  primary: "#2C0053",
  subtle: "#EDDDF3",
  subtle40: "rgba(237, 221, 243, 0.4)",
};

/** ---------- Formatting & Validation helpers ---------- **/

const toTitleCase = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|\s|-|\/)([a-z])/g, (m, p1, p2) => `${p1}${p2.toUpperCase()}`);

const hasDigits = (s: string) => /\d/.test(s);

/** allow letters, spaces and simple separators like & - / ' . */
const nameLikePattern = /^[A-Za-z\s&\-\/'’.]+$/;

/** e.g. "1 Day", "10 days", "3 Weeks", "6 Months", "1 Year", "5+ Years" */
const durationPattern =
  /^(\d+(\+)?)(\s*)(day|days|week|weeks|month|months|year|years)$/i;

/** ISO currency-ish: exactly 3 letters */
const currencyPattern = /^[A-Za-z]{3}$/;

/** Tooltip text per tab */
const ruleText = (type: OptionType) => {
  switch (type) {
    case "JOB_TITLE":
    case "TICKET_FREQUENCY":
    case "WORK_LOCATION":
    case "PREVIOUS_EXPERIENCE":
    case "LANGUAGE":
      return "Auto TitleCase; no numbers; only letters, spaces, and basic separators (& - / ' .)";
    case "CONTRACT_DURATION":
      return 'Use a duration like "1 Day", "3 Weeks", "6 Months", "1 Year", or "5+ Years".';
    case "CURRENCY":
      return 'Exactly 3 letters; auto-UPPERCASE (e.g., "QAR", "USD", "EUR").';
  }
};

/** small themed tooltip */
const Tip: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "",
}) => (
  <span className={`relative inline-block group ${className}`}>
    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full text-[#150B3D]">
      <Info className="w-3.5 h-3.5" />
    </span>
    <span
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 z-20 hidden group-hover:block group-focus:block
                 whitespace-pre rounded-md bg-[#150B3D] text-white text-xs px-2 py-1 shadow"
      role="tooltip"
    >
      {text}
    </span>
  </span>
);

/** per-type sanitizer + validator */
function sanitizeAndValidate(
  type: OptionType,
  raw: string
): { value: string; error?: string } {
  const input = raw.trim();
  if (!input) return { value: input, error: "Value is required" };

  switch (type) {
    case "JOB_TITLE":
    case "TICKET_FREQUENCY":
    case "WORK_LOCATION":
    case "PREVIOUS_EXPERIENCE":
    case "LANGUAGE": {
      const normalized = toTitleCase(input);
      if (hasDigits(normalized)) {
        return { value: normalized, error: "Numbers are not allowed here" };
      }
      if (!nameLikePattern.test(normalized)) {
        return {
          value: normalized,
          error:
            "Only letters, spaces and basic separators (& - / ' .) allowed",
        };
      }
      return { value: normalized };
    }
    case "CONTRACT_DURATION": {
      const normalized = toTitleCase(input).replace(/\s+/g, " ");
      const ok =
        durationPattern.test(normalized) ||
        /^(\d+)\s*(\+)\s*(year|years)$/i.test(normalized);
      if (!ok) {
        return {
          value: normalized,
          error:
            "Use a duration like “1 Day”, “3 Weeks”, “6 Months”, “1 Year”, or “5+ Years”",
        };
      }
      // normalize pluralization
      const m = normalized.match(/^(\d+)(\+)?\s*(\w+)$/i);
      if (m) {
        const n = parseInt(m[1], 10);
        const plus = m[2] ? "+" : "";
        let unit = m[3].toLowerCase();
        if (unit.startsWith("day")) unit = n === 1 && !plus ? "Day" : "Days";
        else if (unit.startsWith("week"))
          unit = n === 1 && !plus ? "Week" : "Weeks";
        else if (unit.startsWith("month"))
          unit = n === 1 && !plus ? "Month" : "Months";
        else if (unit.startsWith("year"))
          unit = n === 1 && !plus ? "Year" : "Years";
        return { value: `${n}${plus} ${unit}` };
      }
      return { value: normalized };
    }
    case "CURRENCY": {
      const normalized = input.toUpperCase();
      if (!currencyPattern.test(normalized)) {
        return {
          value: normalized,
          error: "Currency must be exactly 3 letters (e.g., QAR, USD, EUR)",
        };
      }
      return { value: normalized };
    }
  }
}

/** ---------- Component ---------- **/

export function RequirementOptionsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<OptionType>("JOB_TITLE");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Option[]>([]);
  const [creatingValue, setCreatingValue] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<Option>>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string | null>>({});

  const filtered = useMemo(
    () =>
      items
        .filter((i) => i.type === activeTab)
        .sort((a, b) => a.order - b.order || a.value.localeCompare(b.value)),
    [items, activeTab]
  );

  const hasUnsaved = useMemo(() => Object.keys(drafts).length > 0, [drafts]);
  const isRowEdited = (id: string) => !!drafts[id];
  const currentValue = (opt: Option, key: keyof Option) =>
    (drafts[opt.id]?.[key] as any) ?? (opt as any)[key];

  const fetchAll = async (type?: OptionType) => {
    setLoading(true);
    try {
      const q = type ? `?type=${type}&includeUsage=1` : "?includeUsage=1";
      const res = await fetch(`/api/requirement-options${q}`);
      const data = await res.json();
      setItems((prev) => {
        if (type) {
          const others = prev.filter((p) => p.type !== type);
          return [...others, ...data];
        }
        return data;
      });
      if (type) {
        setDrafts((d) => {
          const copy = { ...d };
          for (const id of Object.keys(copy)) {
            const found = data.find((x: Option) => x.id === id);
            if (found) delete copy[id];
          }
          return copy;
        });
      } else {
        setDrafts({});
      }
      setRowErrors({});
      setCreateError(null);
    } catch {
      toast({ type: "error", message: "Failed to load options" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Global hotkey: save drafts
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (hasUnsaved) void saveAll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, hasUnsaved]);

  /** ---------- Create ---------- **/
  const create = async () => {
    const raw = creatingValue.trim();
    if (!raw) return;

    const { value, error } = sanitizeAndValidate(activeTab, raw);
    if (error) {
      setCreateError(error);
      setCreatingValue(value);
      return;
    }
    setCreateError(null);

    try {
      const payload = { type: activeTab, value, order: filtered.length };
      const res = await fetch("/api/requirement-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let e: any = {};
        try {
          e = await res.json();
        } catch {}
        if (res.status === 409 && e?.error === "DUPLICATE") {
          setCreateError(`"${value}" already exists in this list`);
          return;
        }
        setCreateError(e?.message || "Failed to add");
        return;
      }

      setCreatingValue("");
      setCreateError(null);
      await fetchAll(activeTab);
      toast({ type: "success", message: "Added" });
    } catch (e: any) {
      setCreateError(e?.message || "Failed to add");
    }
  };

  /** ---------- Update (immediate) ---------- **/
  const updateImmediate = async (id: string, patch: Partial<Option>) => {
    try {
      const res = await fetch("/api/requirement-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) {
        let e: any = {};
        try {
          e = await res.json();
        } catch {}
        if (res.status === 409 && e?.error === "IN_USE") {
          toast({
            type: "error",
            message:
              e?.message ||
              "This option is used in existing records and cannot be changed.",
          });
          await fetchAll(activeTab);
          return;
        }
        toast({ type: "error", message: e?.message || "Update failed" });
        return;
      }
      await fetchAll(activeTab);
    } catch (e: any) {
      toast({ type: "error", message: e.message || "Update failed" });
    }
  };

  /** ---------- Delete ---------- **/
  const remove = async (id: string) => {
    if (!confirm("Delete this option? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/requirement-options?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let e: any = {};
        try {
          e = await res.json();
        } catch {}
        if (res.status === 409 && e?.error === "IN_USE") {
          toast({
            type: "error",
            message:
              e?.message ||
              "This option is used in existing records and cannot be deleted.",
          });
          await fetchAll(activeTab);
          return;
        }
        toast({ type: "error", message: e?.message || "Delete failed" });
        return;
      }
      await fetchAll(activeTab);
      toast({ type: "success", message: "Deleted" });
    } catch (e: any) {
      toast({ type: "error", message: e.message || "Delete failed" });
    }
  };

  /** ---------- Reorder ---------- **/
  const move = async (index: number, dir: -1 | 1) => {
    const list = [...filtered];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    const a = list[index];
    const b = list[j];
    await Promise.all([
      updateImmediate(a.id, { order: Math.max(0, b.order) }),
      updateImmediate(b.id, { order: Math.max(0, a.order) }),
    ]);
  };

  /** ---------- Draft helpers ---------- **/
  const patchDraft = (id: string, patch: Partial<Option>) =>
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] || {}), ...patch } }));

  const discardRowDraft = (id: string) => {
    setDrafts((d) => {
      const copy = { ...d };
      delete copy[id];
      return copy;
    });
    setRowErrors((r) => {
      const copy = { ...r };
      delete copy[id];
      return copy;
    });
  };

  /** live sanitize/validate on edit */
  const onEditValue = (opt: Option, raw: string) => {
    if ((opt.usageCount ?? 0) > 0) {
      toast({
        type: "error",
        message: "This option is in use and its value cannot be edited.",
      });
      return;
    }
    const { value, error } = sanitizeAndValidate(opt.type, raw);
    patchDraft(opt.id, { value });
    setRowErrors((prev) => ({ ...prev, [opt.id]: error || null }));
  };

  /** ---------- Save / Discard all ---------- **/
  const saveAll = async () => {
    const entries = Object.entries(drafts);
    if (entries.length === 0) return;

    const badRows = Object.entries(rowErrors)
      .filter(([_, msg]) => !!msg)
      .map(([id]) => id);

    if (badRows.length > 0) {
      toast({
        type: "error",
        message: "Fix validation errors (red rows) before saving.",
      });
      return;
    }

    try {
      for (const [id, patch] of entries) {
        if (typeof patch.value === "string") {
          const base = items.find((x) => x.id === id);
          if (base) {
            const { value, error } = sanitizeAndValidate(
              base.type,
              patch.value
            );
            if (error) {
              setRowErrors((prev) => ({ ...prev, [id]: error }));
              continue;
            }
            patch.value = value;
          }
        }

        const row = items.find((x) => x.id === id);
        if (
          row?.usageCount &&
          row.usageCount > 0 &&
          patch.value !== undefined
        ) {
          toast({
            type: "error",
            message:
              "This option is used in existing records and its value cannot be edited.",
          });
          continue;
        }
        await updateImmediate(id, patch);
      }
      setDrafts({});
      setRowErrors({});
      toast({ type: "success", message: "Changes saved" });
    } catch {
      /* per-item toasts already shown */
    }
  };

  const discardAll = async () => {
    setDrafts({});
    setRowErrors({});
    await fetchAll(activeTab);
    toast({ type: "info", message: "All changes discarded" });
  };

  /** ---------- Switch ---------- **/
  const Switch = ({
    checked,
    onChange,
    disabled,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition
        ${checked ? "bg-[#2C0053]" : "bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      aria-pressed={checked}
      aria-label="Toggle active"
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition
          ${checked ? "translate-x-5" : "translate-x-1"}`}
      />
    </button>
  );

  const safeSetTab = (next: OptionType) => {
    if (next === activeTab) return;
    if (hasUnsaved) {
      const ok = confirm(
        "You have unsaved changes on this tab. Discard them and switch?"
      );
      if (!ok) return;
      setDrafts({});
      setRowErrors({});
    }
    setActiveTab(next);
    setCreateError(null);
  };

  const activeRuleText = ruleText(activeTab);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (hasUnsaved && !confirm("Discard all unsaved changes and close?"))
          return;
        onClose();
        setDrafts({});
        setRowErrors({});
        setCreateError(null);
      }}
      title="Manage Requirement Options"
      size="5xl"
      showFooter={false}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div className="flex gap-2 overflow-x-auto sm:overflow-visible pb-1 -mx-2 sm:mx-0 px-2 md:hidden">
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            const tabHasEdits = isActive && hasUnsaved;
            return (
              <button
                key={t.key}
                onClick={() => safeSetTab(t.key)}
                className={`relative whitespace-nowrap rounded-full px-3 py-1 text-sm transition border
                  ${
                    isActive
                      ? "bg-white text-[#150B3D] border-[#EDDDF3] shadow-sm"
                      : "bg-[rgba(237,221,243,0.4)] text-[#150B3D]/80 border-transparent hover:bg-white"
                  }`}
              >
                {t.label}
                {tabHasEdits && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>

        {hasUnsaved && (
          <div className="flex items-center gap-2">
            <Button
              onClick={saveAll}
              className="inline-flex gap-2 bg-[#2C0053] hover:bg-[#2C0053]/90"
            >
              <Save className="w-4 h-4" />
              Save changes
            </Button>
            <Button variant="outline" onClick={discardAll}>
              Discard changes
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {/* Desktop left rail */}
        <div className="hidden md:block w-52 shrink-0 mb-4">
          <div
            className="rounded-xl overflow-hidden border"
            style={{ borderColor: brand.subtle, background: brand.subtle40 }}
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => safeSetTab(t.key)}
                className={`w-full text-left px-4 py-3 text-sm transition ${
                  activeTab === t.key
                    ? "bg-white text-[#150B3D] font-semibold"
                    : "text-[#150B3D]/80 hover:bg-white/60"
                }`}
              >
                {t.label}
                {hasUnsaved && activeTab === t.key && (
                  <span className="ml-2 align-middle inline-block h-2 w-2 rounded-full bg-amber-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0">
          <div
            className="rounded-xl border bg-white p-4"
            style={{ borderColor: brand.subtle }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#150B3D]">
                {TABS.find((t) => t.key === activeTab)?.label}
              </h3>
              {loading && (
                <span className="text-xs text-[#150B3D]/50">Loading…</span>
              )}
            </div>

            {/* Add new */}
            <div
              className={`flex flex-col sm:flex-row gap-2 mb-4 rounded-md ${
                createError ? "bg-red-50 p-2" : ""
              }`}
            >
              <div className="flex-1 flex items-center gap-2">
                <Input
                  placeholder={`Add a new ${TABS.find(
                    (t) => t.key === activeTab
                  )
                    ?.label.replace(/s$/, "")
                    .toLowerCase()}`}
                  value={creatingValue}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setCreatingValue(raw);
                    if (createError) {
                      const { error } = sanitizeAndValidate(activeTab, raw);
                      setCreateError(error || null);
                    }
                  }}
                  onBlur={() => {
                    if (!creatingValue.trim()) return;
                    const { value, error } = sanitizeAndValidate(
                      activeTab,
                      creatingValue
                    );
                    setCreatingValue(value);
                    setCreateError(error || null);
                  }}
                  className={`flex-1 ${createError ? "border-red-300" : ""}`}
                />
                <Tip text={activeRuleText} />
              </div>

              <Button onClick={create} className="inline-flex gap-1">
                <Plus className="w-4 h-4" /> Add
              </Button>

              {createError && (
                <div className="text-xs text-red-600 sm:self-center sm:ml-1">
                  {createError}
                </div>
              )}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <div className="text-sm text-[#150B3D]/60">
                No options yet. Add your first one above.
              </div>
            ) : (
              <div
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: "#F1E8F6" }}
              >
                {filtered.map((opt, i) => {
                  const edited = isRowEdited(opt.id);
                  const locked = (opt.usageCount ?? 0) > 0;
                  const errorMsg = rowErrors[opt.id];

                  return (
                    <div
                      key={opt.id}
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 border-b last:border-b-0
                        ${
                          errorMsg
                            ? "bg-red-50"
                            : edited
                              ? "bg-amber-50"
                              : "bg-[#F9F5FC]"
                        }`}
                      style={{ borderColor: "#F1E8F6" }}
                    >
                      {/* Reorder */}
                      <div className="flex items-center gap-3 shrink-0">
                        <GripVertical className="w-4 h-4 text-[#150B3D]/30" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#150B3D]/50 w-6 text-right">
                            {currentValue(opt, "order")}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              onClick={() => move(i, -1)}
                              disabled={i === 0 || loading}
                              aria-label="Move up"
                            >
                              ↑
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => move(i, +1)}
                              disabled={i === filtered.length - 1 || loading}
                              aria-label="Move down"
                            >
                              ↓
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Value */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Input
                            value={currentValue(opt, "value") as string}
                            onChange={(e) =>
                              onEditValue(opt, e.target.value ?? "")
                            }
                            className={`bg-white ${
                              locked ? "opacity-70" : ""
                            } ${errorMsg ? "border-red-300" : ""}`}
                            disabled={locked}
                          />
                          <Tip text={ruleText(opt.type)} />
                          {locked && (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-[#EDDDF3] text-[#150B3D]"
                              title={`In use: ${opt.usageCount}`}
                            >
                              <Lock className="w-3 h-3" />
                              In use: {opt.usageCount}
                            </span>
                          )}
                        </div>
                        {errorMsg ? (
                          <span className="mt-1 inline-block text-[11px] font-medium text-red-700">
                            {errorMsg}
                          </span>
                        ) : edited && !locked ? (
                          <span className="mt-1 inline-block text-[11px] font-medium text-amber-700">
                            Unsaved
                          </span>
                        ) : null}
                      </div>

                      {/* Status + actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#150B3D]/70">
                            Inactive
                          </span>
                          <Switch
                            checked={currentValue(opt, "isActive") as boolean}
                            onChange={(v) =>
                              updateImmediate(opt.id, { isActive: v })
                            }
                            disabled={loading}
                          />
                          <span className="text-xs text-[#150B3D]/70">
                            Active
                          </span>
                        </div>

                        {/* Row actions */}
                        {edited && !locked ? (
                          <button
                            onClick={() => discardRowDraft(opt.id)}
                            className="text-[#150B3D] hover:text-[#2C0053] p-2"
                            title="Discard row changes"
                            aria-label="Discard row changes"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              locked
                                ? toast({
                                    type: "error",
                                    message:
                                      "This option is in use and cannot be deleted.",
                                  })
                                : remove(opt.id)
                            }
                            className={`p-2 ${
                              locked
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-red-600 hover:text-red-700"
                            }`}
                            aria-label="Delete option"
                            title={locked ? "Cannot delete (in use)" : "Delete"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-xs text-[#150B3D]/50 my-5">
            In the company requirement form, load these options (filter by{" "}
            <code>isActive</code>, order by <code>order</code>).
          </p>

          {/* Mobile sticky save/discard */}
          {hasUnsaved && (
            <div className="sm:hidden sticky bottom-3 z-10 mt-3">
              <div className="bg-white/90 backdrop-blur rounded-xl shadow border px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-amber-700 font-medium">
                  You have unsaved changes
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={discardAll} variant="outline">
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveAll}
                    className="bg-[#2C0053] hover:bg-[#2C0053]/90"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
