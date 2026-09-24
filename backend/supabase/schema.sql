-- Sentivoy tables used by the FastAPI service.
-- Run this in the Supabase SQL editor.
-- The API connects with the service-role key, which bypasses row level security.
-- RLS is enabled with no anon policies so the browser anon key cannot read these tables.

create table if not exists public.logs (
    id text primary key,
    tenant_id text not null,
    user_id text not null,
    ip_address text not null,
    timestamp timestamptz not null default now(),
    event_type text not null,
    status text not null
);

create index if not exists logs_tenant_id_idx on public.logs (tenant_id);
create index if not exists logs_user_timestamp_idx on public.logs (user_id, timestamp desc);

create table if not exists public.features (
    log_id text primary key references public.logs (id) on delete cascade,
    login_frequency double precision not null default 0,
    failed_login_ratio double precision not null default 0,
    time_gap double precision not null default 0,
    geo_distance double precision not null default 0,
    request_rate double precision not null default 0,
    ip_change_flag double precision not null default 0
);

create table if not exists public.anomalies (
    log_id text primary key references public.logs (id) on delete cascade,
    tenant_id text,
    is_anomaly boolean not null default false,
    final_severity text not null,
    action_recommendation text not null,
    reconstruction_error double precision,
    anomaly_score double precision,
    severity text,
    reasoning text
);

create index if not exists anomalies_tenant_id_idx on public.anomalies (tenant_id);

create table if not exists public.api_keys (
    id text primary key,
    tenant_id text not null,
    key_string text not null unique,
    name text not null,
    created_at timestamptz not null default now(),
    is_active boolean not null default true
);

create index if not exists api_keys_key_string_idx on public.api_keys (key_string);
create index if not exists api_keys_tenant_id_idx on public.api_keys (tenant_id);

alter table public.logs enable row level security;
alter table public.features enable row level security;
alter table public.anomalies enable row level security;
alter table public.api_keys enable row level security;
