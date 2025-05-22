// app/(protected)/dashboard/admin/agencies/page.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/shared/Card";
import AgencyCardContent from "@/components/shared/Cards/AgencyCardContent";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Agency {
  id: number;
  name: string;
  email: string;
  registrationNumber: string;
  licenseExpiryDate: string;
  countryOfOperation: string;
  fullName: string;
  phoneNumber: string;
  logoUrl: string;
  status: "review pending" | "rejected" | "not verified" | "verified";
}

interface RegistrationFormData {
  agencyName: string;
  registrationNumber: string;
  licenseExpiryDate: string;
  countryOfOperation: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
}

export default function Agencies() {
  const [registrationData, setRegistrationData] =
    useState<RegistrationFormData>({
      agencyName: "",
      registrationNumber: "",
      licenseExpiryDate: "",
      countryOfOperation: "",
      fullName: "",
      emailAddress: "",
      phoneNumber: "",
    });

  // Mock data for agencies
  const agencies: Agency[] = [
    {
      id: 1,
      name: "Agency 1",
      email: "agency1@gmail.com",
      registrationNumber: "115206",
      licenseExpiryDate: "2025-12-31",
      countryOfOperation: "Qatar",
      fullName: "John Doe",
      phoneNumber: "+974-1234567",
      logoUrl: "/api/placeholder/48/48",
      status: "review pending",
    },
    {
      id: 2,
      name: "Agency 2",
      email: "agency2@gmail.com",
      registrationNumber: "115207",
      licenseExpiryDate: "2025-11-30",
      countryOfOperation: "Qatar",
      fullName: "Jane Smith",
      phoneNumber: "+974-1234568",
      logoUrl: "/api/placeholder/48/48",
      status: "rejected",
    },
    {
      id: 3,
      name: "Agency 3",
      email: "agency3@gmail.com",
      registrationNumber: "115208",
      licenseExpiryDate: "2025-10-31",
      countryOfOperation: "Qatar",
      fullName: "Bob Johnson",
      phoneNumber: "+974-1234569",
      logoUrl: "/api/placeholder/48/48",
      status: "not verified",
    },
    {
      id: 4,
      name: "Agency 4",
      email: "agency4@gmail.com",
      registrationNumber: "115209",
      licenseExpiryDate: "2025-09-30",
      countryOfOperation: "Qatar",
      fullName: "Alice Brown",
      phoneNumber: "+974-1234570",
      logoUrl: "/api/placeholder/48/48",
      status: "not verified",
    },
    {
      id: 5,
      name: "Agency 5",
      email: "agency5@gmail.com",
      registrationNumber: "115210",
      licenseExpiryDate: "2025-08-31",
      countryOfOperation: "Qatar",
      fullName: "Charlie Wilson",
      phoneNumber: "+974-1234571",
      logoUrl: "/api/placeholder/48/48",
      status: "review pending",
    },
    {
      id: 6,
      name: "Agency 6",
      email: "agency6@gmail.com",
      registrationNumber: "115211",
      licenseExpiryDate: "2025-07-31",
      countryOfOperation: "Qatar",
      fullName: "Diana Davis",
      phoneNumber: "+974-1234572",
      logoUrl: "/api/placeholder/48/48",
      status: "rejected",
    },
    {
      id: 7,
      name: "Agency 7",
      email: "agency7@gmail.com",
      registrationNumber: "115212",
      licenseExpiryDate: "2025-06-30",
      countryOfOperation: "Qatar",
      fullName: "Eva Martinez",
      phoneNumber: "+974-1234573",
      logoUrl: "/api/placeholder/48/48",
      status: "not verified",
    },
    {
      id: 8,
      name: "Agency 8",
      email: "agency8@gmail.com",
      registrationNumber: "115213",
      licenseExpiryDate: "2025-05-31",
      countryOfOperation: "Qatar",
      fullName: "Frank Garcia",
      phoneNumber: "+974-1234574",
      logoUrl: "/api/placeholder/48/48",
      status: "not verified",
    },
    {
      id: 9,
      name: "Agency 9",
      email: "agency9@gmail.com",
      registrationNumber: "115214",
      licenseExpiryDate: "2025-04-30",
      countryOfOperation: "Qatar",
      fullName: "Grace Lee",
      phoneNumber: "+974-1234575",
      logoUrl: "/api/placeholder/48/48",
      status: "review pending",
    },
  ];

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegistration = () => {
    console.log("Registration data:", registrationData);
    // Handle registration logic here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "review pending":
        return "text-orange-500";
      case "rejected":
        return "text-red-500";
      case "not verified":
        return "text-gray-500";
      case "verified":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Section - Registration and Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Card */}
        <Card className="p-6 bg-purple-50 border-purple-200">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-purple-800">
              Registration
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agency Name :
              </label>
              <Input
                name="agencyName"
                value={registrationData.agencyName}
                onChange={handleRegistrationChange}
                className="w-full"
                placeholder="Enter agency name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number :
              </label>
              <Input
                name="registrationNumber"
                value={registrationData.registrationNumber}
                onChange={handleRegistrationChange}
                className="w-full"
                placeholder="Enter registration number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Expiry Date :
              </label>
              <Input
                name="licenseExpiryDate"
                type="date"
                value={registrationData.licenseExpiryDate}
                onChange={handleRegistrationChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country of Operation :
              </label>
              <Input
                name="countryOfOperation"
                value={registrationData.countryOfOperation}
                onChange={handleRegistrationChange}
                className="w-full"
                placeholder="Enter country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name :
              </label>
              <Input
                name="fullName"
                value={registrationData.fullName}
                onChange={handleRegistrationChange}
                className="w-full"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address :
              </label>
              <Input
                name="emailAddress"
                type="email"
                value={registrationData.emailAddress}
                onChange={handleRegistrationChange}
                className="w-full"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number :
              </label>
              <Input
                name="phoneNumber"
                type="tel"
                value={registrationData.phoneNumber}
                onChange={handleRegistrationChange}
                className="w-full"
                placeholder="Enter phone number"
              />
            </div>

            <Button
              onClick={handleRegistration}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md"
            >
              Register
            </Button>
          </div>
        </Card>

        {/* Verification Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-blue-800">
              Verification
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-blue-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-blue-800">
                    Agency Name
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-blue-800">
                    Email Address
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-blue-800">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {agencies.map((agency) => (
                  <tr key={agency.id} className="hover:bg-blue-25">
                    <td className="py-2 px-3 text-sm text-gray-700">
                      {agency.name}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-700">
                      {agency.email}
                    </td>
                    <td
                      className={`py-2 px-3 text-sm font-medium ${getStatusColor(
                        agency.status
                      )}`}
                    >
                      {agency.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Bottom Section - Agency Cards Grid */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Agencies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agencies.map((agency) => (
            <div key={agency.id} className="relative">
              <AgencyCardContent
                agencyName={agency.name}
                location={`${agency.countryOfOperation} • ${agency.registrationNumber}`}
                logoUrl={agency.logoUrl}
                onClick={() => console.log(`Clicked on ${agency.name}`)}
              />
              <div className="absolute top-2 right-2">
                <span className="text-xs text-gray-400">45 minutes ago</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
