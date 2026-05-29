export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function removeToken(): void {
  localStorage.removeItem('auth_token');
}

export function setUser(user: AuthUser): void {
  localStorage.setItem('auth_user', JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  const stored = localStorage.getItem('auth_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

export function removeUser(): void {
  localStorage.removeItem('auth_user');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
