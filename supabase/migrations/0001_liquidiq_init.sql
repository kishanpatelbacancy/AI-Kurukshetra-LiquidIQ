create extension if not exists pgcrypto;

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  avatar_url text,
  role text not null default 'treasurer'
    check (role in ('admin', 'treasurer', 'approver', 'viewer')),
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
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1), 'User'),
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  account_number text not null unique,
  account_name text not null,
  bank_name text not null,
  bank_code text,
  currency text not null default 'USD',
  account_type text not null default 'current'
    check (account_type in ('current', 'savings', 'money_market', 'loan', 'investment')),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'frozen')),
  current_balance numeric(18, 2) not null default 0,
  available_balance numeric(18, 2) not null default 0,
  entity_name text,
  country text,
  iban text,
  swift_bic text,
  last_synced_at timestamptz,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists bank_accounts_updated_at on public.bank_accounts;
create trigger bank_accounts_updated_at
  before update on public.bank_accounts
  for each row execute procedure public.update_updated_at();

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_ref text not null unique,
  bank_account_id uuid not null references public.bank_accounts(id) on delete cascade,
  transaction_type text not null
    check (transaction_type in ('credit', 'debit', 'transfer', 'fee', 'interest', 'fx')),
  amount numeric(18, 2) not null,
  currency text not null default 'USD',
  base_amount numeric(18, 2),
  exchange_rate numeric(12, 6) default 1,
  value_date date not null,
  booking_date date,
  description text,
  counterparty text,
  category text
    check (category in ('payroll', 'vendor', 'tax', 'intercompany', 'investment', 'debt_service', 'fx', 'other')),
  reference text,
  status text not null default 'completed'
    check (status in ('pending', 'completed', 'failed', 'cancelled', 'reconciled')),
  reconciled boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists transactions_updated_at on public.transactions;
create trigger transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.update_updated_at();

