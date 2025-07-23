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
    notes?: string,
    flightTicketFile?: File
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
  const [flightTicketFile, setFlightTicketFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    date?: string;
    file?: string;
  }>({});

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  // Validation function for rescheduled status
  const validateRescheduledRequirements = () => {
    const newErrors: { date?: string; file?: string } = {};

    // Validate date
    if (!rescheduledDate) {
      newErrors.date = "Please select a new travel date";
    } else {
      const selectedDate = new Date(rescheduledDate);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      if (selectedDate < todayDate) {
        newErrors.date = "Please select a date that is today or in the future";
      }
    }

    // Validate file
    if (!flightTicketFile) {
      newErrors.file = "Please upload a new flight ticket PDF";
    } else {
      // Check file type
      if (flightTicketFile.type !== "application/pdf") {
        newErrors.file = "Please upload a PDF file only";
      }
      // Check file size (max 10MB)
      else if (flightTicketFile.size > 10 * 1024 * 1024) {
        newErrors.file = "File size must be less than 10MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if confirm button should be disabled
  const isConfirmDisabled = () => {
    if (!selectedStatus || isSubmitting) return true;

    if (selectedStatus === "RESCHEDULED") {
      return (
        !rescheduledDate || !flightTicketFile || Object.keys(errors).length > 0
      );
    }

    return false;
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;

    // Additional validation for rescheduled status
    if (
      selectedStatus === "RESCHEDULED" &&
      !validateRescheduledRequirements()
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      let finalRescheduledDate = "";
      if (selectedStatus === "RESCHEDULED") {
        // Combine date and time
        finalRescheduledDate = rescheduledTime
          ? `${rescheduledDate}T${rescheduledTime}:00.000Z`
          : `${rescheduledDate}T00:00:00.000Z`;
      }

      await onConfirm(
        selectedStatus,
        finalRescheduledDate,
        notes,
        flightTicketFile || undefined
      );
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
    setFlightTicketFile(null);
    setErrors({});
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

  // Handle date change with validation
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;

    // Clear date error immediately when user starts typing
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: undefined }));
    }

    setRescheduledDate(newDate);

    // Validate immediately with the new date
    if (selectedStatus === "RESCHEDULED") {
      // Use setTimeout to ensure state is updated before validation
      setTimeout(() => {
        const newErrors: { date?: string; file?: string } = { ...errors };

        // Validate the new date
        if (!newDate) {
          newErrors.date = "Please select a new travel date";
        } else {
          const selectedDate = new Date(newDate);
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);

          if (selectedDate < todayDate) {
            newErrors.date =
              "Please select a date that is today or in the future";
          } else {
            // Clear date error if validation passes
            delete newErrors.date;
          }
        }

        setErrors(newErrors);
      }, 0);
    }
  };

  // Handle file change with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;

    // Clear file error immediately when user selects a file
    if (errors.file) {
      setErrors((prev) => ({ ...prev, file: undefined }));
    }

    setFlightTicketFile(file);

    // Validate immediately with the new file
    if (selectedStatus === "RESCHEDULED") {
      // Use setTimeout to ensure state is updated before validation
      setTimeout(() => {
        const newErrors: { date?: string; file?: string } = { ...errors };

        // Validate the new file
        if (!file) {
          newErrors.file = "Please upload a new flight ticket PDF";
        } else {
          // Check file type
          if (file.type !== "application/pdf") {
            newErrors.file = "Please upload a PDF file only";
          }
          // Check file size (max 10MB)
          else if (file.size > 10 * 1024 * 1024) {
            newErrors.file = "File size must be less than 10MB";
          } else {
            // Clear file error if validation passes
            delete newErrors.file;
          }
        }

        setErrors(newErrors);
      }, 0);
    }
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
            onClick={() => {
              setSelectedStatus("RESCHEDULED");
              // Clear errors when switching to rescheduled status
              setErrors({});
            }}
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
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={rescheduledDate}
                  onChange={handleDateChange}
                  min={today}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
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
            {rescheduledDate && !errors.date && (
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload New Flight Ticket (PDF){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                  errors.file ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {flightTicketFile && !errors.file && (
                <div className="text-xs text-gray-600 mt-1">
                  Selected: {flightTicketFile.name} (
                  {(flightTicketFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
              {errors.file && (
                <p className="text-red-500 text-sm mt-1">{errors.file}</p>
              )}
            </div>
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
            disabled={isConfirmDisabled()}
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
