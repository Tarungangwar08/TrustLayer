'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import type { LucideIcon } from 'lucide-react';
import {
  Shield,
  ShieldCheck,
  ShieldX,
  CheckCircle,
  XCircle,
  User,
  GraduationCap,
  Calendar,
  Star,
  FileText,
  Building,
  Clock,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { credentialApi } from '@/lib/api';

interface VerificationChecks {
  signatureValid: boolean;
  fieldsIntact: boolean;
  merkleValid: boolean;
  notExpired: boolean;
}

interface DisclosedField {
  value: string;
  verified: boolean;
}

interface VerificationResult {
  valid: boolean;
  checks: VerificationChecks;
  disclosedFields: Record<string, DisclosedField>;
  issuerName: string;
  issuedAt: string;
  expiresAt: string;
  hiddenFieldCount: number;
  presentationId: string;
}

const FIELD_META: Record<string, { label: string; icon: LucideIcon }> = {
  name: { label: 'Full Name', icon: User },
  degree: { label: 'Degree', icon: GraduationCap },
  graduationYear: { label: 'Graduation Year', icon: Calendar },
  cgpa: { label: 'CGPA', icon: Star },
  marks: { label: 'Marks / Grade', icon: FileText },
  issuerName: { label: 'Issuer Name', icon: Building },
  issueDate: { label: 'Issue Date', icon: Clock },
};

const CHECK_DEFS: { key: keyof VerificationChecks; label: string }[] = [
  { key: 'signatureValid', label: 'Signature Valid' },
  { key: 'fieldsIntact', label: 'Fields Intact' },
  { key: 'merkleValid', label: 'Merkle Proof Valid' },
  { key: 'notExpired', label: 'Not Expired' },
];

export default function VerifierPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? '';

  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function verify() {
      try {
        const response = await credentialApi.verify(token);
        const data = response.data.data as VerificationResult;
        setResult(data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFound(true);
        } else {
          setFetchError(true);
        }
      } finally {
        setIsLoading(false);
      }
    }

    verify();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <Shield className="size-16 animate-pulse text-indigo-600" />
        <p className="text-base font-medium text-gray-700">
          Verifying cryptographic proof...
        </p>
        <Loader2 className="size-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <Shield className="size-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900">Presentation Not Found</h1>
        <p className="text-gray-500">This link is invalid or has expired</p>
        <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  if (fetchError || !result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <ShieldX className="size-16 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
        <p className="text-gray-500">
          This presentation could not be verified. Please try again.
        </p>
        <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  const {
    valid,
    checks,
    disclosedFields,
    issuerName,
    issuedAt,
    expiresAt,
    hiddenFieldCount,
    presentationId,
  } = result;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      {/* Branding */}
      <div className="mb-6 flex justify-center">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-indigo-600" />
          <span className="font-semibold tracking-tight text-gray-900">TrustLayer</span>
        </div>
      </div>

      <div className="mx-auto max-w-[600px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="flex flex-col gap-6 p-6">

          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            {valid ? (
              <ShieldCheck className="size-16 text-green-500" />
            ) : (
              <ShieldX className="size-16 text-red-500" />
            )}
            <h1 className={`text-2xl font-bold ${valid ? 'text-gray-900' : 'text-red-700'}`}>
              {valid ? 'Cryptographically Verified' : 'Verification Failed'}
            </h1>
            <p className="text-sm text-gray-500">
              {valid
                ? 'This credential has been verified'
                : 'This presentation could not be verified'}
            </p>
          </div>

          {/* Verification check badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {CHECK_DEFS.map(({ key, label }) => {
              const passed = checks[key];
              return (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    passed
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {passed ? (
                    <CheckCircle className="size-3.5" />
                  ) : (
                    <XCircle className="size-3.5" />
                  )}
                  {label}
                </span>
              );
            })}
          </div>

          {/* Failed reason card */}
          {!valid && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="mb-1.5 font-medium">Failed checks:</p>
              <ul className="list-inside list-disc space-y-0.5">
                {CHECK_DEFS.filter(({ key }) => !checks[key]).map(({ key, label }) => (
                  <li key={key}>{label}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-red-600">
                The link may be expired, revoked, or tampered with.
              </p>
            </div>
          )}

          {/* Disclosed fields */}
          {Object.keys(disclosedFields).length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-gray-700">Verified Fields</h2>
              <div className="flex flex-col gap-2">
                {Object.entries(disclosedFields).map(([fieldName, { value, verified }]) => {
                  const meta = FIELD_META[fieldName];
                  const Icon = meta?.icon ?? FileText;
                  const label = meta?.label ?? fieldName;
                  return (
                    <div
                      key={fieldName}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="size-4 shrink-0 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className="font-semibold text-gray-900">{value}</p>
                        </div>
                      </div>
                      {verified && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle className="size-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hidden fields */}
          {hiddenFieldCount > 0 && (
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-3">
              <EyeOff className="size-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {hiddenFieldCount} field{hiddenFieldCount !== 1 ? 's' : ''}{' '}
                  not disclosed
                </p>
                <p className="text-xs text-gray-500">
                  The holder chose to keep these private
                </p>
              </div>
            </div>
          )}

          {/* Credential info */}
          <div className="flex flex-col gap-1.5 rounded-lg bg-gray-50 px-4 py-3 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Issued by</span>
              <span className="font-medium text-gray-900">{issuerName}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Issue Date</span>
              <span className="font-medium text-gray-900">{issuedAt}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Presentation Expires</span>
              <span className="font-medium text-gray-900">
                {new Date(expiresAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          </div>

          {/* Collapsible crypto details */}
          <details className="group">
            <summary className="cursor-pointer select-none text-xs font-medium text-gray-500 hover:text-gray-700">
              Technical Details ▼
            </summary>
            <div className="mt-2 flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-xs text-gray-600">
              <div className="flex justify-between gap-4">
                <span className="shrink-0 text-gray-500">Presentation ID</span>
                <span className="truncate text-right text-gray-800">{presentationId}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="shrink-0 text-gray-500">Algorithm</span>
                <span className="text-gray-800">EdDSA (Ed25519)</span>
              </div>
            </div>
          </details>

        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-1 border-t border-gray-100 py-4 text-center">
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Shield className="size-4 text-indigo-600" />
            Verified by TrustLayer
          </div>
          <p className="text-xs text-gray-400">
            Cryptographic proof · Merkle Tree · EdDSA
          </p>
        </div>
      </div>
    </div>
  );
}
