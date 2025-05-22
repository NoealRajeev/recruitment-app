"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  showLabelAsPlaceholder?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, options, showLabelAsPlaceholder, ...props },
    ref
  ) => {
    const { t } = useLanguage();

    return (
      <div className="space-y-1">
        {label && !showLabelAsPlaceholder && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-200",
            showLabelAsPlaceholder && "text-gray-400",
            className
          )}
          {...props}
        >
          <option value="" disabled selected={showLabelAsPlaceholder}>
            {showLabelAsPlaceholder ? label : t.selectOption || "Select..."}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-gray-800"
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
