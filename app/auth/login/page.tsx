// app/auth/login/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const redirectTo = searchParams.get("from") || "/dashboard";

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(redirectTo);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="bg-gradient-to-r from-[#FFFFFF] to-[#E4D7FF] rounded-[10] w-[582px] h-[600px] p-10 sm:p-14 max-w-md ">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-[#797979] mb-1">
            <p className=" text-[10] font-light">
            Email Address</p>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-2 border-[0.5] rounded-[5] focus:outline-none "
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-[#797979] mb-1">
          <p className=" text-[10] font-light">
            Password</p>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-4 py-2 border-[0.5] rounded-[5] focus:outline-none"
          />
          <div className="text-right mt-1 text-[#797979] cursor-pointer hover:underline">
          <p className=" text-[10] font-light">
            Forgot Password</p>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-[40] bg-gradient-to-r from-purple-600 to-black text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign Up"}
        </button>

        {/* Secondary Action */}
        <button
          type="button"
          className="w-full py-3 rounded-[40] border border-black text-black font-semibold hover:bg-black hover:text-white transition"
          onClick={() => router.push("/auth/signup")}
        >
          Get Started
        </button>
      </form>
    </div>
  </div>
  );
}
