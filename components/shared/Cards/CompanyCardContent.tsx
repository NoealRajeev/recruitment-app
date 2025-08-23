import Image from "next/image";
import { Card, CardContent } from "@/components/shared/Card";
import { MoreVertical } from "lucide-react";

interface CompanyCardContentProps {
  companyName: string;
  logoUrl?: string;
  email: string;
  phoneNo: string;
  noSub: string;
  onClick?: () => void;
}

export default function CompanyCardContent({
  companyName,
  logoUrl,
  email,
  phoneNo,
  noSub,
  onClick,
}: CompanyCardContentProps) {
  const initial = (companyName || "?").charAt(0).toUpperCase();

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

        {/* Menu Icon (decorative) */}
        <div className="mt-0.5 text-black/70" aria-hidden>
          <MoreVertical size={18} />
        </div>
      </CardContent>
    </Card>
  );
}
