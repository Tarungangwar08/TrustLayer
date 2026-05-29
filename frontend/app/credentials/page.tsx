'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GraduationCap, Plus } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import CredentialCard from '@/components/credentials/CredentialCard';
import SelectiveShareModal from '@/components/credentials/SelectiveShareModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { credentialApi } from '@/lib/api';

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

export default function CredentialsPage() {
  const router = useRouter();
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

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Credentials</h1>
          <Button size="sm" onClick={() => router.push('/credentials/issue')}>
            <Plus className="size-4" />
            Issue New
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        ) : credentials.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 py-12 text-center">
            <GraduationCap className="size-10 text-gray-300" />
            <p className="text-gray-500">No credentials yet</p>
            <Button size="sm" onClick={() => router.push('/credentials/issue')}>
              Issue First Credential
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {credentials.map((cred) => (
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

      <SelectiveShareModal
        credentialId={selectedId ?? ''}
        isOpen={!!selectedId}
        onClose={() => setSelectedId(null)}
      />
    </AppLayout>
  );
}
