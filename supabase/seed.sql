insert into public.currency_rates (base, target, rate, rate_date, source)
values
  ('USD', 'EUR', 0.921400, current_date, 'seed'),
  ('USD', 'GBP', 0.789200, current_date, 'seed'),
  ('USD', 'JPY', 149.850000, current_date, 'seed'),
  ('USD', 'INR', 83.120000, current_date, 'seed'),
  ('USD', 'AUD', 1.530000, current_date, 'seed'),
  ('EUR', 'USD', 1.084800, current_date, 'seed'),
  ('GBP', 'USD', 1.267000, current_date, 'seed')
on conflict (base, target, rate_date) do update
set
  rate = excluded.rate,
  source = excluded.source;

insert into public.bank_accounts (
  account_number,
  account_name,
  bank_name,
  currency,
  account_type,
  status,
  current_balance,
  available_balance,
  entity_name,
  country,
  iban,
  swift_bic,
  notes
)
values
  ('US-001-4521', 'Main Operating Account', 'JPMorgan Chase', 'USD', 'current', 'active', 4250000.00, 4100000.00, 'LiquidIQ Corp', 'US', null, 'CHASUS33', 'Primary US operating account'),
  ('US-002-7834', 'Payroll Disbursement', 'Bank of America', 'USD', 'current', 'active', 820000.00, 820000.00, 'LiquidIQ Corp', 'US', null, 'BOFAUS3N', 'Dedicated payroll funding account'),
  ('EU-003-2291', 'EU Operations Account', 'Deutsche Bank', 'EUR', 'current', 'active', 1750000.00, 1600000.00, 'LiquidIQ Europe', 'DE', 'DE89370400440532013000', 'DEUTDEFF', 'European operating entity'),
  ('GB-004-5512', 'UK Subsidiary Account', 'Barclays', 'GBP', 'current', 'active', 980000.00, 950000.00, 'LiquidIQ UK Ltd', 'GB', 'GB29NWBK60161331926819', 'BARCGB22', 'UK subsidiary cash account'),
  ('US-005-9103', 'Money Market Reserve', 'Goldman Sachs', 'USD', 'money_market', 'active', 12000000.00, 12000000.00, 'LiquidIQ Corp', 'US', null, 'GOLDAUSX', 'Reserve liquidity bucket'),
  ('US-006-3374', 'Credit Line Account', 'Citibank', 'USD', 'loan', 'active', -2500000.00, -2500000.00, 'LiquidIQ Corp', 'US', null, 'CITIUS33', 'Revolving credit facility'),
  ('SG-007-8821', 'APAC Treasury Account', 'DBS Bank', 'USD', 'current', 'active', 2200000.00, 2100000.00, 'LiquidIQ Asia Pte', 'SG', null, 'DBSSSGSG', 'APAC treasury center'),
  ('US-008-6647', 'Tax Reserve Account', 'Wells Fargo', 'USD', 'savings', 'active', 650000.00, 650000.00, 'LiquidIQ Corp', 'US', null, 'WFBIUS6S', 'Quarterly tax reserve')
on conflict (account_number) do update
set
  account_name = excluded.account_name,
  bank_name = excluded.bank_name,
  currency = excluded.currency,
  account_type = excluded.account_type,
  status = excluded.status,
  current_balance = excluded.current_balance,
  available_balance = excluded.available_balance,
  entity_name = excluded.entity_name,
  country = excluded.country,
  iban = excluded.iban,
  swift_bic = excluded.swift_bic,
  notes = excluded.notes,
  updated_at = now();

insert into public.transactions (
  transaction_ref,
  bank_account_id,
  transaction_type,
  amount,
  currency,
  base_amount,
  exchange_rate,
  value_date,
  booking_date,
  description,
  counterparty,
  category,
  reference,
  status,
  reconciled
)
select
  seed.transaction_ref,
  account.id,
  seed.transaction_type,
  seed.amount,
  seed.currency,
  seed.base_amount,
  seed.exchange_rate,
  seed.value_date,
  seed.booking_date,
  seed.description,
  seed.counterparty,
  seed.category,
  seed.reference,
  seed.status,
  seed.reconciled
