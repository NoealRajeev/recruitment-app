// components/ui/HorizontalSelect.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface HorizontalSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

const HorizontalSelect = React.forwardRef<
  HTMLSelectElement,
  HorizontalSelectProps
>(({ className, label, error, options, ...props }, ref) => {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-12 items-center">
        <label
          htmlFor={props.id}
          className="col-span-4 text-sm font-medium text-gray-700 text-left"
        >
          {label}
          {props.required && <span className="text-[#FF0404] ml-1">*</span>}
        </label>
        <div className="relative col-span-8">
          <select
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-[#FF0404] focus-visible:ring-red-200",
              className
            )}
            {...props}
          >
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
        </div>
      </div>
      {error && (
        <p className="text-sm text-[#FF0404] ml-36" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

HorizontalSelect.displayName = "HorizontalSelect";

export { HorizontalSelect };
