import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Lead, LeadPayload } from '../types/database';
import { getPreviewAuthToken } from './authService';

function getAuthHeaders(): HeadersInit {
  const token = getPreviewAuthToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export async function createLead(payload: LeadPayload): Promise<void> {
  if (!payload.lgpd_consent) {
    throw new Error('É necessário concordar com o aviso de privacidade (LGPD) para enviar.');
  }

  const record = {
    vehicle_id: payload.vehicle_id || null,
    vehicle_title: payload.vehicle_title.trim(),
    full_name: payload.full_name.trim(),
    phone: payload.phone.trim(),
    message: (payload.message || '').trim(),
    lgpd_consent: true,
    contacted: false,
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('leads').insert([record]);
    if (error) {
      throw new Error(error.message || 'Não foi possível registrar seu interesse no momento.');
    }
    return;
  }

  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'Não foi possível registrar seu interesse.');
  }
}

export async function listLeads(): Promise<Lead[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Não foi possível carregar os clientes interessados.');
    }
    return (data || []) as Lead[];
  }

  const response = await fetch('/api/leads', {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Não foi possível carregar a lista de interessados.');
  }
  return (await response.json()) as Lead[];
}

export async function toggleLeadContacted(id: string, contacted: boolean): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('leads')
      .update({ contacted })
      .eq('id', id);

    if (error) {
      throw new Error('Erro ao atualizar status do atendimento.');
    }
    return;
  }

  const response = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ contacted }),
  });
  if (!response.ok) {
    throw new Error('Erro ao atualizar status do atendimento.');
  }
}

export async function deleteLead(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      throw new Error('Erro ao excluir registro de interessado.');
    }
    return;
  }

  const response = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Erro ao excluir registro de interessado.');
  }
}
