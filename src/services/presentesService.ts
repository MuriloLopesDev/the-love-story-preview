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

export type PedidoPresentePayload = {
  presente_id: string | null;
  titulo_presente: string;
  preco_presente: number;
  nome_comprador: string;
  telefone_comprador: string | null;
  email_comprador: string;
  status: "pendente";
};

export type PedidoPresente = PedidoPresentePayload & {
  id: string;
  mercado_pago_preference_id: string | null;
  mercado_pago_payment_id: string | null;
  mercado_pago_init_point: string | null;
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
};

export type CriarPreferenciaMercadoPagoResponse = {
  pedido_id?: string;
  preference_id?: string;
  init_point?: string;
  sandbox_init_point?: string;
};

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
