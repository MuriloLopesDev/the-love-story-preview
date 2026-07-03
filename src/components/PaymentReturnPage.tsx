import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { buscarPedidoPresentePorId, type PedidoPresente } from "@/services/presentesService";

export type MercadoPagoReturnParams = {
  collection_id?: string;
  collection_status?: string;
  payment_id?: string;
  status?: string;
  external_reference?: string;
};

type PaymentReturnPageProps = {
  icon: ReactNode;
  title: string;
  message: string;
  safeFallbackMessage?: string;
  params: MercadoPagoReturnParams;
  primaryAction: {
    label: string;
    href?: string;
    to?: "/" | "/presentes";
  };
  secondaryAction: {
    label: string;
    to: "/" | "/presentes";
  };
};

export function PaymentReturnPage({
  icon,
  title,
  message,
  safeFallbackMessage,
  params,
  primaryAction,
  secondaryAction,
}: PaymentReturnPageProps) {
  const [pedido, setPedido] = useState<PedidoPresente | null>(null);
  const [loadingPedido, setLoadingPedido] = useState(false);
  const [pedidoLookupFailed, setPedidoLookupFailed] = useState(false);

  const externalReference = params.external_reference?.trim();

  useEffect(() => {
    if (!externalReference) {
      setPedido(null);
      setPedidoLookupFailed(true);
      return;
    }

    let active = true;

    async function loadPedido() {
      setLoadingPedido(true);
      setPedidoLookupFailed(false);

      try {
        const data = await buscarPedidoPresentePorId(externalReference);
        if (!active) return;

        setPedido(data);
        setPedidoLookupFailed(!data);
      } catch (err) {
        console.error("Erro ao buscar pedido do retorno Mercado Pago:", err);
        if (active) {
          setPedido(null);
          setPedidoLookupFailed(true);
        }
      } finally {
        if (active) setLoadingPedido(false);
      }
    }

    loadPedido();

    return () => {
      active = false;
    };
  }, [externalReference]);

  const retryHref = useMemo(() => {
    if (!pedido?.presente_id) return primaryAction.href;

    const search = new URLSearchParams({
      presenteId: pedido.presente_id,
      title: pedido.titulo_presente,
      price: String(pedido.preco_presente),
    });

    return `/pagamento?${search.toString()}`;
  }, [pedido, primaryAction.href]);

  const visibleMessage = pedidoLookupFailed && safeFallbackMessage ? safeFallbackMessage : message;
  const details = [
    ["Payment ID", params.payment_id],
    ["Status", params.status],
    ["Collection status", params.collection_status],
    ["External reference", params.external_reference],
  ].filter(([, value]) => Boolean(value));

  return (
    <div className="px-6 py-16 sm:py-24">
      <section className="mx-auto max-w-2xl animate-fade-up rounded-xl border border-border/70 bg-card p-7 text-center shadow-[var(--shadow-card)] sm:p-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-olive">
          {icon}
        </div>

        <h1 className="mt-6 font-display text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-foreground/75 font-serif-italic">
          {visibleMessage}
        </p>

        {loadingPedido && (
          <p className="mt-8 text-sm text-muted-foreground">Buscando detalhes do presente...</p>
        )}

        {pedido && (
          <div className="mt-8 rounded-lg border border-border/70 bg-background/70 p-5 text-left">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Presente</p>
            <h2 className="mt-2 font-display text-2xl text-foreground">{pedido.titulo_presente}</h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <InfoRow
                label="Valor"
                value={pedido.preco_presente.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              />
              <InfoRow label="Status atual" value={formatStatus(pedido.status)} />
            </div>
          </div>
        )}

        {details.length > 0 && (
          <div className="mt-5 rounded-lg border border-border/60 bg-background/50 p-4 text-left">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Dados do pagamento
            </p>
            <div className="mt-3 grid gap-2 text-xs text-foreground/70 sm:text-sm">
              {details.map(([label, value]) => (
                <InfoRow key={label} label={label} value={value ?? ""} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          {primaryAction.to ? (
            <Link
              to={primaryAction.to}
              className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90"
            >
              {primaryAction.label}
            </Link>
          ) : (
            <a
              href={retryHref ?? "/presentes"}
              className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90"
            >
              {primaryAction.label}
            </a>
          )}

          <Link
            to={secondaryAction.to}
            className="inline-flex items-center justify-center rounded-full border border-border/80 bg-background px-7 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
          >
            {secondaryAction.label}
          </Link>
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground break-all">{value}</span>
    </div>
  );
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    pendente: "Pendente",
    aguardando_pix: "Aguardando Pix",
    erro_pix: "Erro ao gerar Pix",
    pago: "Pago",
    recusado: "Recusado",
    cancelado: "Cancelado",
    estornado: "Estornado",
  };

  return labels[status] ?? status;
}
