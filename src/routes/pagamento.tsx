import { Outlet, createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Copy, ExternalLink, Gift, Loader2, Lock, QrCode } from "lucide-react";
import {
  buscarPresentePorId,
  criarPagamentoPix,
  criarPreferenciaMercadoPago,
  type CriarPagamentoPixResponse,
  type Presente,
} from "@/services/presentesService";

declare global {
  interface Window {
    MP_DEVICE_SESSION_ID?: string;
  }
}

type SearchParams = {
  presenteId?: string;
  title?: string;
  price?: number;
  collection_id?: string;
  collection_status?: string;
  payment_id?: string;
  status?: string;
  external_reference?: string;
};

export const Route = createFileRoute("/pagamento")({
  head: () => ({
    meta: [
      { title: "Pagamento - Murilo & Mirelle" },
      { name: "description", content: "Finalize seu presente com Mercado Pago." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    presenteId: typeof search.presenteId === "string" ? search.presenteId : undefined,
    title: typeof search.title === "string" ? search.title : undefined,
    price: search.price ? Number(search.price) : undefined,
    collection_id: asString(search.collection_id),
    collection_status: asString(search.collection_status),
    payment_id: asString(search.payment_id),
    status: asString(search.status),
    external_reference: asString(search.external_reference),
  }),
  component: Pagamento,
});

function asString(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);

  return typeof value === "string" && value.trim() ? value : undefined;
}

function Pagamento() {
  const location = useLocation();
  const { presenteId, title, price } = Route.useSearch();

  const [buyer, setBuyer] = useState({ name: "", phone: "", email: "" });
  const [error, setError] = useState("");
  const [pixError, setPixError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generatingPix, setGeneratingPix] = useState(false);
  const [pixPayment, setPixPayment] = useState<CriarPagamentoPixResponse | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [presente, setPresente] = useState<Presente | null>(null);
  const [summaryImageFailed, setSummaryImageFailed] = useState(false);

  const giftTitle = presente?.titulo ?? title ?? "Presente para os noivos";
  const giftPrice = presente?.preco ?? (price && price > 0 ? price : 200);
  const giftImageUrl = presente?.imagem_url ?? null;
  const showGiftImage = Boolean(giftImageUrl) && !summaryImageFailed;

  useEffect(() => {
    if (location.pathname !== "/pagamento") return;

    const script = document.createElement("script");
    script.src = "https://www.mercadopago.com/v2/security.js";
    script.setAttribute("view", "checkout");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/pagamento") return;

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
  }, [location.pathname, presenteId]);

  function buildPaymentPayload() {
    const nomeComprador = buyer.name.trim();
    const telefoneComprador = buyer.phone.trim();
    const emailComprador = buyer.email.trim();

    if (!nomeComprador) {
      setError("Por favor, informe seu nome para continuarmos.");
      return;
    }

    if (!emailComprador) {
      setError("Por favor, informe seu e-mail para continuarmos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailComprador)) {
      setError("Por favor, insira um e-mail válido.");
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

    return {
      presente_id: presenteId,
      titulo_presente: giftTitle,
      preco_presente: giftPrice,
      nome_comprador: nomeComprador.slice(0, 100),
      telefone_comprador: telefoneComprador.slice(0, 30),
      email_comprador: emailComprador.slice(0, 100),
      descricao_presente: presente?.descricao ?? null,
      device_id: window.MP_DEVICE_SESSION_ID || null,
    };
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const payload = buildPaymentPayload();
    if (!payload) return;

    setSubmitting(true);
    setError("");
    setPixError("");

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

  async function handleGeneratePix() {
    if (generatingPix) return;

    const payload = buildPaymentPayload();
    if (!payload) return;

    setGeneratingPix(true);
    setError("");
    setPixError("");
    setPixCopied(false);

    try {
      const response = await criarPagamentoPix(payload);
      setPixPayment(response);

      if (!response.qr_code || !response.qr_code_base64) {
        setPixError("Pix gerado, mas o QR Code nao veio completo. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro tecnico retornado ao gerar Pix:", err);
      setPixError(
        "Não foi possível gerar o Pix agora. Tente novamente ou use o pagamento pelo Mercado Pago.",
      );
    } finally {
      setGeneratingPix(false);
    }
  }

  async function handleCopyPix() {
    if (!pixPayment?.qr_code) return;

    try {
      await navigator.clipboard.writeText(pixPayment.qr_code);
      setPixCopied(true);
      window.setTimeout(() => setPixCopied(false), 2500);
    } catch (err) {
      console.error("Erro ao copiar codigo Pix:", err);
      setPixError(
        "Nao foi possivel copiar automaticamente. Selecione o codigo e copie manualmente.",
      );
    }
  }

  if (location.pathname !== "/pagamento") {
    return <Outlet />;
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
            Você será direcionado ao Mercado Pago para concluir o pagamento com segurança.
          </p>
        </header>

        <div className="mt-12 grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="order-2 lg:order-1 space-y-8">
            <div className="bg-card border border-border/70 rounded-xl p-6 sm:p-8 shadow-[var(--shadow-card)]">
              <form onSubmit={handlePay} className="space-y-5" noValidate>
                <div>
                  <h2 className="font-display text-2xl">Insira seus dados</h2>
                  <p className="mt-2 text-sm text-foreground/70">
                    Usaremos essas informações para identificar seu presente e iniciar o pagamento.
                  </p>
                </div>

                <Field
                  label={<RequiredLabel>Nome Completo</RequiredLabel>}
                  placeholder="Seu nome completo"
                  value={buyer.name}
                  onChange={(e) => {
                    setError("");
                    setPixError("");
                    setBuyer({ ...buyer, name: e.target.value });
                  }}
                  required
                />

                <Field
                  label={<RequiredLabel>E-mail</RequiredLabel>}
                  placeholder="seu@email.com"
                  type="email"
                  value={buyer.email}
                  onChange={(e) => {
                    setError("");
                    setPixError("");
                    setBuyer({ ...buyer, email: e.target.value });
                  }}
                  required
                />

                <Field
                  label={<RequiredLabel>Telefone / WhatsApp</RequiredLabel>}
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                  value={buyer.phone}
                  onChange={(e) => {
                    setError("");
                    setPixError("");
                    setBuyer({ ...buyer, phone: e.target.value });
                  }}
                  required
                />

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
                  {submitting ? "Redirecionando..." : "Continuar para pagamento"}
                </button>

                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-border/70" />
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    ou pague via Pix
                  </span>
                  <span className="h-px flex-1 bg-border/70" />
                </div>

                <button
                  type="button"
                  disabled={generatingPix}
                  onClick={handleGeneratePix}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-olive/40 bg-background px-6 py-3.5 text-sm font-medium text-olive transition-all hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {generatingPix ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <QrCode className="size-4" />
                  )}
                  {generatingPix ? "Gerando Pix..." : "Gerar QR Code Pix"}
                </button>

                {pixError && (
                  <p className="text-sm text-destructive" role="alert">
                    {pixError}
                  </p>
                )}

                {pixPayment && (
                  <div className="rounded-lg border border-border/70 bg-background/70 p-5">
                    <h3 className="font-display text-2xl">Codigo Pix</h3>
                    <div className="mt-3 flex gap-2">
                      <textarea
                        readOnly
                        value={pixPayment.qr_code ?? ""}
                        className="min-h-24 flex-1 resize-none rounded-md border border-border/70 bg-card px-3 py-2 text-xs text-foreground/80 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        disabled={!pixPayment.qr_code}
                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Copiar codigo Pix"
                        title="Copiar codigo Pix"
                      >
                        {pixCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </button>
                    </div>

                    {pixCopied && (
                      <p className="mt-2 text-sm text-olive" role="status">
                        Copiado com sucesso.
                      </p>
                    )}

                    {pixPayment.qr_code_base64 && (
                      <div className="mt-6">
                        <h3 className="font-display text-2xl">Codigo QR</h3>
                        <div className="mt-3 inline-flex rounded-lg border border-border/70 bg-white p-3">
                          <img
                            src={`data:image/png;base64,${pixPayment.qr_code_base64}`}
                            alt="QR Code Pix"
                            className="size-52 max-w-full"
                          />
                        </div>
                      </div>
                    )}

                    {pixPayment.ticket_url && (
                      <a
                        href={pixPayment.ticket_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-olive hover:text-primary"
                      >
                        Abrir Pix no Mercado Pago <ExternalLink className="size-4" />
                      </a>
                    )}

                    <p className="mt-4 text-sm leading-relaxed text-foreground/70">
                      Apos o pagamento, a confirmacao sera feita automaticamente pelo Mercado Pago.
                    </p>
                  </div>
                )}
              </form>
            </div>

            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3" /> Ambiente seguro
            </p>
          </div>

          <aside className="order-1 lg:order-2 bg-card border border-border/70 rounded-xl p-5 sm:p-6 h-fit lg:sticky lg:top-24 shadow-[var(--shadow-card)]">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Resumo do presente
            </p>
            <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-white rounded-lg">
              {showGiftImage ? (
                <>
                  {/* Blurred background to fill the aspect ratio without solid borders */}
                  <img
                    src={giftImageUrl ?? ""}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover blur-[8px] scale-110 opacity-35 select-none pointer-events-none"
                    aria-hidden="true"
                  />
                  {/* Sharp foreground image */}
                  <img
                    src={giftImageUrl ?? ""}
                    alt={giftTitle}
                    onError={() => setSummaryImageFailed(true)}
                    className="relative z-10 h-full w-full object-contain"
                    loading="lazy"
                  />
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[linear-gradient(135deg,var(--secondary),var(--champagne))] text-olive aspect-square">
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
                  Murilo & Mirelle · 10.10.2026
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

function RequiredLabel({ children }: { children: string }) {
  return (
    <>
      {children}
      <span className="text-red-500"> *</span>
    </>
  );
}

function Field({
  label,
  ...props
}: { label: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
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
