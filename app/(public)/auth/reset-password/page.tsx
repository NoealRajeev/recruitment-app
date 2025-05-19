// app/(public)/auth/reset-password/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@radix-ui/react-label";
import { resetPassword } from "@/lib/auth/actions";
import { useToast } from "@/context/toast-provider";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { toast } = useToast(); // Changed from addToast to toast

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast({
        type: "error",
        message: "Passwords do not match",
        action: {
          label: "Try again",
          onClick: () => {
            setNewPassword("");
            setConfirmPassword("");
          },
        },
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPassword(newPassword);
      if (result?.error) {
        toast({
          type: "error",
          message: result.error,
          action: {
            label: "Try again",
            onClick: () => {
              setNewPassword("");
              setConfirmPassword("");
            },
          },
        });
      } else {
        toast({
          type: "success",
          message: "Password reset successfully",
        });

        // Simple 1 second delay before redirect
        setTimeout(() => {
          console.log("Redirecting to:", callbackUrl);
          router.push(callbackUrl);
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      toast({
        type: "error",
        message: "An error occurred. Please try again.",
        action: {
          label: "Try again",
          onClick: () => {
            setNewPassword("");
            setConfirmPassword("");
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Password validation checks
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasMinLength = newPassword.length >= 8;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-gradient-to-r from-[#FFFFFF] to-[#E4D7FF] rounded-[10px] w-[582px] h-[600px] p-10 sm:p-14 max-w-md shadow-lg">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Reset Your Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-700">
                New Password:
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="border-gray-300 focus:ring-2 focus:ring-purple-500"
              />
              <div className="text-sm text-gray-600 space-y-1 mt-2">
                <p
                  className={`flex items-center ${
                    hasLowercase ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {hasLowercase ? "✓" : "•"} At least one lowercase letter
                </p>
                <p
                  className={`flex items-center ${
                    hasMinLength ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {hasMinLength ? "✓" : "•"} Minimum 8 characters
                </p>
                <p
                  className={`flex items-center ${
                    hasUppercase ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {hasUppercase ? "✓" : "•"} At least one uppercase
                </p>
                <p
                  className={`flex items-center ${
                    hasNumber ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {hasNumber ? "✓" : "•"} At least one number
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm Password:
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                className="border-gray-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white py-3 rounded-md transition-colors"
              disabled={
                isLoading ||
                !hasLowercase ||
                !hasUppercase ||
                !hasNumber ||
                !hasMinLength
              }
            >
              {isLoading ? "Processing..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
