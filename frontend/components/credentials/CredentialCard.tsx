import { GraduationCap, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CredentialCardProps {
  id: string;
  metadata: {
    degree: string;
    issuerName: string;
    issuedAt: string;
    fieldCount: number;
  };
  createdAt: string;
  onShare: (id: string) => void;
}

export default function CredentialCard({
  id,
  metadata,
  createdAt,
  onShare,
}: CredentialCardProps) {
  const dateSource = metadata.issuedAt || createdAt;
  const issueDate = new Date(dateSource).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="border border-gray-200">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-50">
            <GraduationCap className="size-5 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-gray-900">{metadata.degree}</p>
            <p className="truncate text-sm text-gray-500">{metadata.issuerName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <span>Issued {issueDate}</span>
          <Badge
            variant="outline"
            className="gap-1 border-green-200 bg-green-50 text-green-700"
          >
            <ShieldCheck className="size-3" />
            Cryptographically Signed
          </Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onShare(id)}
        >
          Share Selectively
        </Button>
      </CardContent>
    </Card>
  );
}
