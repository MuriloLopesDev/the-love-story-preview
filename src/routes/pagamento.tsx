import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, CreditCard, QrCode, Wallet, Lock, Gift } from "lucide-react";

type SearchParams = { title?: string; price?: number };

export const Route = createFileRoute("/pagamento")({
  head: () => ({
    meta: [
      { title: "Pagamento — Mirelle & Murilo" },
      { name: "description", content: "Finalize seu presente com Pix, crédito ou débito." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    title: typeof search.title === "string" ? search.title : undefined,
    price: search.price ? Number(search.price) : undefined,
  }),
  component: Pagamento,
});

type Method = "pix" | "credit" | "debit";

function Pagamento() {
  const { title, price } = Route.useSearch();
  const navigate = useNavigate();

  const giftTitle = title ?? "Presente para os noivos";
  const giftPrice = price && price > 0 ? price : 200;

  const [method, setMethod] = useState<Method>("pix");
  const [installments, setInstallments] = useState(1);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);

  const maxInstallments = useMemo(() => {
    if (giftPrice >= 600) return 12;
    if (giftPrice >= 300) return 10;
    if (giftPrice >= 150) return 6;
    if (giftPrice >= 50) return 3;
    return 1;
  }, [giftPrice]);

  const installmentOptions = useMemo(
    () => Array.from({ length: maxInstallments }, (_, i) => i + 1),
    [maxInstallments],
  );

  const installmentValue = giftPrice / installments;

  const pixCode =
    "00020126360014BR.GOV.BCB.PIX0114mirellemurilo52040000530398654" +
    giftPrice.toFixed(2).padStart(7, "0") +
    "5802BR5921Mirelle e Murilo6009SAO PAULO62070503***6304ABCD";

  function copyPix() {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
    setTimeout(() => navigate({ to: "/" }), 3500);
  }

  if (done) {
    return (
      <div className="px-6 py-24 min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md text-center bg-card border border-border/70 rounded-xl p-10 shadow-[var(--shadow-card)] animate-[fade-up_0.6s_ease]">
          <div className="mx-auto size-16 rounded-full bg-secondary flex items-center justify-center text-olive">
            <Check className="size-8" />
          </div>
          <h1 className="mt-6 font-display text-4xl">Obrigado!</h1>
          <p className="mt-4 text-foreground/70 font-serif-italic">
            Seu presente foi recebido com muito carinho. Mirelle & Murilo agradecem do fundo do coração.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">Você será redirecionado para o início…</p>
        </div>
      </div>
    );
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
            Escolha a forma de pagamento que preferir. Tudo seguro e simples.
          </p>
        </header>

        <div className="mt-12 grid lg:grid-cols-[1fr_360px] gap-8">
          {/* LEFT — Method + form */}
          <div className="space-y-8">
            {/* Method selector */}
            <div className="grid grid-cols-3 gap-3">
              <MethodButton active={method === "pix"} onClick={() => setMethod("pix")} icon={<QrCode className="size-5" />} label="Pix" />
              <MethodButton active={method === "credit"} onClick={() => setMethod("credit")} icon={<CreditCard className="size-5" />} label="Crédito" />
              <MethodButton active={method === "debit"} onClick={() => setMethod("debit")} icon={<Wallet className="size-5" />} label="Débito" />
            </div>

            <div className="bg-card border border-border/70 rounded-xl p-6 sm:p-8 shadow-[var(--shadow-card)]">
              {method === "pix" && (
                <div>
                  <h2 className="font-display text-2xl">Pague com Pix</h2>
                  <p className="mt-2 text-sm text-foreground/70">
                    Escaneie o QR Code ou copie o código abaixo no app do seu banco.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-6 items-center">
                    <div className="size-44 shrink-0 rounded-lg bg-secondary/60 border border-border/70 flex items-center justify-center">
                      <QrCode className="size-28 text-olive" strokeWidth={1} />
                    </div>
                    <div className="flex-1 w-full">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Pix copia e cola</p>
                      <code className="mt-2 block px-3 py-3 rounded-md bg-secondary/60 font-mono text-xs break-all max-h-24 overflow-auto">
                        {pixCode}
                      </code>
                      <button
                        onClick={copyPix}
                        type="button"
                        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-all"
                      >
                        {copied ? <><Check className="size-4" /> Código copiado</> : <><Copy className="size-4" /> Copiar código Pix</>}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handlePay}
                    className="mt-6 w-full rounded-full border border-olive/40 text-olive py-3 text-sm font-medium hover:bg-olive hover:text-primary-foreground transition-colors"
                  >
                    Já fiz o pagamento
                  </button>
                </div>
              )}

              {(method === "credit" || method === "debit") && (
                <form onSubmit={handlePay} className="space-y-5">
                  <div>
                    <h2 className="font-display text-2xl">
                      {method === "credit" ? "Cartão de crédito" : "Cartão de débito"}
                    </h2>
                    <p className="mt-2 text-sm text-foreground/70">Preencha os dados do seu cartão.</p>
                  </div>

                  <Field label="Nome impresso no cartão" placeholder="Como está no cartão" required />
                  <Field label="Número do cartão" placeholder="0000 0000 0000 0000" inputMode="numeric" maxLength={19} required />

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Validade" placeholder="MM/AA" maxLength={5} required />
                    <Field label="CVV" placeholder="123" inputMode="numeric" maxLength={4} required />
                  </div>

                  <Field label="CPF do titular" placeholder="000.000.000-00" inputMode="numeric" required />

                  {method === "credit" && (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                        Parcelamento
                      </label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-md bg-background border border-border/70 text-sm focus:outline-none focus:border-olive transition-colors"
                      >
                        {installmentOptions.map((n) => (
                          <option key={n} value={n}>
                            {n}x de R$ {(giftPrice / n).toFixed(2).replace(".", ",")}
                            {n === 1 ? " à vista" : " sem juros"}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs text-muted-foreground font-serif-italic">
                        Parcelamento disponível conforme o valor do presente (até {maxInstallments}x).
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-sm font-medium hover:bg-primary/90 transition-all"
                  >
                    <Lock className="size-4" />
                    Pagar R$ {giftPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </button>
                </form>
              )}
            </div>

            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3" /> Ambiente seguro · seus dados são criptografados
            </p>
          </div>

          {/* RIGHT — Summary */}
          <aside className="bg-card border border-border/70 rounded-xl p-6 h-fit lg:sticky lg:top-24 shadow-[var(--shadow-card)]">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Resumo do presente</p>
            <div className="mt-4 flex items-start gap-3">
              <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-olive shrink-0">
                <Gift className="size-5" />
              </div>
              <div>
                <p className="font-display text-lg leading-tight">{giftTitle}</p>
                <p className="text-xs text-muted-foreground font-serif-italic mt-1">Mirelle & Murilo · 10.10.2026</p>
              </div>
            </div>

            <div className="mt-6 border-t border-border/70 pt-4 space-y-2 text-sm">
              <Row label="Valor do presente" value={`R$ ${giftPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
              <Row label="Forma de pagamento" value={method === "pix" ? "Pix" : method === "credit" ? "Crédito" : "Débito"} />
              {method === "credit" && (
                <Row label="Parcelamento" value={`${installments}x de R$ ${installmentValue.toFixed(2).replace(".", ",")}`} />
              )}
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

function MethodButton({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border py-4 text-sm transition-all ${
        active
          ? "border-olive bg-secondary/60 text-olive shadow-[var(--shadow-card)]"
          : "border-border/70 bg-card text-foreground/70 hover:border-olive/50"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function Field({
  label, ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{label}</label>
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
