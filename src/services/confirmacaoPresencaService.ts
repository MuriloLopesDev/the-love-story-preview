import { isSupabaseConfigured, logSupabaseError, supabase } from "@/lib/supabase";

export type ConfirmacaoPresencaPayload = {
  nome_convidado: string;
  telefone: string | null;
  codigo_convite: string | null;
  vai_comparecer: boolean;
  quantidade_acompanhantes: number;
  nomes_acompanhantes: string[];
  mensagem_noivos: string | null;
};

export type ConfirmacaoPresenca = ConfirmacaoPresencaPayload & {
  id: string;
  criado_em: string;
};

export type ConvidadoConfirmado = Pick<
  ConfirmacaoPresenca,
  "id" | "nome_convidado" | "nomes_acompanhantes"
>;

export async function registrarConfirmacaoPresenca(payload: ConfirmacaoPresencaPayload) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase não configurado.");
  }

  const { error } = await supabase.from("confirmacoes_presenca").insert(payload);

  if (error) {
    logSupabaseError("Erro ao registrar confirmação:", error);
    throw error;
  }
}

export async function listarConfirmacoesPresenca() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase não configurado.");
  }

  const { data, error } = await supabase
    .from("confirmacoes_presenca")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    logSupabaseError("Erro ao listar confirmações:", error);
    throw error;
  }

  return (data ?? []) as ConfirmacaoPresenca[];
}

export async function listarConvidadosConfirmados(): Promise<ConvidadoConfirmado[]> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase não configurado.");
  }

  const pageSize = 500;
  const confirmados: ConvidadoConfirmado[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("confirmacoes_presenca")
      .select("id,nome_convidado,nomes_acompanhantes")
      .eq("vai_comparecer", true)
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      logSupabaseError("Erro ao listar convidados confirmados:", error);
      throw error;
    }

    confirmados.push(...((data ?? []) as ConvidadoConfirmado[]));
    if (!data || data.length < pageSize) break;
  }

  return confirmados;
}
