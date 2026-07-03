create extension if not exists "pgcrypto";

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    full_name text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email, full_name)
    values (
        new.id,
        new.email,
        new.raw_user_meta_data ->> 'full_name'
    );
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.budget_records (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    ministry text not null,
    state text,
    year int not null,
    allocated_ngn numeric not null,
    actual_ngn numeric not null,
    deviation_pct numeric not null,
    alert_fired boolean not null,
    ai_summary_en text,
    ai_summary_pidgin text,
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.budget_records enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "budget_records_select_own"
on public.budget_records
for select
to authenticated
using (auth.uid() = user_id);

create policy "budget_records_insert_own"
on public.budget_records
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "budget_records_update_own"
on public.budget_records
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "budget_records_delete_own"
on public.budget_records
for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.contracts (
    id uuid primary key default gen_random_uuid(),
    project_name text not null,
    contractor_name text not null,
    awarded_amount_ngn numeric not null,
    location_lat double precision not null,
    location_lng double precision not null,
    lga text not null,
    state text not null,
    official_status text not null,
    photo_evidence_url text,
    created_at timestamptz not null default now()
);

create table if not exists public.citizen_reports (
    id uuid primary key default gen_random_uuid(),
    category text not null,
    description text,
    lat double precision not null,
    lng double precision not null,
    photo_url text,
    vision_analysis jsonb not null,
    contract_match_id uuid references public.contracts(id) on delete set null,
    reported_by text,
    created_at timestamptz not null default now()
);

alter table public.contracts enable row level security;
alter table public.citizen_reports enable row level security;

create policy "contracts_select_authenticated"
on public.contracts
for select
to authenticated
using (true);

create policy "contracts_insert_authenticated"
on public.contracts
for insert
to authenticated
with check (true);

create policy "citizen_reports_select_authenticated"
on public.citizen_reports
for select
to authenticated
using (true);

create policy "citizen_reports_insert_authenticated"
on public.citizen_reports
for insert
to authenticated
with check (auth.uid()::text = reported_by);

create table if not exists public.foi_requests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    question_plain text not null,
    category text not null,
    agency_name text not null,
    agency_email text not null,
    generated_letter text not null,
    due_date date not null,
    created_at timestamptz not null default now()
);

create table if not exists public.program_verifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    program_name text not null,
    lga text not null,
    state text not null,
    received boolean not null,
    amount_ngn numeric,
    created_at timestamptz not null default now()
);

alter table public.foi_requests enable row level security;
alter table public.program_verifications enable row level security;

create policy "foi_requests_select_own"
on public.foi_requests
for select
to authenticated
using (auth.uid() = user_id);

create policy "foi_requests_insert_own"
on public.foi_requests
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "foi_requests_update_own"
on public.foi_requests
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "foi_requests_delete_own"
on public.foi_requests
for delete
to authenticated
using (auth.uid() = user_id);

create policy "program_verifications_select_public"
on public.program_verifications
for select
to anon, authenticated
using (true);

create policy "program_verifications_insert_own"
on public.program_verifications
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "program_verifications_update_own"
on public.program_verifications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "program_verifications_delete_own"
on public.program_verifications
for delete
to authenticated
using (auth.uid() = user_id);
