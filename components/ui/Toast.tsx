// components/ui/toast.tsx
"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

type ToastProps = {
  id: string;
  message: string;
  type: "success" | "error";
  onDismiss: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function Toast({ id, message, type, onDismiss, action }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", damping: 25 }}
      className={`relative w-80 p-4 rounded-lg shadow-lg ${
        type === "success" ? "bg-green-50" : "bg-red-50"
      }`}
    >
      <div className="flex items-start gap-3">
        {type === "success" ? (
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        )}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">
            {type === "success" ? "Success!" : "Uh oh! Something went wrong."}
          </h3>
          <p className="mt-1 text-sm text-gray-700">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
