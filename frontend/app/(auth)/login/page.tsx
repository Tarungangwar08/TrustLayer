'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface ApiErrorResponse {
  error: { message: string };
}

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Login failed');
      } else {
        toast.error('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white px-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_60%_at_50%_0%,theme(colors.indigo.100),transparent)]" />

      <div className="animate-fade-in-up mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-600 shadow-md">
            <Shield className="size-6 text-white" />
          </span>
          <span className="text-3xl font-semibold tracking-tight text-gray-900">TrustLayer</span>
        </div>
        <p className="text-sm text-gray-500">Secure credential sharing made simple</p>
      </div>

      <Card className="animate-scale-in w-full max-w-sm shadow-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className="transition-shadow focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="transition-shadow focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30"
              />
            </div>

            <Button
              type="submit"
              className="mt-2 w-full bg-indigo-600 transition-all duration-150 hover:scale-[1.02] hover:bg-indigo-700 hover:shadow-md active:scale-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
