import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Calendar, Plane, X } from "lucide-react";

interface TravelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    status: "TRAVELED" | "RESCHEDULED" | "CANCELED",
    rescheduledDate?: string,
    notes?: string
  ) => void;
  labourName: string;
  currentTravelDate?: string;
}

const TravelConfirmationModal: React.FC<TravelConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  labourName,
  currentTravelDate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<
    "TRAVELED" | "RESCHEDULED" | "CANCELED" | null
  >(null);
  const [rescheduledDate, setRescheduledDate] = useState("");
  const [rescheduledTime, setRescheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  const handleConfirm = async () => {
    if (!selectedStatus) return;

    setIsSubmitting(true);
    try {
      let finalRescheduledDate = "";
      if (selectedStatus === "RESCHEDULED") {
        if (!rescheduledDate) {
          alert("Please select a new travel date");
          setIsSubmitting(false);
          return;
        }

        // Validate that the selected date is not before today
        const selectedDate = new Date(rescheduledDate);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

        if (selectedDate < todayDate) {
          alert("Please select a date that is today or in the future");
          setIsSubmitting(false);
          return;
        }

        // Combine date and time
        finalRescheduledDate = rescheduledTime
          ? `${rescheduledDate}T${rescheduledTime}:00.000Z`
          : `${rescheduledDate}T00:00:00.000Z`;
      }

      await onConfirm(selectedStatus, finalRescheduledDate, notes);
      // Show success message for rescheduled status
      if (selectedStatus === "RESCHEDULED") {
        console.log("Travel date has been rescheduled successfully");
      }
      handleClose();
    } catch (error) {
      console.error("Error confirming travel status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus(null);
    setRescheduledDate("");
    setRescheduledTime("");
    setNotes("");
    setIsSubmitting(false);
    onClose();
  };

  const formatCurrentTravelDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/am|pm/, (match) => match.toUpperCase());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Travel Confirmation - ${labourName}`}
      size="2xl"
    >
      <div className="space-y-6 mb-8">
        {/* Current Travel Date Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              Current Travel Date
            </span>
          </div>
          <p className="text-blue-800">
            {formatCurrentTravelDate(currentTravelDate)}
          </p>
        </div>

        {/* Status Selection */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Select Travel Status:</h3>

          {/* Traveled Option */}
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedStatus === "TRAVELED"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-300"
            }`}
            onClick={() => setSelectedStatus("TRAVELED")}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedStatus === "TRAVELED"
                    ? "bg-green-500 border-green-500"
                    : "border-gray-300"
                }`}
              >
                {selectedStatus === "TRAVELED" && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Traveled</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Labourer has successfully departed from their home country
                </p>
              </div>
            </div>
          </div>

          {/* Rescheduled Option */}
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedStatus === "RESCHEDULED"
                ? "border-yellow-500 bg-yellow-50"
                : "border-gray-200 hover:border-yellow-300"
            }`}
            onClick={() => setSelectedStatus("RESCHEDULED")}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedStatus === "RESCHEDULED"
                    ? "bg-yellow-500 border-yellow-500"
                    : "border-gray-300"
                }`}
              >
                {selectedStatus === "RESCHEDULED" && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">
                    Rescheduled
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Flight was rescheduled, need to update with new travel date
                </p>
              </div>
            </div>
          </div>

          {/* Canceled Option */}
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedStatus === "CANCELED"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-red-300"
            }`}
            onClick={() => setSelectedStatus("CANCELED")}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedStatus === "CANCELED"
                    ? "bg-red-500 border-red-500"
                    : "border-gray-300"
                }`}
              >
                {selectedStatus === "CANCELED" && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-900">Canceled</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Labourer cancelled and refused to come to Qatar (process will
                  restart)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rescheduled Date Input */}
        {selectedStatus === "RESCHEDULED" && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">New Travel Date:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={rescheduledDate}
                  onChange={(e) => setRescheduledDate(e.target.value)}
                  min={today}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={rescheduledTime}
                  onChange={(e) => setRescheduledTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>

            {/* Preview of new travel date */}
            {rescheduledDate && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">
                    New Travel Date Preview
                  </span>
                </div>
                <p className="text-yellow-800">
                  {formatCurrentTravelDate(
                    rescheduledTime
                      ? `${rescheduledDate}T${rescheduledTime}:00.000Z`
                      : `${rescheduledDate}T00:00:00.000Z`
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Notes Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any additional notes about the travel status..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedStatus || isSubmitting}
            className={
              selectedStatus === "TRAVELED"
                ? "bg-green-600 hover:bg-green-700"
                : selectedStatus === "RESCHEDULED"
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : selectedStatus === "CANCELED"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
            }
          >
            {isSubmitting ? "Updating..." : "Confirm Status"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TravelConfirmationModal;
