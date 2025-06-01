// components/ui/modal.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "full";
  className?: string;
  showFooter?: boolean;
  footerContent?: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  confirmVariant?: "default" | "destructive";
  isLoading?: boolean;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      size = "md",
      className,
      showFooter = false,
      footerContent,
      onConfirm,
      confirmText = "Confirm",
      confirmVariant = "default",
      isLoading = false,
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      "3xl": "max-w-3xl",
      "4xl": "max-w-4xl",
      "5xl": "max-w-5xl",
      "6xl": "max-w-6xl",
      "7xl": "max-w-7xl",
      full: "max-w-full",
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm h-full">
        <div
          ref={ref}
          className={cn(
            "w-full rounded-lg bg-white shadow-lg overflow-hidden",
            "flex flex-col max-h-[90vh]", // Added max-h and flex-col
            sizeClasses[size],
            className
          )}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6">
            <h3 className="text-lg font-semibold text-[#2C0053]">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Content - Now flex-grow to push footer down */}
          <div className="px-6 overflow-y-auto flex-grow">{children}</div>

          {/* Modal Footer - Conditionally rendered */}
          {showFooter && (
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              {footerContent ? (
                footerContent
              ) : (
                <>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant={confirmVariant}
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="w-1/3 bg-[#3D1673] hover:bg-[#2b0e54] text-white py-2 px-4 rounded-md"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
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
                        {confirmText}
                      </span>
                    ) : (
                      confirmText
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";

export { Modal };
