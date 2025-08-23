import Image from "next/image";
import { Card, CardContent } from "@/components/shared/Card";
import { MoreVertical } from "lucide-react";

interface AgencyCardContentProps {
  agencyName: string;
  location: string;
  email: string;
  registerNo: string;
  time: string;
  logoUrl: string;
  onClick?: () => void;
}

export default function AgencyCardContent({
  agencyName,
  location,
  email,
  registerNo,
  time,
  logoUrl,
  onClick,
}: AgencyCardContentProps) {
  return (
    <Card variant="agency" className="cursor-pointer" onClick={onClick}>
      <CardContent className="p-4 flex items-start gap-4">
        {/* Logo */}
        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
          <Image
            src={logoUrl}
            alt={`${agencyName} logo`}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-[#150B3D] leading-tight truncate">
            {agencyName}
          </h4>
          <p className="text-[12px] text-[#524B6B] mt-[2px] leading-snug truncate">
            {email}
          </p>
          <p className="text-[12px] text-[#524B6B] mt-[2px] leading-snug truncate">
            {registerNo}
          </p>
          <p className="text-[12px] text-[#524B6B] mt-[2px] leading-snug truncate">
            {location}
          </p>
          <p className="text-[11px] text-[#AAA6B9] mt-1 leading-snug">{time}</p>
        </div>

        {/* Menu Icon (decorative) */}
        <div className="mt-0.5 text-gray-500" aria-hidden>
          <MoreVertical size={18} />
        </div>
      </CardContent>
    </Card>
  );
}
