// components/shared/Cards/CompanyCardContent.tsx;
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
  return (
    <Card
      variant="company"
      className="cursor-pointer border rounded-lg hover:shadow-sm transition-all"
      onClick={onClick}
    >
      <CardContent className="p-0 flex items-start gap-8">
        {/* Logo */}
        <div className="relative h-15 w-15 rounded-full overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-gray-500">
                {companyName.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="text-sm font-medium text-[#150B3D] leading-tight">
            {companyName}
          </h4>
          <p className="text-[12px] text-[#524B6B] mt-[2px] leading-snug">
            {email}
          </p>
          <p className="text-[12px] text-[#524B6B] mt-[2px] leading-snug">
            {phoneNo}
          </p>
          {noSub?.trim() && (
            <p className="text-[11px] text-[#AAA6B9] mt-1 leading-snug">
              Total Submissions: {noSub}
            </p>
          )}
        </div>

        {/* Menu Icon */}
        <div className="mt-0.5">
          <MoreVertical size={20} className="text-black hover:text-gray-600" />
        </div>
      </CardContent>
    </Card>
  );
}
