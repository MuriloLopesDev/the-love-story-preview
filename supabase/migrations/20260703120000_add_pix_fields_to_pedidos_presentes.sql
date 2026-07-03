alter table public.pedidos_presentes
  add column if not exists metodo_pagamento text,
  add column if not exists mercado_pago_pix_qr_code text,
  add column if not exists mercado_pago_pix_qr_code_base64 text,
  add column if not exists mercado_pago_pix_ticket_url text,
  add column if not exists pix_expira_em timestamptz;
