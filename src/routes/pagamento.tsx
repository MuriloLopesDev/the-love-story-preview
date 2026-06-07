import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, Gift, Lock } from "lucide-react";
import {
  buscarPresentePorId,
  criarPreferenciaMercadoPago,
  type Presente,
} from "@/services/presentesService";

type SearchParams = { presenteId?: string; title?: string; price?: number };

export const Route = createFileRoute("/pagamento")({
  head: () => ({
    meta: [
      { title: "Pagamento - Mirelle & Murilo" },
      { name: "description", content: "Finalize seu presente com Mercado Pago." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    presenteId: typeof search.presenteId === "string" ? search.presenteId : undefined,
    title: typeof search.title === "string" ? search.title : undefined,
    price: search.price ? Number(search.price) : undefined,
  }),
  component: Pagamento,
});

function Pagamento() {
  const { presenteId, title, price } = Route.useSearch();

  const [buyer, setBuyer] = useState({ name: "", phone: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [presente, setPresente] = useState<Presente | null>(null);
  const [summaryImageFailed, setSummaryImageFailed] = useState(false);

  const giftTitle = presente?.titulo ?? title ?? "Presente para os noivos";
  const giftPrice = presente?.preco ?? (price && price > 0 ? price : 200);
  const giftImageUrl = presente?.imagem_url ?? null;
  const showGiftImage = Boolean(giftImageUrl) && !summaryImageFailed;

  useEffect(() => {
    if (!presenteId) {
      setPresente(null);
      return;
    }

    let active = true;

    async function loadPresente() {
      try {
        const data = await buscarPresentePorId(presenteId);
        if (active) {
          setPresente(data);
          setSummaryImageFailed(false);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do presente:", err);
      }
    }

    loadPresente();

    return () => {
      active = false;
    };
  }, [presenteId]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const nomeComprador = buyer.name.trim();
    const telefoneComprador = buyer.phone.trim();

    if (!nomeComprador) {
      setError("Por favor, informe seu nome para continuarmos.");
      return;
    }

    if (!telefoneComprador) {
      setError("Por favor, informe seu telefone para continuarmos.");
      return;
    }

    if (!presenteId) {
      setError(
        "Não foi possível identificar o presente escolhido. Volte para a lista e tente novamente.",
      );
      return;
    }

    if (!giftTitle.trim()) {
      setError("Não foi possível identificar o nome do presente escolhido.");
      return;
    }

    if (!Number.isFinite(giftPrice) || giftPrice <= 0) {
      setError("Não foi possível identificar o valor do presente escolhido.");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      presente_id: presenteId,
      titulo_presente: giftTitle,
      preco_presente: giftPrice,
      nome_comprador: nomeComprador.slice(0, 100),
      telefone_comprador: telefoneComprador.slice(0, 30),
    };

    try {
      const response = await criarPreferenciaMercadoPago(payload);
      const checkoutUrl = import.meta.env.DEV
        ? response.sandbox_init_point || response.init_point
        : response.init_point || response.sandbox_init_point;

      if (!checkoutUrl) {
        throw new Error("Resposta sem init_point do Mercado Pago.");
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Erro ao iniciar pagamento Mercado Pago:", err);
      setError("Não foi possível iniciar o pagamento. Tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <div className="px-6 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/presentes"
          className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-olive transition-colors"
        >
          <ArrowLeft className="size-4" /> Voltar para presentes
        </Link>

        <header className="mt-8 text-center max-w-2xl mx-auto">
          <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Pagamento</p>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl">Finalize seu presente</h1>
          <p className="mt-4 text-foreground/70">
            Você será direcionado ao Checkout Pro do Mercado Pago para concluir o pagamento com
            segurança.
          </p>
        </header>

        <div className="mt-12 grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="order-2 lg:order-1 space-y-8">
            <div className="bg-card border border-border/70 rounded-xl p-6 sm:p-8 shadow-[var(--shadow-card)]">
              <form onSubmit={handlePay} className="space-y-5" noValidate>
                <div>
                  <h2 className="font-display text-2xl">Dados do comprador</h2>
                  <p className="mt-2 text-sm text-foreground/70">
                    Usaremos essas informações para identificar seu presente e iniciar o checkout.
                  </p>
                </div>

                <Field
                  label="Nome do comprador"
                  placeholder="Seu nome completo"
                  value={buyer.name}
                  onChange={(e) => {
                    setError("");
                    setBuyer({ ...buyer, name: e.target.value });
                  }}
                  required
                />
                <Field
                  label="Telefone / WhatsApp"
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                  value={buyer.phone}
                  onChange={(e) => {
                    setError("");
                    setBuyer({ ...buyer, phone: e.target.value });
                  }}
                  required
                />

                <div className="rounded-lg border border-border/70 bg-secondary/40 p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-card flex items-center justify-center text-olive">
                      <CreditCard className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium">Checkout Mercado Pago</p>
                      <p className="text-xs text-muted-foreground">
                        Pix, crédito, débito e demais opções disponíveis no ambiente seguro.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-sm font-medium hover:bg-primary/90 transition-all disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Lock className="size-4" />
                  {submitting ? "Redirecionando..." : "Pagar com Mercado Pago"}
                </button>
              </form>
            </div>

            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3" /> Ambiente seguro · pagamento processado pelo Mercado Pago
            </p>
          </div>

          <aside className="order-1 lg:order-2 bg-card border border-border/70 rounded-xl p-5 sm:p-6 h-fit lg:sticky lg:top-24 shadow-[var(--shadow-card)]">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Resumo do presente
            </p>
            <div className="mt-4 overflow-hidden rounded-lg bg-secondary/70">
              {showGiftImage ? (
                <img
                  src={giftImageUrl ?? ""}
                  alt={giftTitle}
                  onError={() => setSummaryImageFailed(true)}
                  className="h-32 sm:h-40 lg:h-44 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-28 sm:h-36 lg:h-40 w-full flex items-center justify-center bg-[linear-gradient(135deg,var(--secondary),var(--champagne))] text-olive">
                  <div className="size-14 rounded-full bg-card/80 flex items-center justify-center shadow-[var(--shadow-soft)]">
                    <Gift className="size-7" />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-start gap-3">
              <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-olive shrink-0">
                <Gift className="size-5" />
              </div>
              <div>
                <p className="font-display text-lg leading-tight">{giftTitle}</p>
                <p className="text-xs text-muted-foreground font-serif-italic mt-1">
                  Mirelle & Murilo · 10.10.2026
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-border/70 pt-4 space-y-2 text-sm">
              <Row
                label="Valor do presente"
                value={`R$ ${giftPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              />
              <Row label="Pagamento" value="Mercado Pago" />
            </div>

            <div className="mt-4 border-t border-border/70 pt-4 flex items-end justify-between">
              <span className="text-sm text-foreground/70">Total</span>
              <span className="font-display text-2xl text-olive">
                R$ {giftPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-md bg-background border border-border/70 text-sm focus:outline-none focus:border-olive transition-colors"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground/70">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
