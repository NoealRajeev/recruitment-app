"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@prisma/client";

export default function UserCreationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    role: UserRole | "CLIENT_ADMIN" | "RECRUITMENT_AGENCY";
    name: string;
    company: string;
  }>({
    email: "",
    password: "",
    role: "CLIENT_ADMIN",
    name: "",
    company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(await response.text());

      router.refresh();
      setFormData({
        email: "",
        password: "",
        role: "CLIENT_ADMIN",
        name: "",
        company: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md w-full bg-white/60 p-4 sm:p-6 rounded-xl"
    >
      {error && (
        <div
          className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div>
        <label className="block mb-1 text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={(e) =>
            setFormData({ ...formData, role: e.target.value as UserRole })
          }
          className="w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="CLIENT_ADMIN">Client Admin</option>
          <option value="RECRUITMENT_AGENCY">Recruitment Agency</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium" htmlFor="name">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium" htmlFor="company">
          Company
        </label>
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          value={formData.company}
          onChange={(e) =>
            setFormData({ ...formData, company: e.target.value })
          }
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        aria-busy={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
