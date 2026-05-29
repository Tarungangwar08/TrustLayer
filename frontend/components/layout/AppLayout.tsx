'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, LayoutDashboard, Award, PlusCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ProtectedRoute from '@/components/ProtectedRoute';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/credentials', label: 'My Credentials', icon: Award },
  { href: '/credentials/issue', label: 'Issue New', icon: PlusCircle },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Shield className="size-5 text-indigo-600" />
                <span className="font-semibold tracking-tight">TrustLayer</span>
              </Link>
              <nav className="hidden sm:flex items-center gap-1">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      pathname === href
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <span className="hidden text-sm text-gray-600 sm:block">{user.name}</span>
              )}
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="size-4" />
                <span className="ml-1 hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-200 bg-white sm:hidden">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
                pathname === href ? 'text-indigo-600' : 'text-gray-500'
              )}
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pb-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
