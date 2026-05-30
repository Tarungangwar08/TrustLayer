'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  LayoutDashboard,
  Award,
  PlusCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ProtectedRoute from '@/components/ProtectedRoute';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/credentials', label: 'My Credentials', icon: Award },
  { href: '/credentials/issue', label: 'Issue New', icon: PlusCircle },
] as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header
          className={cn(
            'sticky top-0 z-40 border-b border-gray-200 bg-white transition-shadow duration-[250ms]',
            scrolled && 'shadow-md'
          )}
        >
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600">
                  <Shield className="size-4 text-white" />
                </span>
                <span className="font-semibold tracking-tight">TrustLayer</span>
              </Link>
              <nav className="hidden items-center gap-1 sm:flex">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150',
                      pathname === href
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              {/* Avatar dropdown */}
              {user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex size-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white transition-transform duration-150 hover:scale-105"
                    aria-label="Account menu"
                  >
                    {getInitials(user.name)}
                  </button>

                  {dropdownOpen && (
                    <>
                      <button
                        type="button"
                        aria-label="Close menu"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="animate-scale-in absolute right-0 z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                        <div className="border-b border-gray-100 px-4 py-3">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-gray-500">{user.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <LogOut className="size-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Mobile hamburger */}
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={() => setMenuOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile slide-in drawer */}
        {menuOpen && (
          <div className="sm:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
              className="animate-fade-in fixed inset-0 z-40 bg-black/40"
            />
            <div className="animate-slide-in fixed inset-y-0 right-0 z-50 flex w-64 flex-col bg-white shadow-md">
              <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
                <span className="font-semibold tracking-tight">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="size-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-1 p-3">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                      pathname === href
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        <main className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
