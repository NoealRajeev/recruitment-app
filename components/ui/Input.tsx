// components/ui/input.tsx
"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        horizontal: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  loading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, loading, variant, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { t } = useLanguage();

    // Default variant (vertical layout)
    if (variant === "default" || !variant) {
      return (
        <div className="space-y-1">
          {label && (
            <label
              htmlFor={props.id}
              className="block text-sm font-medium text-gray-700"
            >
              {label}
              {props.required && <span className="text-[#FF0404] ml-1">*</span>}
            </label>
          )}
          <div className="relative">
            <input
              type={type}
              className={cn(
                inputVariants({ variant }),
                error && "border-[#FF0404] focus-visible:ring-red-200",
                className
              )}
              ref={ref}
              {...props}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
          {error && (
            <p className="text-sm text-[#FF0404]" role="alert">
              {error}
            </p>
          )}
        </div>
      );
    }

    // Horizontal variant (label on left, input on right)
    if (variant === "horizontal") {
      return (
        <div className="space-y-1">
          <div className="grid grid-cols-12 items-center">
            {label && (
              <label
                htmlFor={props.id}
                className="col-span-4 text-sm font-medium text-gray-700 text-left"
              >
                {label}
                {props.required && (
                  <span className="text-[#FF0404] ml-1">*</span>
                )}
              </label>
            )}
            <div className="relative col-span-8">
              <input
                type={type}
                className={cn(
                  inputVariants({ variant }),
                  error && "border-[#FF0404] focus-visible:ring-red-200",
                  className
                )}
                ref={ref}
                {...props}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </div>
          {error && (
            <p className="text-sm text-[#FF0404] ml-36" role="alert">
              {error}
            </p>
          )}
        </div>
      );
    }

    return null;
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
