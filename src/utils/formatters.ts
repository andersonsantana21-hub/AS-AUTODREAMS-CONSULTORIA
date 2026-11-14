import type { Vehicle, VehicleStatus } from '../types/database';

export function formatCurrencyBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'Sob consulta';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatMileage(km: number | null | undefined): string {
  if (km === null || km === undefined || Number.isNaN(Number(km))) {
    return '0 km';
  }
  return `${new Intl.NumberFormat('pt-BR').format(Number(km))} km`;
}

export function formatVehicleYear(manufactureYear: number, modelYear: number): string {
  if (!manufactureYear && !modelYear) return '';
  if (manufactureYear === modelYear) return `${modelYear}`;
  return `${manufactureYear}/${modelYear}`;
}

export function getVehicleFullName(vehicle: Pick<Vehicle, 'brand' | 'model' | 'version'>): string {
  return [vehicle.brand, vehicle.model, vehicle.version].filter(Boolean).join(' ').trim();
}

export function getStatusLabel(status: VehicleStatus): string {
  switch (status) {
    case 'disponivel':
      return 'Disponível';
    case 'reservado':
      return 'Reservado';
    case 'vendido':
      return 'Vendido';
    default:
      return status;
  }
}

export function formatDateBR(isoDate: string): string {
  if (!isoDate) return '';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export function sanitizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhoneInput(value: string): string {
  const digits = sanitizePhoneDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
