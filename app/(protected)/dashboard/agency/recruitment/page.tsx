"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  X,
  Clock,
} from "lucide-react";

interface Labour {
  id: string;
  name: string;
  role: string;
  nationality: string;
  passportNumber: string;
  passportVerified: boolean;
  visaNumber: string;
  visaVerified: boolean;
  medicalStatus: "pending" | "approved" | "rejected";
  contractStatus: "unsigned" | "signed" | "verified";
  status: "pending" | "under review" | "approved" | "rejected";
  updatedAt: string;
}

interface JobRole {
  id: string;
  title: string;
  labours: Labour[];
}

interface Order {
  id: string;
  company: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
  jobRoles: JobRole[];
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    "under review": "bg-blue-100 text-blue-800",
    "review pending": "bg-yellow-100 text-yellow-800",
    "not verified": "bg-gray-100 text-gray-800",
    verified: "bg-green-100 text-green-800",
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full ${statusColors[status as keyof typeof statusColors]}`}
    >
      {status}
    </span>
  );
};

const StatusDropdown = ({
  currentStatus,
  onStatusChange,
}: {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}) => {
  const statusOptions = ["pending", "under review", "approved", "rejected"];

  return (
    <select
      value={currentStatus}
      onChange={(e) => onStatusChange(e.target.value)}
      className={`text-xs px-2 py-1 rounded-full ${
        currentStatus === "approved"
          ? "bg-green-100 text-green-800"
          : currentStatus === "rejected"
            ? "bg-red-100 text-red-800"
            : currentStatus === "under review"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {statusOptions.map((status) => (
        <option key={status} value={status} className="bg-white text-gray-900">
          {status}
        </option>
      ))}
    </select>
  );
};

