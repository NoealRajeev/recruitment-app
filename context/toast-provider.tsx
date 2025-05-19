// context/toast-provider.tsx
"use client";

import {
  useState,
  createContext,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { AnimatePresence } from "framer-motion";
import { Toast } from "@/components/ui/Toast";

type ToastType = {
  id: string;
  message: string;
  type: "success" | "error";
  action?: {
    label: string;
    onClick: () => void;
  };
  replace?: boolean;
};

type ToastContextType = {
  toast: (options: Omit<ToastType, "id">) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [currentToast, setCurrentToast] = useState<ToastType | null>(null);
  const [queue, setQueue] = useState<ToastType[]>([]);

  const showNextToast = useCallback(() => {
    setCurrentToast(queue[0] || null);
    setQueue((prev) => prev.slice(1));
  }, [queue]);

  const toast = useCallback(
    (options: Omit<ToastType, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { ...options, id };

      setQueue((prev) => {
        if (options.replace) {
          setCurrentToast(newToast);
          return [];
        }
        if (!currentToast) {
          setCurrentToast(newToast);
          return prev;
        }
        return [...prev, newToast];
      });
    },
    [currentToast]
  );

  useEffect(() => {
    if (currentToast) {
      const timer = setTimeout(
        showNextToast,
        currentToast.type === "error" ? 7000 : 5000
      );
      return () => clearTimeout(timer);
    } else if (queue.length > 0) {
      showNextToast();
    }
  }, [currentToast, queue, showNextToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100]">
        <AnimatePresence>
          {currentToast && (
            <div className="relative">
              <Toast
                key={currentToast.id}
                {...currentToast}
                onDismiss={showNextToast}
              />
              {queue.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {queue.length + 1}
                </span>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
