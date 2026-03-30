-- =============================================================
-- NutriPlanner Pro v6 — Supabase Schema
-- Ejecuta esto en: app.supabase.com → SQL Editor → New query
-- =============================================================

-- Tabla de perfiles de usuario (extiende auth.users de Supabase)
create table if not exists public.profiles (
  id                     uuid references auth.users on delete cascade primary key,
  email                  text,
  full_name              text,
  -- Estado de la suscripción: 'inactive' | 'active' | 'past_due'
  subscription_status    text not null default 'inactive',
  -- ID del cliente en Stripe (se rellena automáticamente en el checkout)
  stripe_customer_id     text unique,
  -- ID de la suscripción activa en Stripe
  stripe_subscription_id text,
  -- Nombre del plan: 'Básico' | 'Pro'
  plan                   text,
  -- Fecha de fin del período actual (para mostrar cuándo renueva)
  plan_period_end        timestamptz,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

-- Función: crea el perfil automáticamente cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: se ejecuta después de cada nuevo registro
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Función: actualiza updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Row Level Security (RLS): cada usuario solo ve sus propios datos
alter table public.profiles enable row level security;

-- Los usuarios pueden leer y actualizar su propio perfil
drop policy if exists "Users can read own profile"   on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Service role full access"     on public.profiles;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- El service role (usado en las Netlify Functions) tiene acceso total
create policy "Service role full access"
  on public.profiles
  using (auth.role() = 'service_role');

-- =============================================================
-- Verificación: deberías ver la tabla creada correctamente
-- =============================================================
select column_name, data_type, column_default
from information_schema.columns
where table_name = 'profiles'
order by ordinal_position;
