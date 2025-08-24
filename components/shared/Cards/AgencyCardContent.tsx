import Image from "next/image";
import { Card, CardContent } from "@/components/shared/Card";
import { MoreVertical, Pencil, FileText, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";

interface AgencyCardContentProps {
  agencyName: string;
  location: string;
  email: string;
  registerNo: string;
  time: string;
  logoUrl?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onOpenDocs?: () => void;
  onDelete?: () => void;
}

export default function AgencyCardContent({
  agencyName,
  location,
  email,
  registerNo,
  time,
  logoUrl,
  onClick,
  onEdit,
  onOpenDocs,
  onDelete,
}: AgencyCardContentProps) {
  const initial = (agencyName || "?").charAt(0).toUpperCase();
  return (
    <Card variant="agency" className="cursor-pointer" onClick={onClick}>
      <CardContent className="p-4 flex items-start gap-4">
        {/* Logo */}
        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${agencyName} logo`}
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="mt-0.5 text-gray-600 hover:text-gray-900"
            >
              <MoreVertical size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[180px]"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenDocs}>
              <FileText className="h-4 w-4 mr-2" /> Documents
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
