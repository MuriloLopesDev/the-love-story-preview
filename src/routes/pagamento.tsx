import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CreditCard, Gift, Lock } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

type SearchParams = { title?: string; price?: number };

export const Route = createFileRoute("/pagamento")({
  head: () => ({
    meta: [
      { title: "Pagamento - Mirelle & Murilo" },
      { name: "description", content: "Finalize seu presente pelo Mercado Pago." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    title: typeof search.title === "string" ? search.title : undefined,
    price: search.price ? Number(search.price) : undefined,
  }),
  component: Pagamento,
});

function Pagamento() {
  const { title, price } = Route.useSearch();
  const giftTitle = title ?? "Presente para os noivos";
  const giftPrice = price && price > 0 ? price : 200;
  const formattedPrice = formatCurrency(giftPrice);

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handlePay(e: FormEvent) {
    e.preventDefault();

    const cleanBuyerName = buyerName.trim().slice(0, 120);
    const cleanBuyerPhone = buyerPhone.trim().slice(0, 30);

    if (!cleanBuyerName || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const supabase = getSupabaseClient();
      const { data: order, error: orderError } = await supabase
        .from("gift_orders")
        .insert({
          gift_title: giftTitle,
          amount: giftPrice,
          buyer_name: cleanBuyerName,
          buyer_phone: cleanBuyerPhone || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      const orderId = String(order.id);
      const { data: preference, error: preferenceError } = await supabase.functions.invoke(
        "create-mercado-pago-preference",
        {
          body: {
            orderId,
            title: giftTitle,
            price: giftPrice,
            buyerName: cleanBuyerName,
            buyerPhone: cleanBuyerPhone,
          },
        },
      );

      if (preferenceError) throw preferenceError;

      const initPoint = preference?.init_point;
      const preferenceId = preference?.preference_id;

      if (!initPoint) {
        throw new Error("Mercado Pago nao retornou o link de pagamento.");
      }

      if (preferenceId) {
        await supabase
          .from("gift_orders")
          .update({ mercado_pago_preference_id: preferenceId })
          .eq("id", orderId);
      }

      window.location.href = initPoint;
    } catch (err) {
      console.error(err);
      setError("Nao foi possivel iniciar o pagamento. Tente novamente em instantes.");
      setIsSubmitting(false);
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
            Informe seus dados e siga para o checkout seguro do Mercado Pago.
          </p>
        </header>

        <div className="mt-12 grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-8">
            <form
              onSubmit={handlePay}
              className="bg-card border border-border/70 rounded-xl p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-5"
            >
              <div>
                <h2 className="font-display text-2xl">Dados de quem presenteia</h2>
                <p className="mt-2 text-sm text-foreground/70">
                  Usaremos essas informações apenas para identificar seu presente.
                </p>
              </div>

              <Field
                label="Nome de quem está presenteando"
                required
                maxLength={120}
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Seu nome completo"
              />

              <Field
                label="WhatsApp (opcional)"
                maxLength={30}
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-70"
              >
                <CreditCard className="size-4" />
                {isSubmitting ? "Abrindo pagamento..." : "Ir para pagamento"}
              </button>

              {error && (
                <p className="text-sm text-center text-destructive" role="alert">
                  {error}
                </p>
              )}
            </form>

            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3" /> Checkout seguro processado pelo Mercado Pago
            </p>
          </div>

          <aside className="bg-card border border-border/70 rounded-xl p-6 h-fit lg:sticky lg:top-24 shadow-[var(--shadow-card)]">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Resumo do presente</p>
            <div className="mt-4 flex items-start gap-3">
              <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-olive shrink-0">
                <Gift className="size-5" />
              </div>
              <div>
                <p className="font-display text-lg leading-tight">{giftTitle}</p>
                <p className="text-xs text-muted-foreground font-serif-italic mt-1">
                  Mirelle & Murilo - 10.10.2026
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-border/70 pt-4 flex items-end justify-between">
              <span className="text-sm text-foreground/70">Total</span>
              <span className="font-display text-2xl text-olive">{formattedPrice}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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
