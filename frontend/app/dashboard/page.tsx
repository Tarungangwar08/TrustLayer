'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GraduationCap, Plus, ArrowRight } from 'lucide-react';
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
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-900">{credentials.length}</p>
                  <p className="text-sm text-gray-500">Total Credentials</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-1 p-4">
              <Badge
                variant="outline"
                className="w-fit border-green-200 bg-green-50 text-green-700"
              >
                All Signed
              </Badge>
              <p className="text-sm text-gray-500">EdDSA Verified</p>
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
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 py-12 text-center">
              <GraduationCap className="size-10 text-gray-300" />
              <p className="text-gray-500">No credentials yet</p>
              <Button size="sm" onClick={() => router.push('/credentials/issue')}>
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
              className="flex-1 gap-1.5"
              onClick={() => router.push('/credentials/issue')}
            >
              <Plus className="size-4" />
              Issue New Credential
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => router.push('/credentials')}
            >
              View All
              <ArrowRight className="size-4" />
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
