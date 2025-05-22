// components/shared/Cards/RequestCardContent.tsx;
import { Card, CardContent } from "@/components/shared/Card";

interface RequestCardContentProps {
  title: string;
  description: string;
  onClick?: () => void;
}

export default function RequestCardContent({
  title,
  description,
  onClick,
}: RequestCardContentProps) {
  return (
    <Card variant="request" className="cursor-pointer" onClick={onClick}>
      <CardContent className="p-0 space-y-2">
        <h4 className="text-lg font-medium text-white">{title}</h4>
        <p className="text-sm text-white/70">{description}</p>
      </CardContent>
    </Card>
  );
}
