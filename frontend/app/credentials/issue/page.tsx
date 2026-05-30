'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Lock,
  Loader2,
  Info,
  User,
  GraduationCap,
  Calendar,
  Star,
  FileText,
  Building,
  Clock,
  Check,
  CheckCircle2,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { credentialApi, type CredentialFormData } from '@/lib/api';
import axios from 'axios';

interface ApiErrorResponse {
  error: { message: string };
}

interface FormField {
  key: keyof CredentialFormData;
  label: string;
  placeholder: string;
  type: string;
  icon: LucideIcon;
  isValid: (value: string) => boolean;
}

interface FormSection {
  title: string;
  fields: FormField[];
}

const notEmpty = (v: string) => v.trim().length > 0;

const FORM_SECTIONS: FormSection[] = [
  {
    title: 'Personal Info',
    fields: [
      { key: 'name', label: 'Full Name', placeholder: 'Rahul Kumar', type: 'text', icon: User, isValid: notEmpty },
    ],
  },
  {
    title: 'Credential Details',
    fields: [
      { key: 'degree', label: 'Degree', placeholder: 'B.Tech CS', type: 'text', icon: GraduationCap, isValid: notEmpty },
      { key: 'graduationYear', label: 'Graduation Year', placeholder: '2024', type: 'text', icon: Calendar, isValid: (v) => /^\d{4}$/.test(v) },
      { key: 'cgpa', label: 'CGPA', placeholder: '8.5', type: 'text', icon: Star, isValid: (v) => /^\d+(\.\d{1,2})?$/.test(v) },
      { key: 'marks', label: 'Marks / Grade', placeholder: '850/1000', type: 'text', icon: FileText, isValid: notEmpty },
    ],
  },
  {
    title: 'Issuer Info',
    fields: [
      { key: 'issuerName', label: 'Issuer Name', placeholder: 'IIT Delhi', type: 'text', icon: Building, isValid: notEmpty },
      { key: 'issueDate', label: 'Issue Date', placeholder: '', type: 'date', icon: Clock, isValid: notEmpty },
    ],
  },
];

export default function IssuePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CredentialFormData>({
    name: '',
    degree: '',
    graduationYear: '',
    cgpa: '',
    marks: '',
    issuerName: '',
    issueDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleChange(field: keyof CredentialFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const hasEmpty = Object.values(formData).some((v) => !v.trim());
    if (hasEmpty) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await credentialApi.issue(formData);
      toast.success('Credential issued!');
      setIsSuccess(true);
      setTimeout(() => router.push('/credentials'), 1500);
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Failed to issue credential');
      } else {
        toast.error('Failed to issue credential');
      }
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <AppLayout>
        <div className="animate-fade-in flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="animate-pop size-12 text-green-600" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Credential Issued</h1>
            <p className="mt-1 text-sm text-gray-500">
              Cryptographically signed. Redirecting to your credentials…
            </p>
          </div>
          <Loader2 className="size-5 animate-spin text-indigo-600" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in mx-auto flex max-w-lg flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/credentials')}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Issue New Credential</h1>
        </div>

        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="flex items-start gap-2 p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-indigo-600" />
            <p className="text-sm text-indigo-700">
              Your credential will be signed using EdDSA. Choose which fields to share
              with verifiers later.
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-24 sm:pb-0">
          {FORM_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {section.title}
              </h2>
              <div className="flex flex-col gap-4">
                {section.fields.map(({ key, label, placeholder, type, icon: Icon, isValid }) => {
                  const value = formData[key];
                  const showValid = value.trim().length > 0 && isValid(value);
                  return (
                    <div key={key} className="flex flex-col gap-1.5">
                      <Label htmlFor={key}>{label}</Label>
                      <div className="relative">
                        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id={key}
                          type={type}
                          placeholder={placeholder}
                          value={value}
                          onChange={(e) => handleChange(key, e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="pl-9 pr-9 transition-shadow focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30"
                        />
                        {showValid && (
                          <Check className="animate-fade-in absolute right-3 top-1/2 size-4 -translate-y-1/2 text-green-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white p-4 sm:static sm:border-0 sm:bg-transparent sm:p-0">
            <Button
              type="submit"
              className="mx-auto w-full max-w-lg bg-indigo-600 transition-all duration-150 hover:bg-indigo-700 hover:shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  Issue &amp; Sign Credential
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
