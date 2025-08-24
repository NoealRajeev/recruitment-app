import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/shared/Card";
import { MoreVertical } from "lucide-react";

interface CompanyCardContentProps {
  companyName: string;
  logoUrl?: string;
  email: string;
  phoneNo: string;
  noSub: string;
  onClick?: () => void;

  /** New: actions for the kebab menu */
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDocuments?: () => void;
}

export default function CompanyCardContent({
  companyName,
  logoUrl,
  email,
  phoneNo,
  noSub,
  onClick,
  onEdit,
  onDelete,
  onViewDocuments,
}: CompanyCardContentProps) {
  const initial = (companyName || "?").charAt(0).toUpperCase();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <Card
      variant="company"
      className="cursor-pointer border rounded-lg hover:shadow-sm transition-all"
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-start gap-4">
        {/* Logo */}
        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${companyName} logo`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-base font-bold text-gray-500">
                {initial}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-[#150B3D] leading-tight truncate">
            {companyName}
          </h4>
          <p className="text-[12px] text-[#524B6B] mt-[2px] leading-snug truncate">
            {email}
          </p>
          <p className="text-[12px] text-[#524B6B] mt-[2px] leading-snug truncate">
            {phoneNo}
          </p>
          {noSub?.trim() && (
            <p className="text-[11px] text-[#AAA6B9] mt-1 leading-snug">
              Total Submissions: {noSub}
            </p>
          )}
        </div>

        {/* Actions menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // don’t trigger card onClick
              setOpen((s) => !s);
            }}
            className="mt-0.5 rounded-md p-1 text-black/70 hover:bg-gray-100"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Company actions"
          >
            <MoreVertical size={18} />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-44 rounded-md border bg-white shadow-md z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                role="menuitem"
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => {
                  setOpen(false);
                  onViewDocuments?.();
                }}
              >
                View documents
              </button>
              <button
                role="menuitem"
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => {
                  setOpen(false);
                  onEdit?.();
                }}
              >
                Edit company
              </button>
              <button
                role="menuitem"
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  setOpen(false);
                  onDelete?.();
                }}
              >
                Delete company
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
