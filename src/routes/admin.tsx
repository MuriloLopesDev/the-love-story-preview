import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gift, Users, UserCheck, UserPlus, UserX } from "lucide-react";
import {
  listarConfirmacoesPresenca,
  type ConfirmacaoPresenca,
} from "@/services/confirmacaoPresencaService";
import { listarPedidosPresentes, type PedidoPresente } from "@/services/presentesService";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Painel — Mirelle & Murilo" }, { name: "robots", content: "noindex" }],
  }),
  component: Admin,
});

function Admin() {
  const [confirmacoes, setConfirmacoes] = useState<ConfirmacaoPresenca[]>([]);
  const [pedidos, setPedidos] = useState<PedidoPresente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAdminData() {
      setLoading(true);
      setError("");

      try {
        const [confirmacoesData, pedidosData] = await Promise.all([
          listarConfirmacoesPresenca(),
          listarPedidosPresentes(),
        ]);

        if (active) {
          setConfirmacoes(confirmacoesData);
          setPedidos(pedidosData);
        }
      } catch (err) {
        console.error("Erro ao carregar painel admin:", err);
        if (active) {
          setError(
            "Não foi possível carregar os dados do painel. Verifique as variáveis do Supabase e as policies de SELECT.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAdminData();

    return () => {
      active = false;
    };
  }, []);

  const confirmed = confirmacoes.filter((r) => r.vai_comparecer);
  const declined = confirmacoes.filter((r) => !r.vai_comparecer);
  const totalCompanions = confirmed.reduce((sum, r) => sum + (r.quantidade_acompanhantes || 0), 0);
  const totalPeople = confirmed.length + totalCompanions;

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        <header>
          <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Painel</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">Confirmações</h1>
          <p className="mt-2 text-muted-foreground">Acompanhe em tempo real os convidados.</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Atenção: para ler dados no front-end, o Supabase precisa de policies de SELECT adequadas
            ou autenticação no admin. Não crie policy pública ampla para dados sensíveis.
          </p>
        </header>

        {loading && (
          <p className="mt-12 text-center text-muted-foreground font-serif-italic">
            Carregando painel...
          </p>
        )}

        {!loading && error && (
          <div className="mt-10 bg-card border border-border/70 rounded-lg p-6 text-muted-foreground shadow-[var(--shadow-card)]">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Stat icon={Users} label="Total de respostas" value={confirmacoes.length} />
              <Stat icon={UserCheck} label="Presenças confirmadas" value={confirmed.length} />
              <Stat icon={UserX} label="Ausências" value={declined.length} />
              <Stat icon={UserPlus} label="Acompanhantes" value={totalCompanions} />
              <Stat icon={Users} label="Total de pessoas" value={totalPeople} />
            </div>

            <section className="mt-12 bg-card border border-border/70 rounded-lg overflow-hidden shadow-[var(--shadow-card)]">
              <div className="px-6 py-4 border-b border-border/70 flex items-center justify-between">
                <h2 className="font-display text-2xl">Lista de convidados</h2>
                <span className="text-xs text-muted-foreground">
                  {confirmacoes.length} respostas
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-6 py-3 font-medium">Nome</th>
                      <th className="text-left px-4 py-3 font-medium">Telefone</th>
                      <th className="text-left px-4 py-3 font-medium">Código</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Acomp.</th>
                      <th className="text-left px-4 py-3 font-medium">Nomes</th>
                      <th className="text-left px-4 py-3 font-medium">Mensagem</th>
                      <th className="text-left px-4 py-3 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmacoes.map((r) => (
                      <tr key={r.id} className="border-t border-border/60 hover:bg-secondary/30">
                        <td className="px-6 py-4 font-medium">{r.nome_convidado}</td>
                        <td className="px-4 py-4 text-muted-foreground">{r.telefone || "—"}</td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {r.codigo_convite || "—"}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${
                              r.vai_comparecer
                                ? "bg-olive/15 text-olive"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {r.vai_comparecer ? "Confirmado" : "Não vai"}
                          </span>
                        </td>
                        <td className="px-4 py-4">{r.quantidade_acompanhantes}</td>
                        <td className="px-4 py-4 text-muted-foreground max-w-xs">
                          {r.nomes_acompanhantes?.join(", ") || "—"}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground max-w-xs truncate">
                          {r.mensagem_noivos || "—"}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {formatDate(r.criado_em)}
                        </td>
                      </tr>
                    ))}
                    {confirmacoes.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                          Nenhuma confirmação ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-12 bg-card border border-border/70 rounded-lg overflow-hidden shadow-[var(--shadow-card)]">
              <div className="px-6 py-4 border-b border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gift className="size-5 text-olive" />
                  <h2 className="font-display text-2xl">Pedidos de presentes</h2>
                </div>
                <span className="text-xs text-muted-foreground">{pedidos.length} pedidos</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-6 py-3 font-medium">Presente</th>
                      <th className="text-left px-4 py-3 font-medium">Preço</th>
                      <th className="text-left px-4 py-3 font-medium">Comprador</th>
                      <th className="text-left px-4 py-3 font-medium">Telefone</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Criado em</th>
                      <th className="text-left px-4 py-3 font-medium">Pago em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((pedido) => (
                      <tr
                        key={pedido.id}
                        className="border-t border-border/60 hover:bg-secondary/30"
                      >
                        <td className="px-6 py-4 font-medium">{pedido.titulo_presente}</td>
                        <td className="px-4 py-4">
                          R$ {pedido.preco_presente.toLocaleString("pt-BR")}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{pedido.nome_comprador}</td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {pedido.telefone_comprador || "—"}
                        </td>
                        <td className="px-4 py-4">{pedido.status}</td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {formatDate(pedido.criado_em)}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {pedido.pago_em ? formatDate(pedido.pago_em) : "—"}
                        </td>
                      </tr>
                    ))}
                    {pedidos.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                          Nenhum pedido de presente ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="bg-card border border-border/70 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="size-4 text-olive" />
      </div>
      <p className="mt-3 font-display text-4xl">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
