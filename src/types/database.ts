export type VehicleStatus = 'disponivel' | 'reservado' | 'vendido';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string;
  manufacture_year: number;
  model_year: number;
  mileage: number;
  transmission: string;
  engine: string;
  fuel: string;
  color: string;
  price: number;
  fipe_price: number | null;
  description: string;
  features: string[];
  commercial_conditions: string;
  status: VehicleStatus;
  featured: boolean;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export type VehiclePayload = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;

export interface Lead {
  id: string;
  vehicle_id: string | null;
  vehicle_title: string;
  full_name: string;
  phone: string;
  message: string;
  lgpd_consent: boolean;
  contacted: boolean;
  created_at: string;
}

export interface LeadPayload {
  vehicle_id?: string | null;
  vehicle_title: string;
  full_name: string;
  phone: string;
  message?: string;
  lgpd_consent: boolean;
}

export interface VehicleFilters {
  search: string;
  brand: string;
  model: string;
  year: string;
  minPrice: string;
  maxPrice: string;
  transmission: string;
  fuel: string;
  status: string;
}

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  soldVehicles: number;
  reservedVehicles: number;
  totalLeads: number;
}

export interface AdminUser {
  id: string;
  email: string;
}
