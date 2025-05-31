// app/(protected)/dashboard/admin/labour/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MoreVertical } from "lucide-react";

interface Agency {
  id: number;
  name: string;
  minAgo: number;
  status: "review pending" | "rejected" | "not verified" | "verified";
}

interface Labour {
  id: number;
  name: string;
  role: string;
  nationality: string;
  cv: string;
  profileImage: string;
  status: "review pending" | "rejected" | "not verified" | "verified";
}

export default function LabourProfile() {
  const [selectedAgency, setSelectedAgency] = useState<number>(1);

  // Mock data for agencies
  const agencies: Agency[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Agency ${i + 1}`,
    minAgo: i === 0 ? 6 : i === 3 ? 8 : i < 3 ? 0 : 1,
    status:
      i % 4 === 0
        ? "review pending"
        : i % 4 === 1
        ? "rejected"
        : i % 4 === 2
        ? "not verified"
        : "verified",
  }));

  // Mock data for labours
  const labours: Labour[] = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: `Labour ${i + 1}`,
    role: i % 3 === 0 ? "Electrician" : i % 3 === 1 ? "Plumber" : "Carpenter",
    nationality: i % 2 === 0 ? "Indian" : "Bangladeshi",
    cv: "cv.pdf",
    profileImage: "https://randomuser.me/api/portraits/men/" + (i + 1) + ".jpg",
    status:
      i % 4 === 0
        ? "review pending"
        : i % 4 === 1
        ? "rejected"
        : i % 4 === 2
        ? "not verified"
        : "verified",
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "review pending":
        return "text-[#C86300]";
      case "rejected":
        return "text-[#ED1C24]";
      case "not verified":
        return "text-[#150B3D]/70";
      case "verified":
        return "text-[#00C853]";
      default:
        return "text-[#150B3D]/70";
    }
  };

  const handleAccept = (id: number) => {
    console.log(`Accepted labour ${id}`);
    // Handle accept logic here
  };

  const handleReject = (id: number) => {
    console.log(`Rejected labour ${id}`);
    // Handle reject logic here
  };

  const LabourCard = ({ labour }: { labour: Labour }) => (
    <div className="bg-[#EDDDF3] rounded-lg p-6 relative mt-14">
      <div className="absolute top-4 right-4">
        <MoreVertical className="w-4 h-4 text-[#150B3D]/50" />
      </div>

      <div className="flex justify-center mb-3 -mt-16">
        <div className="w-26 h-26 rounded-full overflow-auto bg-gray-200">
          <img
            src={labour.profileImage}
            alt={labour.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[#150B3D]/70 font-medium">Name:</span>
          <span className="text-[#150B3D]">{labour.name}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#150B3D]/70 font-medium">Role:</span>
          <span className="text-[#150B3D]">{labour.role}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#150B3D]/70 font-medium">Nationality:</span>
          <span className="text-[#150B3D]">{labour.nationality}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#150B3D]/70 font-medium">Status:</span>
          <span className={`${getStatusColor(labour.status)} text-xs`}>
            {labour.status}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#150B3D]/70 font-medium">CV:</span>
          <button className="text-[#150B3D]/50 hover:text-[#150B3D] text-xs underline">
            cv.pdf 📄
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          onClick={() => handleAccept(labour.id)}
          className="flex-1 bg-[#150B3D] hover:bg-[#150B3D]/80 text-white text-xs py-2 px-3 rounded-lg"
        >
          Accept
        </Button>
        <Button
          onClick={() => handleReject(labour.id)}
          className="flex-1 bg-[#ED1C24] hover:bg-[#ED1C24]/80 text-white text-xs py-2 px-3 rounded-lg"
        >
          Reject
        </Button>
      </div>
    </div>
  );

  return (
    <div className="px-6 flex gap-6">
      {/* Left Sidebar - Agencies (1/4 width) */}
      <div className="w-1/6 rounded-lg overflow-y-auto">
        <div className="space-y-2">
          {agencies.map((agency) => (
            <div
              key={agency.id}
              onClick={() => setSelectedAgency(agency.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
                selectedAgency === agency.id
                  ? "bg-[#EDDDF3] border-l-[#150B3D]"
                  : "bg-gray-50 hover:bg-[#EDDDF3]/50 border-l-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-[#150B3D]">{agency.name}</h3>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className={`text-xs ${getStatusColor(agency.status)}`}>
                  {agency.status}
                </span>
                <span className="text-xs text-[#150B3D]/50">
                  • {agency.minAgo} min{agency.minAgo !== 1 ? "s" : ""} ago
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content - Labour Details (3/4 width) */}
      <div className="w-5/6 rounded-lg overflow-y-auto">
        {selectedAgency ? (
          <>
            {/* Agency Header */}
            <div className="flex justify-between items-center mb-6 bg-[#EDDDF3]/50 p-4 rounded-2xl">
              <h2 className="text-xl font-semibold text-[#150B3D]">
                Labours from{" "}
                {agencies.find((a) => a.id === selectedAgency)?.name}
              </h2>
            </div>

            {/* Labour Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {labours.map((labour) => (
                <LabourCard key={labour.id} labour={labour} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#150B3D]/50">
              Select an agency to view labours
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
