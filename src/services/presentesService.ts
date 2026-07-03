import { isSupabaseConfigured, logSupabaseError, supabase } from "@/lib/supabase";

export type Presente = {
  id: string;
  titulo: string;
  descricao: string | null;
  preco: number;
  imagem_url: string | null;
  categoria: string | null;
  ativo: boolean;
  criado_em: string;
};

export type PedidoPresenteStatus =
  | "pendente"
  | "aguardando_pix"
  | "erro_pix"
  | "pago"
  | "recusado"
  | "cancelado"
  | "estornado";

export type PedidoPresentePayload = {
  presente_id: string | null;
  titulo_presente: string;
  preco_presente: number;
  nome_comprador: string;
  telefone_comprador: string | null;
  email_comprador: string;
  status: PedidoPresenteStatus;
};

export type PedidoPresente = PedidoPresentePayload & {
  id: string;
  metodo_pagamento: string | null;
  mercado_pago_preference_id: string | null;
  mercado_pago_payment_id: string | null;
  mercado_pago_init_point: string | null;
  mercado_pago_pix_qr_code: string | null;
  mercado_pago_pix_qr_code_base64: string | null;
  mercado_pago_pix_ticket_url: string | null;
  pix_expira_em: string | null;
  criado_em: string;
  pago_em: string | null;
};

export type CriarPreferenciaMercadoPagoPayload = {
  presente_id: string;
  titulo_presente: string;
  preco_presente: number;
  nome_comprador: string;
  telefone_comprador: string;
  email_comprador: string;
  descricao_presente?: string | null;
  device_id?: string | null;
};

export type CriarPreferenciaMercadoPagoResponse = {
  pedido_id?: string;
  preference_id?: string;
  init_point?: string;
  sandbox_init_point?: string;
};

export type CriarPagamentoPixResponse = {
  pedido_id: string;
  payment_id: string;
  status: string;
  qr_code: string | null;
  qr_code_base64: string | null;
  ticket_url: string | null;
};

async function readFunctionError(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "context" in error &&
    error.context instanceof Response
  ) {
    try {
      return await error.context.clone().json();
    } catch {
      return null;
    }
  }

  return null;
}

export async function listarPresentes() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase não configurado.");
  }

  const { data, error } = await supabase
    .from("presentes")
    .select("*")
    .eq("ativo", true)
    .order("preco", { ascending: true });

  if (error) {
    logSupabaseError("Erro ao listar presentes:", error);
    throw error;
  }

  return (data ?? []) as Presente[];
}

export async function buscarPresentePorId(id: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase nÃ£o configurado.");
  }

  const { data, error } = await supabase
    .from("presentes")
    .select("*")
    .eq("id", id)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    logSupabaseError("Erro ao buscar presente:", error);
    throw error;
  }

  return data as Presente | null;
}

export async function criarPreferenciaMercadoPago(payload: CriarPreferenciaMercadoPagoPayload) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase nÃ£o configurado.");
  }

  const { data, error } = await supabase.functions.invoke("criar-preferencia-mercado-pago", {
    body: payload,
  });

  if (error) {
    logSupabaseError("Erro ao criar preferÃªncia no Mercado Pago:", error);
    throw error;
  }

  return data as CriarPreferenciaMercadoPagoResponse;
}

export async function criarPagamentoPix(payload: CriarPreferenciaMercadoPagoPayload) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase nao configurado.");
  }

  const { data, error } = await supabase.functions.invoke("criar-pagamento-pix", {
    body: payload,
  });

  if (error) {
    const details = await readFunctionError(error);
    console.error("Erro tecnico retornado pela funcao criar-pagamento-pix:", details ?? error);
    logSupabaseError("Erro ao criar pagamento Pix no Mercado Pago:", error);
    throw details ?? error;
  }

  return data as CriarPagamentoPixResponse;
}

export async function criarPedidoPresente(payload: PedidoPresentePayload) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase não configurado.");
  }

  const { data, error } = await supabase
    .from("pedidos_presentes")
    .insert(payload)
    .select()
    .single();

  if (error) {
    logSupabaseError("Erro ao registrar pedido de presente:", error);
    throw error;
  }

  return data as PedidoPresente;
}

export async function buscarPedidoPresentePorId(id: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase nÃ£o configurado.");
  }

  const { data, error } = await supabase
    .from("pedidos_presentes")
    .select(
      "id,presente_id,titulo_presente,preco_presente,nome_comprador,telefone_comprador,email_comprador,status,metodo_pagamento,mercado_pago_preference_id,mercado_pago_payment_id,mercado_pago_init_point,mercado_pago_pix_qr_code,mercado_pago_pix_qr_code_base64,mercado_pago_pix_ticket_url,pix_expira_em,criado_em,pago_em",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logSupabaseError("Erro ao buscar pedido de presente:", error);
    throw error;
  }

  return data as PedidoPresente | null;
}

export async function listarPedidosPresentes() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase não configurado.");
  }

  const { data, error } = await supabase
    .from("pedidos_presentes")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    logSupabaseError("Erro ao listar pedidos de presentes:", error);
    throw error;
  }

  return (data ?? []) as PedidoPresente[];
}