from (
  values
    ('TXN-000001', 'US-001-4521', 'credit', 850000.00, 'USD', 850000.00, 1.000000, current_date - 1, current_date - 1, 'Customer payment received', 'Acme Corp', 'vendor', 'AR-2026-001', 'completed', true),
    ('TXN-000002', 'US-002-7834', 'debit', 125000.00, 'USD', 125000.00, 1.000000, current_date - 2, current_date - 2, 'Monthly payroll run', 'ADP Payroll', 'payroll', 'PAYROLL-MAR', 'completed', true),
    ('TXN-000003', 'US-001-4521', 'debit', 42000.00, 'USD', 42000.00, 1.000000, current_date - 3, current_date - 3, 'Vendor invoice payment', 'Oracle Corp', 'vendor', 'VND-8821', 'completed', true),
    ('TXN-000004', 'EU-003-2291', 'credit', 320000.00, 'EUR', 346400.00, 1.082500, current_date - 4, current_date - 4, 'Intercompany funding', 'LiquidIQ Corp', 'intercompany', 'IC-4412', 'completed', true),
    ('TXN-000005', 'US-008-6647', 'debit', 18500.00, 'USD', 18500.00, 1.000000, current_date - 5, current_date - 5, 'Q1 tax installment', 'IRS', 'tax', 'TAX-Q1', 'completed', true),
    ('TXN-000006', 'SG-007-8821', 'fx', 175000.00, 'USD', 26180000.00, 149.600000, current_date - 1, current_date - 1, 'JPY hedge settlement', 'MUFG', 'fx', 'FX-2201', 'reconciled', true),
    ('TXN-000007', 'US-005-9103', 'interest', 27850.00, 'USD', 27850.00, 1.000000, current_date - 7, current_date - 7, 'Money market interest accrual', 'Goldman Sachs', 'investment', 'MM-INT-01', 'completed', true),
    ('TXN-000008', 'US-006-3374', 'fee', 3500.00, 'USD', 3500.00, 1.000000, current_date - 8, current_date - 8, 'Credit line commitment fee', 'Citibank', 'debt_service', 'DEBT-FEE-01', 'completed', false)
) as seed(
  transaction_ref,
  account_number,
  transaction_type,
  amount,
  currency,
  base_amount,
  exchange_rate,
  value_date,
  booking_date,
  description,
  counterparty,
  category,
  reference,
  status,
  reconciled
)
join public.bank_accounts account on account.account_number = seed.account_number
on conflict (transaction_ref) do update
set
  bank_account_id = excluded.bank_account_id,
  transaction_type = excluded.transaction_type,
  amount = excluded.amount,
  currency = excluded.currency,
  base_amount = excluded.base_amount,
  exchange_rate = excluded.exchange_rate,
  value_date = excluded.value_date,
  booking_date = excluded.booking_date,
  description = excluded.description,
  counterparty = excluded.counterparty,
  category = excluded.category,
  reference = excluded.reference,
  status = excluded.status,
  reconciled = excluded.reconciled,
  updated_at = now();

insert into public.cash_flow_forecasts (
  forecast_date,
  entity_name,
  currency,
  inflow_amount,
  outflow_amount,
  category,
  description,
  confidence,
  is_actual
)
select
  current_date + n,
  case
    when n <= 7 then 'LiquidIQ Corp'
    when n <= 10 then 'LiquidIQ Europe'
    else 'LiquidIQ Asia Pte'
  end,
  'USD',
  case
    when n % 3 = 0 then round((500000 + (n * 23000))::numeric, 2)
    when n % 2 = 0 then round((170000 + (n * 14000))::numeric, 2)
    else round((95000 + (n * 9500))::numeric, 2)
  end,
  case
    when n % 4 = 0 then round((380000 + (n * 18000))::numeric, 2)
    when n % 3 = 1 then round((105000 + (n * 8000))::numeric, 2)
    else round((52000 + (n * 6500))::numeric, 2)
  end,
  (array['operating', 'investing', 'financing', 'fx', 'other'])[1 + (n % 5)],
  'Projected cash flow day ' || n,
  (array['high', 'medium', 'medium', 'low', 'high'])[1 + (n % 5)],
  false
from generate_series(1, 14) as n
on conflict do nothing;

insert into public.payments (
  payment_ref,
  from_account_id,
  to_account_id,
  beneficiary_name,
  beneficiary_iban,
  beneficiary_bank,
  amount,
  currency,
  payment_type,
  value_date,
  purpose,
  status,
  priority,
  approval_level,
  required_approvals,
  notes
)
select
  seed.payment_ref,
  source_account.id,
  target_account.id,
  seed.beneficiary_name,
  seed.beneficiary_iban,
  seed.beneficiary_bank,
  seed.amount,
  seed.currency,
  seed.payment_type,
  seed.value_date,
  seed.purpose,
  seed.status,
  seed.priority,
  seed.approval_level,
  seed.required_approvals,
  seed.notes
