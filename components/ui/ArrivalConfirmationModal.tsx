import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";

interface ArrivalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: "ARRIVED", notes?: string) => void;
  labourName: string;
}

const ArrivalConfirmationModal: React.FC<ArrivalConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  labourName,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<"ARRIVED" | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedStatus) return;

    setIsSubmitting(true);
    try {
      await onConfirm(selectedStatus, notes);
      handleClose();
    } catch (error) {
      console.error("Error confirming arrival status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus(null);
    setNotes("");
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Arrival Confirmation - ${labourName}`}
      size="2xl"
    >
      <div className="space-y-6 mb-8">
        {/* Status Selection */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Confirm Labour Arrival:</h3>

          {/* Arrived Option */}
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedStatus === "ARRIVED"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-300"
            }`}
            onClick={() => setSelectedStatus("ARRIVED")}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedStatus === "ARRIVED"
                    ? "bg-green-500 border-green-500"
                    : "border-gray-300"
                }`}
              >
                {selectedStatus === "ARRIVED" && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Arrived</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Labourer has successfully arrived in Qatar and is ready to
                  start work
                </p>
              </div>
            </div>
          </div>
        </div>

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
            placeholder="Add any additional notes about the arrival status..."
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
              selectedStatus === "ARRIVED"
                ? "bg-green-600 hover:bg-green-700"
                : selectedStatus === "NOT_ARRIVED"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
            }
          >
            {isSubmitting ? "Confirming..." : "Confirm Status"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ArrivalConfirmationModal;
