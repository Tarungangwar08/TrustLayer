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

function validate(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): string | null {
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
    return 'Password must contain uppercase, lowercase and a number';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
}

interface PasswordStrength {
  score: number;
  label: string;
  barClass: string;
  textClass: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return { score, label: 'Weak', barClass: 'bg-red-500', textClass: 'text-red-600' };
  }
  if (score <= 3) {
    return { score, label: 'Medium', barClass: 'bg-amber-500', textClass: 'text-amber-600' };
  }
  return { score, label: 'Strong', barClass: 'bg-green-600', textClass: 'text-green-600' };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationError = validate(name, email, password, confirmPassword);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Registration failed');
      } else {
        toast.error('Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-8">
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
          <CardTitle>Create account</CardTitle>
          <CardDescription>Sign up to start sharing credentials securely</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Rahul Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="name"
                className="transition-shadow focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30"
              />
            </div>

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
                placeholder="Min 8 chars, uppercase + number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="new-password"
                className="transition-shadow focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30"
              />
              {password.length > 0 && (
                <div className="animate-fade-in mt-1 flex flex-col gap-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          (strength.label === 'Weak' && i < 1) ||
                          (strength.label === 'Medium' && i < 2) ||
                          (strength.label === 'Strong' && i < 3)
                            ? strength.barClass
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${strength.textClass}`}>
                    {strength.label} password
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="new-password"
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
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
