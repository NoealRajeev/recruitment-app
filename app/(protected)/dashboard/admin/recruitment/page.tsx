// app/(protected)/dashboard/admin/recruitment/page.tsx
"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";

interface Labour {
  id: number;
  name: string;
  role: string;
  nationality: string;
  status: "review pending" | "rejected" | "not verified" | "verified";
}

interface Order {
  id: string;
  labours: Labour[];
}

interface Company {
  id: number;
  name: string;
  status: "review pending" | "rejected" | "not verified" | "verified";
  timeAgo: string;
  orders: Order[];
}

export default function Recruitment() {
  const [selectedCompany, setSelectedCompany] = useState<number>(1);
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number>(0);

  // Generate mock data more efficiently
  const generateLabours = (startId: number, count: number): Labour[] =>
    Array(count)
      .fill(null)
      .map((_, index) => ({
        id: startId + index,
        name: `Labour ${startId + index}`,
        role: "Electrician",
        nationality: "Mexican",
        status: "review pending",
      }));

  const generateOrders = (
    prefix: string,
    count: number,
    labourCount: number
  ): Order[] =>
    Array(count)
      .fill(null)
      .map((_, i) => ({
        id: `${prefix}${9812 + i}`,
        labours: generateLabours(i * labourCount + 1, labourCount),
      }));

  // Optimized mock data
  const companies: Company[] = [
    {
      id: 1,
      name: "Company 1",
      status: "review pending",
      timeAgo: "5 min ago",
      orders: generateOrders("RQX", 8, 5),
    },
    {
      id: 2,
      name: "Company 2",
      status: "review pending",
      timeAgo: "10 min ago",
      orders: generateOrders("RQX", 1, 5),
    },
    {
      id: 3,
      name: "Company 1",
      status: "review pending",
      timeAgo: "5 min ago",
      orders: generateOrders("RQX", 8, 5),
    },
    {
      id: 4,
      name: "Company 2",
      status: "review pending",
      timeAgo: "10 min ago",
      orders: generateOrders("RQX", 1, 5),
    },
    {
      id: 5,
      name: "Company 1",
      status: "review pending",
      timeAgo: "5 min ago",
      orders: generateOrders("RQX", 8, 5),
    },
    {
      id: 6,
      name: "Company 2",
      status: "review pending",
      timeAgo: "10 min ago",
      orders: generateOrders("RQX", 1, 5),
    },
    {
      id: 7,
      name: "Company 1",
      status: "review pending",
      timeAgo: "5 min ago",
      orders: generateOrders("RQX", 8, 5),
    },
    {
      id: 8,
      name: "Company 2",
      status: "review pending",
      timeAgo: "10 min ago",
      orders: generateOrders("RQX", 1, 5),
    },
  ];

  // Memoize selected company data
  const selectedCompanyData = useMemo(
    () => companies.find((c) => c.id === selectedCompany),
    [selectedCompany, companies]
  );

  // Memoize current order
  const currentOrder = useMemo(
    () => selectedCompanyData?.orders[currentOrderIndex],
    [selectedCompanyData, currentOrderIndex]
  );

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

  const handlePreviousOrder = () => {
    if (currentOrderIndex > 0) {
      setCurrentOrderIndex(currentOrderIndex - 1);
    }
  };

  const handleNextOrder = () => {
    if (
      selectedCompanyData &&
      currentOrderIndex < selectedCompanyData.orders.length - 1
    ) {
      setCurrentOrderIndex(currentOrderIndex + 1);
    }
  };

  const handleCompanySelect = (companyId: number) => {
    setSelectedCompany(companyId);
    setCurrentOrderIndex(0);
  };

  const LabourCard = ({ labour }: { labour: Labour }) => (
    <div className="bg-[#EDDDF3] rounded-lg p-8 relative">
      <div className="absolute top-2 right-2">
        <MoreVertical className="w-4 h-4 text-[#150B3D]/50" />
      </div>

      <div className="space-y-2 text-sm">
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
      </div>
    </div>
  );

  // Group labours into rows of 4
  const labourRows = useMemo(() => {
    if (!currentOrder) return [];
    const rows = [];
    for (let i = 0; i < currentOrder.labours.length; i += 4) {
      rows.push(currentOrder.labours.slice(i, i + 4));
    }
    return rows;
  }, [currentOrder]);

  return (
    <div className="px-6 flex gap-6 h-screen">
      {/* Left Sidebar - Companies (1/6 width) */}
      <div className="w-1/6 rounded-lg p-4 overflow-y-auto">
        <div className="space-y-2">
          {companies.map((company) => (
            <div
              key={company.id}
              onClick={() => handleCompanySelect(company.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
                selectedCompany === company.id
                  ? "bg-[#EDDDF3] border-l-[#150B3D]"
                  : "bg-gray-50 hover:bg-[#EDDDF3]/50 border-l-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-[#150B3D]">{company.name}</h3>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className={`text-xs ${getStatusColor(company.status)}`}>
                  {company.status}
                </span>
                <span className="text-xs text-[#150B3D]/50">
                  • {company.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content - Order Details (5/6 width) */}
      <div className="w-5/6 rounded-lg p-6 overflow-y-auto">
        {selectedCompanyData && currentOrder ? (
          <>
            {/* Order Header */}
            <div className="flex justify-between items-center mb-6 bg-[#EDDDF3]/50 p-4 rounded-2xl">
              <h2 className="text-xl font-semibold text-[#150B3D]">
                Order ID: {currentOrder.id}
              </h2>

              {/* Navigation Arrows */}
              {selectedCompanyData.orders.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousOrder}
                    disabled={currentOrderIndex === 0}
                    className={`p-2 rounded-full ${
                      currentOrderIndex === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-[#150B3D] text-white hover:bg-[#150B3D]/80"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-sm text-[#150B3D]/70 px-2">
                    {currentOrderIndex + 1} of{" "}
                    {selectedCompanyData.orders.length}
                  </span>

                  <button
                    onClick={handleNextOrder}
                    disabled={
                      currentOrderIndex ===
                      selectedCompanyData.orders.length - 1
                    }
                    className={`p-2 rounded-full ${
                      currentOrderIndex ===
                      selectedCompanyData.orders.length - 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-[#150B3D] text-white hover:bg-[#150B3D]/80"
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Labour Cards Grid */}
            <div className="space-y-4">
              {labourRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {row.map((labour) => (
                    <LabourCard key={labour.id} labour={labour} />
                  ))}
                  {/* Fill empty slots if needed */}
                  {row.length < 4 &&
                    Array(4 - row.length)
                      .fill(0)
                      .map((_, i) => (
                        <div key={`empty-${i}`} className="h-0" />
                      ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#150B3D]/50">Select a company to view orders</p>
          </div>
        )}
      </div>
    </div>
  );
}
