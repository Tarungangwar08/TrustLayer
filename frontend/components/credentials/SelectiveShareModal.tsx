'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  User,
  GraduationCap,
  Calendar,
  Star,
  FileText,
  Building,
  Clock,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { credentialApi } from '@/lib/api';
import QRCodeDisplay from './QRCodeDisplay';

interface SelectiveShareModalProps {
  credentialId: string;
  isOpen: boolean;
  onClose: () => void;
}

const FIELD_DEFS = [
  { key: 'name' as const, label: 'Full Name', icon: User },
  { key: 'degree' as const, label: 'Degree', icon: GraduationCap },
  { key: 'graduationYear' as const, label: 'Graduation Year', icon: Calendar },
  { key: 'cgpa' as const, label: 'CGPA', icon: Star },
  { key: 'marks' as const, label: 'Marks / Grade', icon: FileText },
  { key: 'issuerName' as const, label: 'Issuer Name', icon: Building },
  { key: 'issueDate' as const, label: 'Issue Date', icon: Clock },
];

type FieldKey = (typeof FIELD_DEFS)[number]['key'];

const EXPIRY_OPTIONS = [
  { hours: 1, label: '1 Hour' },
  { hours: 6, label: '6 Hours' },
  { hours: 24, label: '24 Hours' },
  { hours: 168, label: '7 Days' },
] as const;

interface ShareResult {
  shareToken: string;
  shareUrl: string;
  expiresAt: string;
}

export default function SelectiveShareModal({
  credentialId,
  isOpen,
  onClose,
}: SelectiveShareModalProps) {
  const [step, setStep] = useState(1);
  const [selectedFields, setSelectedFields] = useState<FieldKey[]>([]);
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [isLoading, setIsLoading] = useState(false);
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);

  function handleClose() {
    setStep(1);
    setSelectedFields([]);
    setExpiryHours(24);
    setIsLoading(false);
    setShareResult(null);
    onClose();
  }

  function toggleField(key: FieldKey, checked: boolean) {
    setSelectedFields((prev) =>
      checked ? [...prev, key] : prev.filter((k) => k !== key)
    );
  }

  async function handleGenerate() {
    setIsLoading(true);
    try {
      const response = await credentialApi.share({
        credentialId,
        selectedFields,
        expiryHours,
      });
      const result = response.data.data as ShareResult;
      setShareResult(result);
      setStep(3);
    } catch {
      toast.error('Failed to generate presentation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function resetToStep1() {
    setStep(1);
    setSelectedFields([]);
    setExpiryHours(24);
    setShareResult(null);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isLoading}>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={cn(
                'h-1.5 rounded-full transition-all duration-[250ms]',
                s === step ? 'w-6 bg-indigo-600' : s < step ? 'w-2 bg-indigo-300' : 'w-2 bg-gray-200'
              )}
            />
          ))}
        </div>
        <p className="-mt-2 text-center text-xs font-medium text-gray-400">Step {step} of 3</p>

        {step === 1 && (
          <div className="animate-slide-in flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Select Fields to Share</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              {FIELD_DEFS.map(({ key, label, icon: Icon }) => {
                const isSelected = selectedFields.includes(key);
                return (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors duration-150',
                      isSelected ? 'border-green-200 bg-green-50/50' : 'border-gray-200'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn('size-4', isSelected ? 'text-green-600' : 'text-gray-500')} />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'gap-1 text-xs',
                          isSelected
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-gray-100 text-gray-500'
                        )}
                      >
                        {isSelected ? (
                          <>
                            <Eye className="size-3" />
                            Revealed
                          </>
                        ) : (
                          <>
                            <EyeOff className="size-3" />
                            Hidden
                          </>
                        )}
                      </Badge>
                      <Switch
                        checked={isSelected}
                        onCheckedChange={(checked: boolean) => toggleField(key, checked)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm text-gray-500">
                <span
                  key={selectedFields.length}
                  className="animate-pop inline-block font-semibold text-indigo-600"
                >
                  {selectedFields.length}
                </span>{' '}
                of 7 fields selected
              </span>
              <Button
                size="sm"
                className="gap-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setStep(2)}
                disabled={selectedFields.length === 0}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-in flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Set Link Expiry</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-2">
              {EXPIRY_OPTIONS.map(({ hours, label }) => {
                const isActive = expiryHours === hours;
                return (
                  <button
                    key={hours}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setExpiryHours(hours)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-gray-50'
                    )}
                  >
                    <Clock className={cn('size-4', isActive ? 'text-indigo-600' : 'text-gray-400')} />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating cryptographic proof...
                  </>
                ) : (
                  'Generate Secure Presentation'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && shareResult && (
          <div className="animate-slide-in flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Ready to Share</DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
              <ShieldCheck className="animate-pop size-4 shrink-0" />
              <span>Cryptographic proof generated</span>
            </div>

            <QRCodeDisplay url={shareResult.shareUrl} />

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="size-4 shrink-0" />
              <span>
                Expires:{' '}
                {new Date(shareResult.expiresAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {FIELD_DEFS.map(({ key, label }) => {
                const isShared = selectedFields.includes(key);
                return (
                  <span
                    key={key}
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      isShared
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-400 line-through'
                    )}
                  >
                    {label}
                  </span>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <Button variant="outline" size="sm" onClick={resetToStep1}>
                Share Another
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
