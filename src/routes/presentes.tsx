import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Gift } from "lucide-react";
import { listarPresentes, type Presente } from "@/services/presentesService";

export const Route = createFileRoute("/presentes")({
  head: () => ({
    meta: [
      { title: "Presentes - Murilo & Mirelle" },
      { name: "description", content: "Lista de presentes e cotas de lua de mel." },
    ],
  }),
  component: Presentes,
});

function Presentes() {
  const [presentes, setPresentes] = useState<Presente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPresentes() {
      setLoading(true);
      setError("");

      try {
        const data = await listarPresentes();
        if (active) setPresentes(data);
      } catch (err) {
        console.error("Erro ao carregar presentes:", err);
        if (active) setError("Não foi possível carregar a lista de presentes agora.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPresentes();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="px-6 pt-10 pb-20 sm:pt-12 sm:pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="text-center max-w-2xl mx-auto">
          <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Presentes</p>
          <h1 className="mt-6 font-display text-5xl sm:text-6xl">Com gratidão</h1>
          <p className="mt-6 text-foreground/70 leading-relaxed">
            Sua presença é o nosso maior presente. Mas, se quiser nos ajudar a construir essa nova
            fase, preparamos algumas opções com muito carinho.
          </p>
        </header>

        {loading && (
          <p className="mt-12 text-center text-muted-foreground font-serif-italic">
            Carregando lista de presentes...
          </p>
        )}

        {!loading && error && (
          <div className="mt-12 bg-card border border-border/70 rounded-lg p-6 text-center text-muted-foreground shadow-[var(--shadow-card)]">
            {error}
          </div>
        )}

        {!loading && !error && presentes.length === 0 && (
          <div className="mt-12 bg-card border border-border/70 rounded-lg p-6 text-center text-muted-foreground shadow-[var(--shadow-card)]">
            Nenhum presente ativo cadastrado no momento.
          </div>
        )}

        {!loading && !error && presentes.length > 0 && (
          <section className="mt-12">
            <div className="grid grid-cols-2 min-[420px]:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 items-stretch">
              {presentes.map((presente, index) => (
                <GiftCard key={presente.id} presente={presente} index={index} />
              ))}
            </div>
          </section>
        )}

        <p className="mt-12 text-center text-sm text-muted-foreground font-serif-italic">
          Pagamentos no crédito podem ser parcelados em até 12x.
        </p>
      </div>
    </div>
  );
}

function GiftCard({ presente, index }: { presente: Presente; index: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(presente.imagem_url) && !imageFailed;
  const price = presente.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const installment = (presente.preco / 12).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <article
      className="group animate-fade-up flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_16px_44px_-34px_rgba(69,81,48,0.55)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-[0_24px_58px_-32px_rgba(69,81,48,0.72)]"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
<div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#f8f6ef]">
  {hasImage ? (
    <>
      <img
        src={presente.imagem_url ?? ""}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl opacity-25 select-none pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center p-2 sm:p-3">
        <img
          src={presente.imagem_url ?? ""}
          alt={presente.titulo}
          onError={() => setImageFailed(true)}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
    </>
  ) : (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 sm:gap-2 lg:gap-3 bg-[linear-gradient(135deg,var(--secondary),var(--champagne))] text-primary">
      <span className="flex size-9 sm:size-11 lg:size-14 items-center justify-center rounded-full bg-card/80 shadow-[var(--shadow-soft)]">
        <Gift className="size-5 sm:size-6 lg:size-7" />
      </span>
      <span className="text-[0.6rem] sm:text-[0.65rem] lg:text-xs uppercase tracking-[0.18em] lg:tracking-[0.24em] text-primary/70">
        Presente
      </span>
    </div>
  )}
</div>

      <div className="flex flex-1 flex-col p-3 sm:p-4 lg:p-6">
        <div className="flex-1">
          <h3 className="font-display text-base sm:text-lg lg:text-2xl leading-tight">
            {presente.titulo}
          </h3>
          {presente.descricao && (
            <p className="mt-2 lg:mt-3 line-clamp-2 lg:min-h-12 text-[0.7rem] sm:text-xs lg:text-sm leading-snug lg:leading-relaxed text-muted-foreground">
              {presente.descricao}
            </p>
          )}
        </div>

        <div className="mt-3 sm:mt-4 lg:mt-6 border-t border-border/70 pt-3 sm:pt-4 lg:pt-5">
          <p className="font-display text-xl sm:text-2xl lg:text-3xl leading-none text-olive">
            {price}
          </p>
          <p className="mt-1 lg:mt-2 text-[0.65rem] sm:text-[0.7rem] lg:text-xs text-muted-foreground">
            ou 12x de {installment}
          </p>
        </div>

        <Link
          to="/pagamento"
          search={{
            presenteId: presente.id,
            title: presente.titulo,
            price: presente.preco,
          }}
          className="mt-3 sm:mt-4 lg:mt-6 inline-flex w-full items-center justify-center gap-1.5 lg:gap-2 rounded-full bg-primary px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-[0.7rem] sm:text-xs lg:text-sm font-medium text-primary-foreground shadow-[0_14px_30px_-22px_rgba(69,81,48,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_18px_34px_-20px_rgba(69,81,48,0.9)]"
        >
          <CreditCard className="size-3.5 lg:size-4 text-primary-foreground" /> Presentear
        </Link>
      </div>
    </article>
  );
}