const LabourCard = ({
  labour,
  onStatusChange,
}: {
  labour: Labour;
  onStatusChange: (newStatus: string) => void;
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5D5F1] p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-[#150B3D]">{labour.name}</h3>
          <p className="text-sm text-[#150B3D]/70">
            {labour.role} • {labour.nationality}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusDropdown
            currentStatus={labour.status}
            onStatusChange={onStatusChange}
          />
          <button className="text-[#150B3D]/30 hover:text-[#150B3D]">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div className="bg-[#F9F3FC] p-2 rounded-lg">
          <p className="text-[#150B3D]/70 text-xs">Passport</p>
          <div className="flex items-center gap-1 text-[#150B3D]">
            {labour.passportVerified ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-red-600" />
            )}
            <span className="text-xs">{labour.passportNumber}</span>
          </div>
        </div>

        <div className="bg-[#F9F3FC] p-2 rounded-lg">
          <p className="text-[#150B3D]/70 text-xs">Visa</p>
          <div className="flex items-center gap-1 text-[#150B3D]">
            {labour.visaVerified ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-red-600" />
            )}
            <span className="text-xs">{labour.visaNumber}</span>
          </div>
        </div>

        <div className="bg-[#F9F3FC] p-2 rounded-lg">
          <p className="text-[#150B3D]/70 text-xs">Medical</p>
          <div className="flex items-center gap-1 text-[#150B3D]">
            {labour.medicalStatus === "approved" ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : labour.medicalStatus === "rejected" ? (
              <X className="w-3 h-3 text-red-600" />
            ) : (
              <Clock className="w-3 h-3 text-yellow-600" />
            )}
            <span className="text-xs capitalize">{labour.medicalStatus}</span>
          </div>
        </div>

        <div className="bg-[#F9F3FC] p-2 rounded-lg">
          <p className="text-[#150B3D]/70 text-xs">Contract</p>
          <div className="flex items-center gap-1 text-[#150B3D]">
            {labour.contractStatus === "verified" ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : labour.contractStatus === "signed" ? (
              <Clock className="w-3 h-3 text-blue-600" />
            ) : (
              <X className="w-3 h-3 text-red-600" />
            )}
            <span className="text-xs capitalize">{labour.contractStatus}</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-[#150B3D]/50">
        Updated: {new Date(labour.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default function RecruitmentTracking() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedJobRoleId, setSelectedJobRoleId] = useState<string | null>(
    null
  );
  const [orders, setOrders] = useState<Order[]>([]);

  // Initialize with mock data
  useMemo(() => {
    const generateLabours = (count: number): Labour[] =>
      Array.from({ length: count }, (_, i) => ({
        id: `labour-${i + 1}-${Date.now()}`,
        name: `Labour ${i + 1}`,
        role: ["Electrician", "Plumber", "Welder", "Carpenter"][i % 4],
        nationality: ["Indian", "Mexican", "Filipino", "Nepalese"][i % 4],
        passportNumber: `P${Math.floor(100000 + Math.random() * 900000)}`,
        passportVerified: Math.random() > 0.3,
        visaNumber: `V${Math.floor(100000 + Math.random() * 900000)}`,
        visaVerified: Math.random() > 0.4,
        medicalStatus: ["pending", "approved", "rejected"][
          Math.floor(Math.random() * 3)
        ] as any,
        contractStatus: ["unsigned", "signed", "verified"][
          Math.floor(Math.random() * 3)
        ] as any,
        status: ["pending", "under review", "approved", "rejected"][
          Math.floor(Math.random() * 4)
        ] as any,
        updatedAt: new Date().toISOString(),
      }));

    const generateJobRoles = (orderId: string, count: number): JobRole[] =>
      Array.from({ length: count }, (_, i) => ({
        id: `${orderId}-jr-${i + 1}-${Date.now()}`,
        title: [
          "Electrical Team",
          "Plumbing Team",
          "Welding Team",
          "Construction Team",
        ][i % 4],
        labours: generateLabours(3 + Math.floor(Math.random() * 5)),
      }));

    const mockOrders: Order[] = Array.from({ length: 8 }, (_, i) => {
      const orderId = `ORD-${1000 + i}`;
      return {
        id: orderId,
        company: `Company ${i + 1}`,
        status: ["pending", "processing", "completed", "cancelled"][
          Math.floor(Math.random() * 4)
        ] as any,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        jobRoles: generateJobRoles(orderId, 2 + Math.floor(Math.random() * 3)),
      };
    });

    setOrders(mockOrders);
  }, []);

  // Memoize selected data
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId),
    [selectedOrderId, orders]
  );

  const selectedJobRole = useMemo(
    () => selectedOrder?.jobRoles.find((jr) => jr.id === selectedJobRoleId),
    [selectedOrder, selectedJobRoleId]
  );

  // Handle order selection
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (order && order.jobRoles.length > 0) {
      setSelectedJobRoleId(order.jobRoles[0].id);
    } else {
      setSelectedJobRoleId(null);
    }
  };

  // Handle job role selection
  const handleJobRoleSelect = (jobRoleId: string) => {
    setSelectedJobRoleId(jobRoleId);
  };

  // Update labour status
  const updateLabourStatus = (labourId: string, newStatus: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => ({
        ...order,
        jobRoles: order.jobRoles.map((jobRole) => ({
          ...jobRole,
          labours: jobRole.labours.map((labour) =>
            labour.id === labourId
              ? {
                  ...labour,
                  status: newStatus as any,
                  updatedAt: new Date().toISOString(),
                }
              : labour
          ),
        })),
      }))
    );
  };

  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      {/* Left Sidebar - Orders (1/4 width) */}
      <div className="w-1/4 border-r border-[#E5D5F1] bg-white overflow-y-auto">
        <div className="p-4 border-b border-[#E5D5F1] sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-lg text-[#150B3D]">
            Recruitment Orders
          </h2>
        </div>
        <div className="divide-y divide-[#E5D5F1]">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => handleOrderSelect(order.id)}
              className={`p-4 cursor-pointer hover:bg-[#EDDDF3]/30 ${
                selectedOrderId === order.id
                  ? "bg-[#EDDDF3]/50 border-l-4 border-[#150B3D]"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-[#150B3D]">{order.id}</h3>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-sm text-[#150B3D]/70">{order.company}</p>
              <p className="text-xs text-[#150B3D]/50 mt-1">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>

              {/* Show job roles for selected order */}
              {selectedOrderId === order.id && (
                <div className="mt-2 ml-2 space-y-1">
                  {order.jobRoles.map((jobRole) => (
                    <div
                      key={jobRole.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobRoleSelect(jobRole.id);
                      }}
                      className={`p-2 text-sm rounded ${
                        selectedJobRoleId === jobRole.id
                          ? "bg-[#EDDDF3] text-[#150B3D]"
                          : "hover:bg-[#EDDDF3]/30"
                      }`}
                    >
                      {jobRole.title} ({jobRole.labours.length})
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content (3/4 width) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedOrder && selectedJobRole ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[#E5D5F1] bg-white sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-[#150B3D]">
                    {selectedOrder.company} - {selectedJobRole.title}
                  </h2>
                  <p className="text-sm text-[#150B3D]/70">
                    Order: {selectedOrder.id} • Created:{" "}
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!selectedOrder) return;
                      const currentIndex = selectedOrder.jobRoles.findIndex(
                        (jr) => jr.id === selectedJobRoleId
                      );
                      const prevIndex = currentIndex - 1;
                      if (prevIndex >= 0) {
                        handleJobRoleSelect(
                          selectedOrder.jobRoles[prevIndex].id
                        );
                      }
                    }}
                    disabled={
                      selectedOrder.jobRoles.findIndex(
                        (jr) => jr.id === selectedJobRoleId
                      ) === 0
                    }
                    className="p-2 rounded-full hover:bg-[#EDDDF3]/30 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#150B3D]" />
                  </button>
                  <span className="text-sm text-[#150B3D]/70">
                    {selectedOrder.jobRoles.findIndex(
                      (jr) => jr.id === selectedJobRoleId
                    ) + 1}{" "}
                    / {selectedOrder.jobRoles.length}
                  </span>
                  <button
                    onClick={() => {
                      if (!selectedOrder) return;
                      const currentIndex = selectedOrder.jobRoles.findIndex(
                        (jr) => jr.id === selectedJobRoleId
                      );
                      const nextIndex = currentIndex + 1;
                      if (nextIndex < selectedOrder.jobRoles.length) {
                        handleJobRoleSelect(
                          selectedOrder.jobRoles[nextIndex].id
                        );
                      }
                    }}
                    disabled={
                      selectedOrder.jobRoles.findIndex(
                        (jr) => jr.id === selectedJobRoleId
                      ) ===
                      selectedOrder.jobRoles.length - 1
                    }
                    className="p-2 rounded-full hover:bg-[#EDDDF3]/30 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5 text-[#150B3D]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Labour Cards Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F5F5F5]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {selectedJobRole.labours.map((labour) => (
                  <LabourCard
                    key={labour.id}
                    labour={labour}
                    onStatusChange={(newStatus) =>
                      updateLabourStatus(labour.id, newStatus)
                    }
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#F5F5F5]">
            <div className="text-center p-6 max-w-md">
              <h3 className="text-lg font-medium text-[#150B3D] mb-2">
                No order selected
              </h3>
              <p className="text-[#150B3D]/70">
                Select an order from the sidebar to view recruitment details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
