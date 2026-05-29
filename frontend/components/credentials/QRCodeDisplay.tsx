'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <QRCodeSVG value={url} size={size} />
      </div>
      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
        {copied ? (
          <>
            <Check className="size-4 text-green-600" />
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
