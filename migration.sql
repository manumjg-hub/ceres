-- ============================================================
-- NutriPlanner Pro — Supabase Migration
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. EXTENSIONES
create extension if not exists "uuid-ossp";

-- 2. TABLA PROFILES (nutricionistas)
-- Se crea automáticamente al registrarse via Supabase Auth
create table if not exists public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  email           text unique not null,
  name            text,
  clinic          text,
  tagline         text,
  phone           text,
  web             text,
  logo            text,                          -- base64 o URL

  -- Suscripción Stripe
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  subscription_status     text default 'inactive'  -- 'inactive' | 'active' | 'past_due' | 'canceled'
    check (subscription_status in ('inactive','active','past_due','canceled','trialing')),
  subscription_plan       text default null        -- 'basico' | 'pro' | 'premium'
    check (subscription_plan in (null,'basico','pro','premium')),
  subscription_ends_at    timestamptz,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- RLS: cada nutricionista solo ve su propio perfil
alter table public.profiles enable row level security;
create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id);

-- Trigger: actualiza updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Trigger: crea perfil vacío al registrar usuario nuevo
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3. TABLA PATIENTS
create table if not exists public.patients (
  id              uuid default uuid_generate_v4() primary key,
  nutritionist_id uuid references public.profiles(id) on delete cascade not null,

  -- Datos personales
  name            text not null,
  email           text,
  phone           text,
  sex             text default 'F' check (sex in ('F','M')),
  birthdate       date,
  photo           text,                          -- base64 o URL

  -- Plan de suscripción del paciente
  plan            text default 'basico' check (plan in ('basico','pro','premium')),

  -- Datos físicos
  weight          numeric(5,2),
  height          numeric(5,1),
  activity_level  text default 'moderate',
  goal            text default 'maintain',
  notes           text,

  -- Estado
  revisado        boolean default false,
  assigned_template_id uuid,

  -- Dieta
  dieta_fecha_asignacion      timestamptz,
  dieta_fecha_lista_compra    timestamptz,

  -- Entrevista
  entrevista_fecha            timestamptz,
  answers                     jsonb default '{}',

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.patients enable row level security;
create policy "patients_owner" on public.patients
  for all using (auth.uid() = nutritionist_id);

create trigger patients_updated_at
  before update on public.patients
  for each row execute procedure public.handle_updated_at();


-- 4. TABLA PATIENT_HISTORY (check-ins de peso)
create table if not exists public.patient_history (
  id              uuid default uuid_generate_v4() primary key,
  patient_id      uuid references public.patients(id) on delete cascade not null,
  nutritionist_id uuid references public.profiles(id) on delete cascade not null,
  date            date not null,
  weight          numeric(5,2),
  notes           text,
  created_at      timestamptz default now()
);

alter table public.patient_history enable row level security;
create policy "history_owner" on public.patient_history
  for all using (auth.uid() = nutritionist_id);


-- 5. TABLA ANTROPOMETRÍA (composición corporal)
create table if not exists public.antropometria (
  id              uuid default uuid_generate_v4() primary key,
  patient_id      uuid references public.patients(id) on delete cascade not null,
  nutritionist_id uuid references public.profiles(id) on delete cascade not null,
  fecha           date not null,
  peso            numeric(5,2),
  masa_magra      numeric(5,2),           -- kg
  porcentaje_grasa  numeric(4,1),         -- %
  grasa_visceral  integer,                -- nivel 1-20
  porcentaje_agua numeric(4,1),           -- %
  notes           text,
  created_at      timestamptz default now()
);

alter table public.antropometria enable row level security;
create policy "antro_owner" on public.antropometria
  for all using (auth.uid() = nutritionist_id);


-- 6. TABLA WEEK_TEMPLATES
create table if not exists public.week_templates (
  id              uuid default uuid_generate_v4() primary key,
  nutritionist_id uuid references public.profiles(id) on delete cascade not null,
  name            text not null,
  description     text,
  week            jsonb not null default '{}',
  es_plantilla    boolean default true,
  created_at      timestamptz default now()
);

alter table public.week_templates enable row level security;
create policy "templates_owner" on public.week_templates
  for all using (auth.uid() = nutritionist_id);


-- 7. ÍNDICES de rendimiento
create index if not exists idx_patients_nutritionist on public.patients(nutritionist_id);
create index if not exists idx_history_patient on public.patient_history(patient_id);
create index if not exists idx_antro_patient on public.antropometria(patient_id);
create index if not exists idx_templates_nutritionist on public.week_templates(nutritionist_id);
