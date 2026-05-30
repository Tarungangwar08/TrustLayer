'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GraduationCap, Plus, ArrowRight, Shield, Award, FileCheck } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import CredentialCard from '@/components/credentials/CredentialCard';
import SelectiveShareModal from '@/components/credentials/SelectiveShareModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { credentialApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Credential {
  id: string;
  metadata: {
    degree: string;
    issuerName: string;
    issuedAt: string;
    fieldCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCredentials() {
      try {
        const response = await credentialApi.getAll();
        const { credentials: creds } = response.data.data as {
          credentials: Credential[];
        };
        setCredentials(creds);
      } catch {
        toast.error('Failed to load credentials');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCredentials();
  }, []);

  const recent = credentials.slice(0, 3);

  return (
    <AppLayout>
      <div className="animate-fade-in flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {getGreeting()}
            {user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-sm text-gray-500">Here&apos;s an overview of your credentials</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="transition-all duration-[250ms] hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                <Award className="size-5 text-indigo-600" />
              </span>
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <div>
                  <p className="text-3xl font-semibold leading-none text-gray-900">
                    {credentials.length}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">Total Credentials</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="transition-all duration-[250ms] hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <Shield className="size-5 text-green-600" />
              </span>
              <div className="flex flex-col gap-1">
                <Badge
                  variant="outline"
                  className="w-fit gap-1 border-green-200 bg-green-50 text-green-700"
                >
                  <FileCheck className="size-3" />
                  All Signed
                </Badge>
                <p className="text-sm text-gray-500">EdDSA Verified</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent credentials */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent Credentials</h2>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="animate-fade-in flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-indigo-50">
                <GraduationCap className="size-8 text-indigo-300" />
              </span>
              <div>
                <p className="font-medium text-gray-900">No credentials yet</p>
                <p className="mt-0.5 text-sm text-gray-500">
                  Issue your first credential to start sharing securely
                </p>
              </div>
              <Button
                size="sm"
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => router.push('/credentials/issue')}
              >
                <Plus className="size-4" />
                Issue First Credential
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.map((cred) => (
                <CredentialCard
                  key={cred.id}
                  id={cred.id}
                  metadata={cred.metadata}
                  createdAt={cred.createdAt}
                  onShare={(id) => setSelectedId(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        {!isLoading && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1 gap-1.5 bg-indigo-600 transition-all duration-150 hover:bg-indigo-700 hover:shadow-md"
              onClick={() => router.push('/credentials/issue')}
            >
              <Plus className="size-4" />
              Issue New Credential
            </Button>
            <Button
              variant="outline"
              className="group flex-1 gap-1.5 transition-colors duration-150"
              onClick={() => router.push('/credentials')}
            >
              View All
              <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Button>
          </div>
        )}
      </div>

      <SelectiveShareModal
        credentialId={selectedId ?? ''}
        isOpen={!!selectedId}
        onClose={() => setSelectedId(null)}
      />
    </AppLayout>
  );
}
