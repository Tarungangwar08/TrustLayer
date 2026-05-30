'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GraduationCap, Plus, Search, Calendar, Building, SearchX } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import CredentialCard from '@/components/credentials/CredentialCard';
import SelectiveShareModal from '@/components/credentials/SelectiveShareModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { credentialApi } from '@/lib/api';

type SortOption = 'date' | 'issuer';

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
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');

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

  const visibleCredentials = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? credentials.filter(
          (c) =>
            c.metadata.degree.toLowerCase().includes(query) ||
            c.metadata.issuerName.toLowerCase().includes(query)
        )
      : credentials;

    return [...filtered].sort((a, b) => {
      if (sortBy === 'issuer') {
        return a.metadata.issuerName.localeCompare(b.metadata.issuerName);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [credentials, search, sortBy]);

  return (
    <AppLayout>
      <div className="animate-fade-in flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">My Credentials</h1>
            {!isLoading && credentials.length > 0 && (
              <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                {credentials.length}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => router.push('/credentials/issue')}
          >
            <Plus className="size-4" />
            Issue New
          </Button>
        </div>

        {!isLoading && credentials.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by degree or issuer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 transition-shadow focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => setSortBy('date')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors duration-150',
                  sortBy === 'date'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                <Calendar className="size-4" />
                Date
              </button>
              <button
                type="button"
                onClick={() => setSortBy('issuer')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors duration-150',
                  sortBy === 'issuer'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                <Building className="size-4" />
                Issuer
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        ) : credentials.length === 0 ? (
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
        ) : visibleCredentials.length === 0 ? (
          <div className="animate-fade-in flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-gray-100">
              <SearchX className="size-8 text-gray-400" />
            </span>
            <div>
              <p className="font-medium text-gray-900">No matches found</p>
              <p className="mt-0.5 text-sm text-gray-500">
                Try a different degree or issuer name
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSearch('')}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleCredentials.map((cred) => (
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
