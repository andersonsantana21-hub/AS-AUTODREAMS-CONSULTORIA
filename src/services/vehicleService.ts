import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Vehicle, VehiclePayload, VehicleStatus } from '../types/database';
import { getPreviewAuthToken } from './authService';

function normalizeVehicle(raw: Record<string, unknown>): Vehicle {
  return {
    id: String(raw.id),
    brand: String(raw.brand || ''),
    model: String(raw.model || ''),
    version: String(raw.version || ''),
    manufacture_year: Number(raw.manufacture_year || new Date().getFullYear()),
    model_year: Number(raw.model_year || new Date().getFullYear()),
    mileage: Number(raw.mileage || 0),
    transmission: String(raw.transmission || 'Automático'),
    engine: String(raw.engine || ''),
    fuel: String(raw.fuel || 'Flex'),
    color: String(raw.color || ''),
    price: Number(raw.price || 0),
    fipe_price: raw.fipe_price !== null && raw.fipe_price !== undefined ? Number(raw.fipe_price) : null,
    description: String(raw.description || ''),
    features: Array.isArray(raw.features) ? raw.features.map(String) : [],
    commercial_conditions: String(raw.commercial_conditions || ''),
    status: (raw.status as VehicleStatus) || 'disponivel',
    featured: Boolean(raw.featured),
    photos: Array.isArray(raw.photos) ? raw.photos.map(String) : [],
    created_at: String(raw.created_at || new Date().toISOString()),
    updated_at: String(raw.updated_at || new Date().toISOString()),
  };
}

function getAuthHeaders(): HeadersInit {
  const token = getPreviewAuthToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export async function listVehicles(): Promise<Vehicle[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Não foi possível carregar os veículos cadastrados.');
    }
    return (data || []).map((row) => normalizeVehicle(row as Record<string, unknown>));
  }

  const response = await fetch('/api/vehicles');
  if (!response.ok) {
    throw new Error('Não foi possível carregar o catálogo de veículos.');
  }
  const data = await response.json();
  return Array.isArray(data) ? data.map((row) => normalizeVehicle(row)) : [];
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error('Não foi possível consultar os detalhes deste veículo.');
    }
    return data ? normalizeVehicle(data as Record<string, unknown>) : null;
  }

  const response = await fetch(`/api/vehicles/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error('Não foi possível carregar os dados do veículo.');
  }
  const data = await response.json();
  return normalizeVehicle(data);
}

export async function createVehicle(payload: VehiclePayload): Promise<Vehicle> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([payload])
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Erro ao cadastrar veículo no Supabase.');
    }
    return normalizeVehicle(data as Record<string, unknown>);
  }

  const response = await fetch('/api/vehicles', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'Erro ao cadastrar veículo.');
  }
  return normalizeVehicle(body);
}

export async function updateVehicle(id: string, payload: Partial<VehiclePayload>): Promise<Vehicle> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('vehicles')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Erro ao atualizar veículo no Supabase.');
    }
    return normalizeVehicle(data as Record<string, unknown>);
  }

  const response = await fetch(`/api/vehicles/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'Erro ao atualizar veículo.');
  }
  return normalizeVehicle(body);
}

export async function deleteVehicle(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) {
      throw new Error(error.message || 'Erro ao excluir veículo no Supabase.');
    }
    return;
  }

  const response = await fetch(`/api/vehicles/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Erro ao excluir veículo.');
  }
}

export async function uploadVehiclePhoto(file: File): Promise<string> {
  const safeExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `vehicle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  if (isSupabaseConfigured && supabase) {
    const filePath = `catalog/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('vehicle-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(
        `Erro ao enviar foto para o Storage: ${uploadError.message}. Verifique se o bucket "vehicle-photos" foi criado.`
      );
    }

    const { data } = supabase.storage.from('vehicle-photos').getPublicUrl(filePath);
    return data.publicUrl;
  }

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem.'));
    reader.readAsDataURL(file);
  });

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ fileName, dataUrl: base64 }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.url) {
    throw new Error(body.error || 'Erro ao enviar fotografia.');
  }
  return String(body.url);
}
