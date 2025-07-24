"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="absolute top-4 right-4 z-20">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
        aria-label="Select language"
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
}
