import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Gift,
  Users,
  UserCheck,
  UserPlus,
  UserX,
  LogOut,
  RefreshCw,
  DollarSign,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  listarConfirmacoesPresenca,
  type ConfirmacaoPresenca,
} from "@/services/confirmacaoPresencaService";
import { listarPedidosPresentes, type PedidoPresente } from "@/services/presentesService";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Painel — Murilo & Mirelle" }, { name: "robots", content: "noindex" }],
  }),
  component: Admin,
});

function Admin() {
  const navigate = useNavigate();
  const [confirmacoes, setConfirmacoes] = useState<ConfirmacaoPresenca[]>([]);
  const [pedidos, setPedidos] = useState<PedidoPresente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [validatingSession, setValidatingSession] = useState(true);

  const loadAdminData = async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const [confirmacoesData, pedidosData] = await Promise.all([
        listarConfirmacoesPresenca(),
        listarPedidosPresentes(),
      ]);

      setConfirmacoes(confirmacoesData);
      setPedidos(pedidosData);
      
      if (isManual) {
        toast.success("Dados atualizados com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao carregar painel admin:", err);
      if (isManual) {
        toast.error("Erro ao atualizar dados. Tente novamente.");
      } else {
        setError(
          "Não foi possível carregar os dados do painel. Verifique as variáveis do Supabase e as políticas de SELECT.",
        );
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;

        if (!session) {
          navigate({ to: "/admin-login" });
          return;
        }

        setValidatingSession(false);
        await loadAdminData();
      } catch (err) {
        console.error("Erro de validação de sessão:", err);
        if (active) {
          navigate({ to: "/admin-login" });
        }
      }
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_OUT" || !session) {
        navigate({ to: "/admin-login" });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      navigate({ to: "/admin-login" });
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      toast.error("Erro ao encerrar sessão.");
    }
  }

  const confirmed = confirmacoes.filter((r) => r.vai_comparecer);
  const declined = confirmacoes.filter((r) => !r.vai_comparecer);
  const totalCompanions = confirmed.reduce((sum, r) => sum + (r.quantidade_acompanhantes || 0), 0);
  const totalPeople = confirmed.length + totalCompanions;

  // Cálculos financeiros
  const totalPedidos = pedidos.length;
  const pedidosPagos = pedidos.filter((p) => p.status === "pago").length;
  const pedidosPendentes = pedidos.filter((p) => p.status === "pendente").length;
  const valorRecebido = pedidos
    .filter((p) => p.status === "pago")
    .reduce((sum, p) => sum + p.preco_presente, 0);
  const valorPendente = pedidos
    .filter((p) => p.status === "pendente")
    .reduce((sum, p) => sum + p.preco_presente, 0);

  function formatBRL(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "pago":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
            Pago
          </span>
        );
      case "pendente":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
            Pendente
          </span>
        );
      case "recusado":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200/50">
            Recusado
          </span>
        );
      case "cancelado":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
            Cancelado
          </span>
        );
      case "estornado":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200/50">
            Estornado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
            {status}
          </span>
        );
    }
  }

  if (validatingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground font-serif-italic">Verificando permissões...</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Painel</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl">Confirmações</h1>
            <p className="mt-2 text-muted-foreground">Acompanhe em tempo real os convidados.</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Painel protegido. Os dados são carregados de forma segura após autenticação com Supabase Auth.
            </p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={() => loadAdminData(true)}
              disabled={isRefreshing || loading}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card hover:bg-secondary/40 px-4 py-2.5 text-xs font-medium transition-all disabled:opacity-50 cursor-pointer shadow-[var(--shadow-soft)]"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Atualizando..." : "Atualizar dados"}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2.5 text-xs font-medium transition-all cursor-pointer shadow-[var(--shadow-soft)]"
            >
              <LogOut className="size-3.5" />
              Sair
            </button>
          </div>
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

            <div className="mt-16">
              <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Presentes recebidos</p>
              <h2 className="mt-4 font-display text-4xl">Financeiro & Pedidos</h2>
              <p className="mt-2 text-muted-foreground">Acompanhe as transações do Mercado Pago.</p>
            </div>

            {/* Cards Financeiros */}
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Stat icon={Gift} label="Total de pedidos" value={totalPedidos} />
              <Stat icon={CheckCircle2} label="Pedidos pagos" value={pedidosPagos} />
              <Stat icon={AlertCircle} label="Pedidos pendentes" value={pedidosPendentes} />
              <StatBRL icon={DollarSign} label="Valor recebido" value={formatBRL(valorRecebido)} highlight />
              <StatBRL icon={DollarSign} label="Valor pendente" value={formatBRL(valorPendente)} />
            </div>

            <section className="mt-8 bg-card border border-border/70 rounded-lg overflow-hidden shadow-[var(--shadow-card)]">
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
                        <td className="px-4 py-4 font-medium text-foreground">
                          {formatBRL(pedido.preco_presente)}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{pedido.nome_comprador}</td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {pedido.telefone_comprador || "—"}
                        </td>
                        <td className="px-4 py-4">{getStatusBadge(pedido.status)}</td>
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

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
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

function StatBRL({ icon: Icon, label, value, highlight = false }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`bg-card border rounded-lg p-6 ${highlight ? "border-olive/50 bg-secondary/20" : "border-border/70"}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className={`size-4 ${highlight ? "text-olive" : "text-muted-foreground"}`} />
      </div>
      <p className={`mt-3 font-display text-2xl sm:text-3xl ${highlight ? "text-olive font-semibold" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
