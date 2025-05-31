// components/shared/Cards/AgencyCardContent.tsx;
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
      <CardContent className="p-0 flex items-start gap-8">
        {/* Logo */}
        <div className="relative h-15 w-15 rounded-full overflow-hidden">
          <Image src={logoUrl} alt="Agency Logo" fill />
        </div>
        {/* Info */}
        <div className="flex-1">
          <h4 className="text-sm font-medium text-[#150B3D] leading-tight">
            {agencyName}
          </h4>
          <p className="text-[12px] text-[#524B6B] mt-[2px] leading-snug">
            {email}
          </p>
          <p className="text-[12px] text-[#524B6B] mt-[2px] leading-snug">
            {registerNo}
          </p>
          <p className="text-[12px] text-[#524B6B] mt-[2px] leading-snug">
            {location}
          </p>
          <p className="text-[11px] text-[#AAA6B9] mt-1 leading-snug">
            {time} minutes ago
          </p>
        </div>
        {/* Menu Icon */}
        <div className="mt-0.5">
          <MoreVertical size={20} className="text-black hover:text-gray-600" />
        </div>
      </CardContent>
    </Card>
  );
}
