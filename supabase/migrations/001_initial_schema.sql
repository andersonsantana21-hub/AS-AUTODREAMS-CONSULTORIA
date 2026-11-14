-- ==============================================================================
-- AS AUTO DREAMS CONSULTORIA + INTERMEDIAÇÃO
-- Migração Inicial do Banco de Dados PostgreSQL + RLS + Storage (Supabase)
-- ==============================================================================

-- Habilita extensão para geração de UUID
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. TABELA DE VEÍCULOS
-- ==============================================================================
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  version text not null default '',
  manufacture_year integer not null check (manufacture_year >= 1950 and manufacture_year <= 2100),
  model_year integer not null check (model_year >= 1950 and model_year <= 2100),
  mileage integer not null default 0 check (mileage >= 0),
  transmission text not null,
  engine text not null default '',
  fuel text not null,
  color text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  fipe_price numeric(12, 2) check (fipe_price is null or fipe_price >= 0),
  description text not null default '',
  features text[] not null default '{}',
  commercial_conditions text not null default '',
  status text not null default 'disponivel' check (status in ('disponivel', 'reservado', 'vendido')),
  featured boolean not null default false,
  photos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para filtros e ordenação rápida no catálogo
create index if not exists idx_vehicles_status on public.vehicles (status);
create index if not exists idx_vehicles_brand on public.vehicles (brand);
create index if not exists idx_vehicles_model on public.vehicles (model);
create index if not exists idx_vehicles_model_year on public.vehicles (model_year desc);
create index if not exists idx_vehicles_price on public.vehicles (price);
create index if not exists idx_vehicles_featured on public.vehicles (featured) where featured = true;
create index if not exists idx_vehicles_created_at on public.vehicles (created_at desc);

-- Função e Trigger para atualização automática de updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_vehicles_updated_at on public.vehicles;
create trigger trg_vehicles_updated_at
  before update on public.vehicles
  for each row
  execute function public.handle_updated_at();

-- ==============================================================================
-- 2. TABELA DE INTERESSADOS (LEADS)
-- ==============================================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete set null,
  vehicle_title text not null,
  full_name text not null,
  phone text not null,
  message text not null default '',
  lgpd_consent boolean not null default false check (lgpd_consent = true),
  contacted boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_vehicle_id on public.leads (vehicle_id);
create index if not exists idx_leads_contacted on public.leads (contacted);

-- ==============================================================================
-- 3. POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.vehicles enable row level security;
alter table public.leads enable row level security;

-- Veículos: leitura pública para a loja virtual; escrita apenas para administradores autenticados
drop policy if exists "Veículos visíveis publicamente" on public.vehicles;
create policy "Veículos visíveis publicamente"
  on public.vehicles
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Administradores podem inserir veículos" on public.vehicles;
create policy "Administradores podem inserir veículos"
  on public.vehicles
  for insert
  to authenticated
  with check (auth.role() = 'authenticated');

drop policy if exists "Administradores podem atualizar veículos" on public.vehicles;
create policy "Administradores podem atualizar veículos"
  on public.vehicles
  for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Administradores podem excluir veículos" on public.vehicles;
create policy "Administradores podem excluir veículos"
  on public.vehicles
  for delete
  to authenticated
  using (auth.role() = 'authenticated');

-- Leads: visitantes podem enviar interesse (com consentimento LGPD obrigatório);
-- visualização, atualização de atendimento e exclusão apenas para administradores autenticados
drop policy if exists "Visitantes podem registrar interesse com LGPD" on public.leads;
create policy "Visitantes podem registrar interesse com LGPD"
  on public.leads
  for insert
  to anon, authenticated
  with check (lgpd_consent = true);

drop policy if exists "Administradores visualizam interessados" on public.leads;
create policy "Administradores visualizam interessados"
  on public.leads
  for select
  to authenticated
  using (auth.role() = 'authenticated');

drop policy if exists "Administradores atualizam interessados" on public.leads;
create policy "Administradores atualizam interessados"
  on public.leads
  for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Administradores excluem interessados" on public.leads;
create policy "Administradores excluem interessados"
  on public.leads
  for delete
  to authenticated
  using (auth.role() = 'authenticated');

-- ==============================================================================
-- 4. SUPABASE STORAGE — BUCKET PARA FOTOGRAFIAS DOS VEÍCULOS
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Fotos de veículos públicas para visualização" on storage.objects;
create policy "Fotos de veículos públicas para visualização"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'vehicle-photos');

drop policy if exists "Administradores enviam fotos de veículos" on storage.objects;
create policy "Administradores enviam fotos de veículos"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'vehicle-photos' and auth.role() = 'authenticated');

drop policy if exists "Administradores atualizam fotos de veículos" on storage.objects;
create policy "Administradores atualizam fotos de veículos"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'vehicle-photos' and auth.role() = 'authenticated');

drop policy if exists "Administradores removem fotos de veículos" on storage.objects;
create policy "Administradores removem fotos de veículos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'vehicle-photos' and auth.role() = 'authenticated');
