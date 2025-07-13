import React from "react";
import { Modal } from "@/components/ui/Modal";

interface Document {
  name: string;
  url: string;
  type: "visa" | "offer-letter" | "contract" | "other";
  uploadedAt?: string;
}

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  labourName: string;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  documents,
  labourName,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Documents - ${labourName}`}
      size="2xl"
    >
      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{doc.name}</h4>
                  <p className="text-sm text-gray-500">{doc.type}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                  >
                    View
                  </a>
                  <a
                    href={doc.url}
                    download
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DocumentViewerModal;