create table if not exists public.cash_flow_forecasts (
  id uuid primary key default gen_random_uuid(),
  forecast_date date not null,
  entity_name text,
  currency text not null default 'USD',
  inflow_amount numeric(18, 2) not null default 0,
  outflow_amount numeric(18, 2) not null default 0,
  net_position numeric(18, 2) generated always as (inflow_amount - outflow_amount) stored,
  category text
    check (category in ('operating', 'investing', 'financing', 'fx', 'other')),
  description text,
  confidence text not null default 'medium'
    check (confidence in ('high', 'medium', 'low')),
  is_actual boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists cash_flow_forecasts_updated_at on public.cash_flow_forecasts;
create trigger cash_flow_forecasts_updated_at
  before update on public.cash_flow_forecasts
  for each row execute procedure public.update_updated_at();

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  payment_ref text not null unique,
  from_account_id uuid references public.bank_accounts(id) on delete set null,
  to_account_id uuid references public.bank_accounts(id) on delete set null,
  beneficiary_name text not null,
  beneficiary_iban text,
  beneficiary_bank text,
  amount numeric(18, 2) not null,
  currency text not null default 'USD',
  payment_type text not null default 'wire'
    check (payment_type in ('wire', 'ach', 'sepa', 'swift', 'internal', 'check')),
  value_date date,
  purpose text,
  status text not null default 'draft'
    check (status in ('draft', 'pending_approval', 'approved', 'rejected', 'processing', 'completed', 'cancelled', 'failed')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  approval_level integer not null default 0,
  required_approvals integer not null default 1,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at
  before update on public.payments
  for each row execute procedure public.update_updated_at();

create table if not exists public.approval_workflows (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  approver_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('approved', 'rejected', 'recalled')),
  comments text,
  actioned_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.risk_exposures (
  id uuid primary key default gen_random_uuid(),
  exposure_date date not null,
  risk_type text not null
    check (risk_type in ('fx', 'interest_rate', 'credit', 'liquidity', 'counterparty')),
  currency_pair text,
  notional_amount numeric(18, 2),
  base_currency text not null default 'USD',
  exposure_amount numeric(18, 2) not null,
  mark_to_market numeric(18, 2),
  hedge_ratio numeric(5, 2) not null default 0,
  entity_name text,
  counterparty text,
  maturity_date date,
  severity text not null default 'medium'
    check (severity in ('low', 'medium', 'high', 'critical')),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists risk_exposures_updated_at on public.risk_exposures;
create trigger risk_exposures_updated_at
  before update on public.risk_exposures
  for each row execute procedure public.update_updated_at();

create table if not exists public.currency_rates (
  id uuid primary key default gen_random_uuid(),
  base text not null,
  target text not null,
  rate numeric(12, 6) not null,
  rate_date date not null,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  unique (base, target, rate_date)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_bank_accounts_created_by on public.bank_accounts(created_by);
create index if not exists idx_bank_accounts_status on public.bank_accounts(status);
create index if not exists idx_bank_accounts_currency on public.bank_accounts(currency);

create index if not exists idx_transactions_bank_account_id on public.transactions(bank_account_id);
create index if not exists idx_transactions_value_date on public.transactions(value_date desc);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_transactions_category on public.transactions(category);
create index if not exists idx_transactions_counterparty on public.transactions(counterparty);

create index if not exists idx_cash_flow_forecasts_forecast_date on public.cash_flow_forecasts(forecast_date);
create index if not exists idx_cash_flow_forecasts_entity_name on public.cash_flow_forecasts(entity_name);
create index if not exists idx_cash_flow_forecasts_is_actual on public.cash_flow_forecasts(is_actual);

create index if not exists idx_payments_from_account_id on public.payments(from_account_id);
create index if not exists idx_payments_to_account_id on public.payments(to_account_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_value_date on public.payments(value_date);
create index if not exists idx_payments_created_by on public.payments(created_by);

create index if not exists idx_approval_workflows_payment_id on public.approval_workflows(payment_id);
create index if not exists idx_approval_workflows_approver_id on public.approval_workflows(approver_id);

create index if not exists idx_risk_exposures_exposure_date on public.risk_exposures(exposure_date desc);
create index if not exists idx_risk_exposures_risk_type on public.risk_exposures(risk_type);
create index if not exists idx_risk_exposures_severity on public.risk_exposures(severity);
create index if not exists idx_risk_exposures_entity_name on public.risk_exposures(entity_name);

create index if not exists idx_currency_rates_rate_date on public.currency_rates(rate_date desc);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_audit_logs_entity_type on public.audit_logs(entity_type);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

alter table public.profiles enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.cash_flow_forecasts enable row level security;
alter table public.payments enable row level security;
alter table public.approval_workflows enable row level security;
alter table public.risk_exposures enable row level security;
alter table public.currency_rates enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
  on public.profiles
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can manage bank accounts" on public.bank_accounts;
create policy "Authenticated users can manage bank accounts"
  on public.bank_accounts
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can manage transactions" on public.transactions;
create policy "Authenticated users can manage transactions"
  on public.transactions
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can manage forecasts" on public.cash_flow_forecasts;
create policy "Authenticated users can manage forecasts"
  on public.cash_flow_forecasts
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can manage payments" on public.payments;
create policy "Authenticated users can manage payments"
  on public.payments
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can manage approval workflows" on public.approval_workflows;
create policy "Authenticated users can manage approval workflows"
  on public.approval_workflows
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can manage risk exposures" on public.risk_exposures;
create policy "Authenticated users can manage risk exposures"
  on public.risk_exposures
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can manage currency rates" on public.currency_rates;
create policy "Authenticated users can manage currency rates"
  on public.currency_rates
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can view audit logs" on public.audit_logs;
create policy "Authenticated users can view audit logs"
  on public.audit_logs
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can insert audit logs" on public.audit_logs;
create policy "Authenticated users can insert audit logs"
  on public.audit_logs
  for insert
  with check (auth.role() = 'authenticated');
