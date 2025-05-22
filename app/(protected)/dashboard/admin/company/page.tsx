// app/(protected)/dashboard/admin/company/page.tsx
"use client";
import CompanyCardContent from "@/components/shared/Cards/CompanyCardContent";

export default function Company() {
  return (
    <div className="p-6 space-y-8">
      {/* Top Section - Pending Company */}
      <div className="bg-[#EED7F3] p-6 rounded-xl flex flex-col lg:flex-row justify-between gap-6 items-center shadow-md">
        <div className="flex items-center gap-5">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
            alt="Google"
            className="w-16 h-16"
          />
          <div>
            <h2 className="text-xl font-bold">Google</h2>
            <p className="text-sm">Registration Number: 033028</p>
            <p className="text-sm">Sector: Technology</p>
            <p className="text-sm">Company Size: 100+</p>
            <p className="text-sm">
              Company Website:{" "}
              <a
                href="https://about.google/"
                className="text-blue-600 underline"
              >
                https://about.google/
              </a>
            </p>
          </div>
        </div>

        <div className="text-sm">
          <p>
            <span className="font-bold">Name:</span> Noeal Rajeev T
          </p>
          <p>
            <span className="font-bold">Designation:</span> CTO
          </p>
          <p>
            <span className="font-bold">Phone Number:</span> +91 1234567890
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-center">
            <p className="text-xs text-gray-700 mb-1">Status</p>
            <span className="bg-yellow-300 text-black px-3 py-1 text-xs rounded-full">
              Pending
            </span>
          </div>

          <div className="flex gap-2 mt-4">
            <button className="bg-[#3D1673] text-white px-4 py-2 rounded-lg hover:bg-[#2b0e54]">
              Accept
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Reject
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Company Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Accepted Companies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(12)].map((_, index) => (
            <CompanyCardContent
              key={index}
              companyName={`Company ${index + 1}`}
              logoUrl="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
              onClick={() => console.log(`Company ${index + 1} clicked`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
