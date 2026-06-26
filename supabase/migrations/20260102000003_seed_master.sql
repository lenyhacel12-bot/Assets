-- ============================================================================
-- Stage 3 — Seed reference data for master records (idempotent)
-- ============================================================================

-- Units of measure ----------------------------------------------------------
insert into public.units (code, name) values
  ('roll',  'Roll'),
  ('meter', 'Meter'),
  ('piece', 'Piece'),
  ('liter', 'Liter'),
  ('box',   'Box')
on conflict (code) do nothing;

-- Customer categories (configurable; initial set per the brief) --------------
insert into public.customer_categories (code, name) values
  ('walk_in',            'Walk-in'),
  ('reseller',           'Reseller'),
  ('printing_business',  'Printing business'),
  ('contractor',         'Contractor'),
  ('dealer',             'Dealer'),
  ('corporate_client',   'Corporate client'),
  ('aluminum_glass',     'Aluminum and glass supplier'),
  ('business_owner',     'Business owner'),
  ('distributor',        'Distributor'),
  ('other',              'Other')
on conflict (code) do nothing;
