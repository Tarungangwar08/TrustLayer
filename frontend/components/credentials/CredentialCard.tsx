import { GraduationCap, ShieldCheck, Building, Calendar, Share2 } from 'lucide-react';
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

function getRelativeTime(dateString: string): string {
  const then = new Date(dateString).getTime();
  if (Number.isNaN(then)) return '';
  const diffDays = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Created today';
  if (diffDays === 1) return 'Created 1 day ago';
  if (diffDays < 30) return `Created ${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return 'Created 1 month ago';
  if (diffMonths < 12) return `Created ${diffMonths} months ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? 'Created 1 year ago' : `Created ${diffYears} years ago`;
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
  const relativeTime = getRelativeTime(createdAt);

  return (
    <Card className="group border border-gray-200 transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50">
            <GraduationCap className="size-5 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-gray-900">{metadata.degree}</p>
            <p className="flex items-center gap-1 truncate text-sm text-gray-500">
              <Building className="size-3.5 shrink-0" />
              {metadata.issuerName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            Issued {issueDate}
          </span>
          <Badge
            variant="outline"
            className="gap-1 border-green-200 bg-green-50 text-green-700"
          >
            <ShieldCheck className="size-3 animate-pulse" />
            Cryptographically Signed
          </Badge>
        </div>

        {relativeTime && <p className="text-xs text-gray-400">{relativeTime}</p>}

        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 transition-colors duration-150 group-hover:border-indigo-300 group-hover:bg-indigo-50 group-hover:text-indigo-700"
          onClick={() => onShare(id)}
        >
          <Share2 className="size-4" />
          Share Selectively
        </Button>
      </CardContent>
    </Card>
  );
}
