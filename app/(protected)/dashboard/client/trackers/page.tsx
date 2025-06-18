"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";

interface Labour {
  id: number;
  name: string;
  role: string;
  nationality: string;
  status: "pending" | "rejected" | "approved" | "completed";
}

interface JobRole {
  id: string;
  title: string;
  labours: Labour[];
}

interface Order {
  id: string;
  jobRoles: JobRole[];
  status: "pending" | "processing" | "completed";
  timeAgo: string;
}
export default function Tracker() {
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [currentJobRoleIndex, setCurrentJobRoleIndex] = useState(0);

  // Generate mock labours
  const generateLabours = (count: number): Labour[] =>
    Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Labour ${i + 1}`,
      role: ["Electrician", "Plumber", "Welder", "Carpenter"][i % 4],
      nationality: ["Mexican", "Indian", "Filipino", "Brazilian"][i % 4],
      status: ["pending", "rejected", "approved", "completed"][
        i % 4
      ] as Labour["status"],
    }));

  // Generate mock job roles
  const generateJobRoles = (orderId: string, count: number): JobRole[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `${orderId}-JR${i + 1}`,
      title: `${["Electrical", "Plumbing", "HVAC", "Construction"][i % 4]} Team`,
      labours: generateLabours(5 + (i % 3)),
    }));

  // Mock orders data
  const orders: Order[] = [
    {
      id: "RQX9812",
      status: "pending",
      timeAgo: "5 min ago",
      jobRoles: generateJobRoles("RQX9812", 3),
    },
    {
      id: "RQX9813",
      status: "processing",
      timeAgo: "2 hours ago",
      jobRoles: generateJobRoles("RQX9813", 2),
    },
    {
      id: "RQX9814",
      status: "completed",
      timeAgo: "1 day ago",
      jobRoles: generateJobRoles("RQX9814", 4),
    },
  ];

  const currentOrder = orders[selectedOrderIndex];
  const currentJobRole = currentOrder?.jobRoles[currentJobRoleIndex];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-[#C86300]";
      case "rejected":
        return "text-[#ED1C24]";
      case "approved":
      case "completed":
        return "text-[#00C853]";
      case "processing":
        return "text-[#150B3D]/70";
      default:
        return "text-[#150B3D]/70";
    }
  };

  const handlePrevJobRole = () => {
    if (currentJobRoleIndex > 0)
      setCurrentJobRoleIndex(currentJobRoleIndex - 1);
  };

  const handleNextJobRole = () => {
    if (currentJobRoleIndex < currentOrder.jobRoles.length - 1)
      setCurrentJobRoleIndex(currentJobRoleIndex + 1);
  };

  const handleOrderSelect = (index: number) => {
    setSelectedOrderIndex(index);
    setCurrentJobRoleIndex(0);
  };
  return (
    <div className="px-6 flex gap-6 h-screen">
      {/* Left Sidebar - Order IDs (1/6 width) */}
      <div className="w-1/6 rounded-lg p-4 overflow-y-auto">
        <div className="space-y-2">
          {orders.map((order, index) => (
            <div
              key={order.id}
              onClick={() => handleOrderSelect(index)}
              className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
                selectedOrderIndex === index
                  ? "bg-[#EDDDF3] border-l-[#150B3D]"
                  : "bg-gray-50 hover:bg-[#EDDDF3]/50 border-l-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-[#150B3D]">Order {order.id}</h3>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className={`text-xs ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className="text-xs text-[#150B3D]/50">
                  • {order.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content - Job Role Details (5/6 width) */}
      <div className="w-5/6 rounded-lg p-6 overflow-y-auto">
        {currentOrder && currentJobRole ? (
          <>
            {/* Job Role Header */}
            <div className="flex justify-between items-center mb-6 bg-[#EDDDF3]/50 p-4 rounded-2xl">
              <h2 className="text-xl font-semibold text-[#150B3D]">
                {currentJobRole.title}
              </h2>

              {/* Job Role Navigation */}
              {currentOrder.jobRoles.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevJobRole}
                    disabled={currentJobRoleIndex === 0}
                    className={`p-2 rounded-full ${
                      currentJobRoleIndex === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-[#150B3D] text-white hover:bg-[#150B3D]/80"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-sm text-[#150B3D]/70 px-2">
                    {currentJobRoleIndex + 1} of {currentOrder.jobRoles.length}
                  </span>

                  <button
                    onClick={handleNextJobRole}
                    disabled={
                      currentJobRoleIndex === currentOrder.jobRoles.length - 1
                    }
                    className={`p-2 rounded-full ${
                      currentJobRoleIndex === currentOrder.jobRoles.length - 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-[#150B3D] text-white hover:bg-[#150B3D]/80"
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Square Labour Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentJobRole.labours.map((labour) => (
                <div
                  key={labour.id}
                  className="bg-[#EDDDF3] rounded-lg p-6 relative h-48 flex flex-col justify-between"
                >
                  <div className="absolute top-2 right-2">
                    <MoreVertical className="w-4 h-4 text-[#150B3D]/50" />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-[#150B3D]/70 text-xs font-medium">
                        Name
                      </p>
                      <p className="text-[#150B3D] font-medium truncate">
                        {labour.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#150B3D]/70 text-xs font-medium">
                        Role
                      </p>
                      <p className="text-[#150B3D] truncate">{labour.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-[#150B3D]/70 text-xs font-medium">
                        Nationality
                      </p>
                      <p className="text-[#150B3D] truncate">
                        {labour.nationality}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-[#150B3D]/70 text-xs font-medium">
                        Status
                      </p>
                      <span
                        className={`${getStatusColor(labour.status)} text-xs`}
                      >
                        {labour.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#150B3D]/50">No job roles available</p>
          </div>
        )}
      </div>
    </div>
  );
}
