// components/shared/Cards/CompanyCardContent.tsx;
import Image from "next/image";
import { Card, CardContent } from "@/components/shared/Card";

interface CompanyCardContentProps {
  companyName: string;
  logoUrl: string;
  onClick?: () => void;
}

export default function CompanyCardContent({
  companyName,
  logoUrl,
  onClick,
}: CompanyCardContentProps) {
  return (
    <Card variant="company" className="cursor-pointer" onClick={onClick}>
      <CardContent className="p-0 flex items-center gap-4">
        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-white">
          <Image src={logoUrl} alt="Company Logo" fill />
        </div>
        <div>
          <h4 className="text-lg font-medium text-white">{companyName}</h4>
          <p className="text-sm text-white/70">View company details</p>
        </div>
      </CardContent>
    </Card>
  );
}
