import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { AdminUser } from '../types/database';

const PREVIEW_TOKEN_KEY = 'as_auto_dreams_preview_token';
const PREVIEW_USER_KEY = 'as_auto_dreams_preview_user';

export function getPreviewAuthToken(): string | null {
  try {
    return sessionStorage.getItem(PREVIEW_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function signInAdmin(email: string, password: string): Promise<AdminUser> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !data.user) {
      throw new Error(error?.message || 'E-mail ou senha inválidos.');
    }
    return {
      id: data.user.id,
      email: data.user.email || email,
    };
  }

  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Falha ao autenticar no painel administrativo.');
  }

  try {
    sessionStorage.setItem(PREVIEW_TOKEN_KEY, payload.token);
    sessionStorage.setItem(PREVIEW_USER_KEY, JSON.stringify(payload.user));
  } catch {
    // Ignore storage quota errors
  }

  return payload.user as AdminUser;
}

export async function signOutAdmin(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
    return;
  }

  const token = getPreviewAuthToken();
  try {
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } finally {
    try {
      sessionStorage.removeItem(PREVIEW_TOKEN_KEY);
      sessionStorage.removeItem(PREVIEW_USER_KEY);
    } catch {
      // Ignore
    }
  }
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) {
      return null;
    }
    return {
      id: data.session.user.id,
      email: data.session.user.email || '',
    };
  }

  const token = getPreviewAuthToken();
  if (!token) return null;

  try {
    const response = await fetch('/api/admin/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      sessionStorage.removeItem(PREVIEW_TOKEN_KEY);
      sessionStorage.removeItem(PREVIEW_USER_KEY);
      return null;
    }
    const payload = await response.json();
    return payload.user as AdminUser;
  } catch {
    return null;
  }
}
