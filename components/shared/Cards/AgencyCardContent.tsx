// components/shared/Cards/AgencyCardContent.tsx;
import Image from "next/image";
import { Card, CardContent } from "@/components/shared/Card";

interface AgencyCardContentProps {
  agencyName: string;
  location: string;
  logoUrl: string;
  onClick?: () => void;
}

export default function AgencyCardContent({
  agencyName,
  location,
  logoUrl,
  onClick,
}: AgencyCardContentProps) {
  return (
    <Card variant="agency" className="cursor-pointer" onClick={onClick}>
      <CardContent className="p-0 flex items-center gap-4">
        <div className="relative h-12 w-12 rounded-full overflow-hidden">
          <Image src={logoUrl} alt="Agency Logo" fill />
        </div>
        <div>
          <h4 className="text-lg font-medium">{agencyName}</h4>
          <p className="text-sm text-muted-foreground">{location}</p>
        </div>
      </CardContent>
    </Card>
  );
}
