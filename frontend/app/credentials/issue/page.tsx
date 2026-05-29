'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Lock, Loader2, Info } from 'lucide-react';
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

const FORM_FIELDS: Array<{
  key: keyof CredentialFormData;
  label: string;
  placeholder: string;
  type: string;
}> = [
  { key: 'name', label: 'Full Name', placeholder: 'Rahul Kumar', type: 'text' },
  { key: 'degree', label: 'Degree', placeholder: 'B.Tech CS', type: 'text' },
  { key: 'graduationYear', label: 'Graduation Year', placeholder: '2024', type: 'text' },
  { key: 'cgpa', label: 'CGPA', placeholder: '8.5', type: 'text' },
  { key: 'marks', label: 'Marks / Grade', placeholder: '850/1000', type: 'text' },
  { key: 'issuerName', label: 'Issuer Name', placeholder: 'IIT Delhi', type: 'text' },
  { key: 'issueDate', label: 'Issue Date', placeholder: '', type: 'date' },
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
      setTimeout(() => router.push('/credentials'), 1500);
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Failed to issue credential');
      } else {
        toast.error('Failed to issue credential');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/credentials')}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Issue New Credential</h1>
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-start gap-2 p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-blue-600" />
            <p className="text-sm text-blue-700">
              Your credential will be signed using EdDSA. Choose which fields to share
              with verifiers later.
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {FORM_FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type={type}
                placeholder={placeholder}
                value={formData[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          ))}

          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <Lock className="size-4" />
                Issue & Sign Credential
              </>
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