from (
  values
    ('PAY-000001', 'US-001-4521', null, 'Oracle Corporation', null, 'Citibank NA', 98500.00, 'USD', 'wire', current_date + 2, 'Software license renewal Q1', 'pending_approval', 'normal', 0, 2, 'Awaiting treasury manager review'),
    ('PAY-000002', 'EU-003-2291', null, 'AWS EMEA SARL', 'LU123456789012345678', 'BNP Paribas', 42200.00, 'EUR', 'sepa', current_date + 1, 'Cloud infrastructure invoice', 'approved', 'high', 2, 2, 'Approved for release'),
    ('PAY-000003', 'US-001-4521', null, 'Salesforce Inc', null, 'Bank of America', 29750.00, 'USD', 'ach', current_date + 3, 'CRM annual subscription', 'draft', 'normal', 0, 1, 'Draft prepared by AP'),
    ('PAY-000004', 'US-001-4521', 'EU-003-2291', 'LiquidIQ Europe GmbH', 'DE89370400440532013000', 'Deutsche Bank', 350000.00, 'EUR', 'swift', current_date, 'Intercompany funding transfer', 'processing', 'urgent', 1, 1, 'Treasury initiated same-day transfer'),
    ('PAY-000005', 'GB-004-5512', null, 'HMRC Tax Authority', 'GB29NWBK60161331926819', 'Barclays', 88000.00, 'GBP', 'wire', current_date + 5, 'UK corporation tax Q1', 'pending_approval', 'high', 0, 2, 'Requires dual approval'),
    ('PAY-000006', 'US-005-9103', null, 'Deloitte Advisory', null, 'JPMorgan Chase', 55000.00, 'USD', 'wire', current_date + 7, 'Audit services Q4', 'draft', 'normal', 0, 1, 'Draft payment for finance ops')
) as seed(
  payment_ref,
  from_account_number,
  to_account_number,
  beneficiary_name,
  beneficiary_iban,
  beneficiary_bank,
  amount,
  currency,
  payment_type,
  value_date,
  purpose,
  status,
  priority,
  approval_level,
  required_approvals,
  notes
)
left join public.bank_accounts source_account on source_account.account_number = seed.from_account_number
left join public.bank_accounts target_account on target_account.account_number = seed.to_account_number
on conflict (payment_ref) do update
set
  from_account_id = excluded.from_account_id,
  to_account_id = excluded.to_account_id,
  beneficiary_name = excluded.beneficiary_name,
  beneficiary_iban = excluded.beneficiary_iban,
  beneficiary_bank = excluded.beneficiary_bank,
  amount = excluded.amount,
  currency = excluded.currency,
  payment_type = excluded.payment_type,
  value_date = excluded.value_date,
  purpose = excluded.purpose,
  status = excluded.status,
  priority = excluded.priority,
  approval_level = excluded.approval_level,
  required_approvals = excluded.required_approvals,
  notes = excluded.notes,
  updated_at = now();

insert into public.risk_exposures (
  exposure_date,
  risk_type,
  currency_pair,
  notional_amount,
  base_currency,
  exposure_amount,
  mark_to_market,
  hedge_ratio,
  entity_name,
  counterparty,
  maturity_date,
  severity,
  notes
)
values
  (current_date, 'fx', 'EUR/USD', 1750000.00, 'USD', 161150.00, -8200.00, 45.00, 'LiquidIQ Corp', 'Deutsche Bank', current_date + 45, 'medium', 'EUR receivables partially hedged'),
  (current_date, 'fx', 'GBP/USD', 980000.00, 'USD', 195216.00, 4100.00, 60.00, 'LiquidIQ Corp', 'Barclays', current_date + 60, 'medium', 'GBP revenue hedge program'),
  (current_date, 'interest_rate', null, 2500000.00, 'USD', 2500000.00, -12500.00, 0.00, 'LiquidIQ Corp', 'Citibank', current_date + 365, 'high', 'Floating-rate debt on revolver'),
  (current_date, 'liquidity', null, null, 'USD', 4250000.00, null, 0.00, 'LiquidIQ Corp', null, null, 'low', 'Operating cash concentration'),
  (current_date, 'credit', null, 500000.00, 'USD', 500000.00, null, 0.00, 'LiquidIQ Asia Pte', 'Regional distributor', current_date + 120, 'medium', 'Counterparty settlement timing risk'),
  (current_date, 'fx', 'USD/JPY', 320000.00, 'USD', 47952000.00, -3800.00, 30.00, 'LiquidIQ Asia Pte', 'MUFG', current_date + 30, 'low', 'Importer hedge coverage')
on conflict do nothing;

insert into public.approval_workflows (
  payment_id,
  approver_id,
  action,
  comments,
  actioned_at
)
select
  payment.id,
  profile.id,
  seed.action,
  seed.comments,
  seed.actioned_at
from (
  values
    ('PAY-000002', 'approved', 'Budget owner approved payment', now() - interval '6 hours'),
    ('PAY-000002', 'approved', 'Treasury approver released payment', now() - interval '3 hours')
) as seed(payment_ref, action, comments, actioned_at)
join public.payments payment on payment.payment_ref = seed.payment_ref
join public.profiles profile on profile.email = (
  select p.email
  from public.profiles p
  order by p.created_at asc
  limit 1
)
where exists (select 1 from public.profiles)
on conflict do nothing;

insert into public.audit_logs (
  user_id,
  action,
  entity_type,
  entity_id,
  old_data,
  new_data,
  ip_address
)
select
  profile.id,
  'seeded',
  'payment',
  payment.id,
  null,
  jsonb_build_object('payment_ref', payment.payment_ref, 'status', payment.status),
  '127.0.0.1'
from public.payments payment
cross join lateral (
  select p.id
  from public.profiles p
  order by p.created_at asc
  limit 1
) as profile
where exists (select 1 from public.profiles)
on conflict do nothing;
