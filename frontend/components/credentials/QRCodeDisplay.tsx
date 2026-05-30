'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

export default function QRCodeDisplay({ url, size = 160 }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <QRCodeSVG value={url} size={size} />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className={cn(
          'gap-1.5 transition-colors duration-150',
          copied && 'border-green-200 bg-green-50 text-green-700'
        )}
      >
        {copied ? (
          <>
            <Check className="animate-pop size-4 text-green-600" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="size-4" />
            Copy Link
          </>
        )}
      </Button>
      <p className="max-w-xs truncate font-mono text-xs text-gray-500">{url}</p>
    </div>
  );
}
