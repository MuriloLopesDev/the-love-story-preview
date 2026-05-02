import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Plane } from "lucide-react";

export const Route = createFileRoute("/presentes")({
  head: () => ({
    meta: [
      { title: "Presentes — Mirelle & Murilo" },
      { name: "description", content: "Lista de presentes, Pix e cotas de lua de mel." },
    ],
  }),
  component: Presentes,
});

const honeymoon = [
  { title: "Presente teste", desc: "Item simbólico para testar o pagamento", price: 0.01 },
  { title: "Passagem aérea", desc: "Voo do casal para a Toscana", price: 980 },
  { title: "Jantar à beira-mar", desc: "Uma noite italiana inesquecível", price: 350 },
  { title: "Tour pelos vinhedos", desc: "Degustação em Chianti", price: 480 },
  { title: "Hospedagem boutique", desc: "Diária em hotel charmoso", price: 720 },
];

const symbolic = [
  { title: "Jogo de taças de cristal", price: 290 },
  { title: "Aparelho de jantar", price: 540 },
  { title: "Roupa de cama king", price: 380 },
  { title: "Conjunto de panelas", price: 690 },
];

function Presentes() {
  return (
    <div className="px-6 py-20 sm:py-24">
      <div className="max-w-5xl mx-auto">
        <header className="text-center max-w-2xl mx-auto">
          <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Presentes</p>
          <h1 className="mt-6 font-display text-5xl sm:text-6xl">Com gratidão</h1>
          <p className="mt-6 text-foreground/70 leading-relaxed">
            Sua presença é o nosso maior presente. Mas, se quiser nos ajudar a construir essa nova fase,
            preparamos algumas opções com muito carinho.
          </p>
        </header>

        {/* HONEYMOON */}
        <section className="mt-14">
          <div className="flex items-end justify-between flex-wrap gap-2">
            <div>
              <p className="font-serif-italic text-olive">Cotas de lua de mel</p>
              <h2 className="font-display text-3xl">Toscana, Itália</h2>
            </div>
            <Plane className="size-5 text-olive" />
          </div>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {honeymoon.map((g) => (
              <GiftCard key={g.title} title={g.title} desc={g.desc} price={g.price} />
            ))}
          </div>
        </section>

        {/* SYMBOLIC */}
        <section className="mt-16">
          <div>
            <p className="font-serif-italic text-olive">Presentes simbólicos</p>
            <h2 className="font-display text-3xl">Para o nosso lar</h2>
          </div>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {symbolic.map((g) => (
              <GiftCard key={g.title} title={g.title} price={g.price} />
            ))}
          </div>
        </section>

        <p className="mt-16 text-center text-sm text-muted-foreground font-serif-italic">
          Pagamentos no crédito podem ser parcelados em até 12x.
        </p>
      </div>
    </div>
  );
}

function GiftCard({ title, desc, price }: { title: string; desc?: string; price: number }) {
  const formattedPrice = price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const paymentText =
    price < 12
      ? "pagamento único"
      : `ou 12x de ${(price / 12).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}`;

  return (
    <div className="group bg-card border border-border/70 rounded-lg p-6 flex flex-col hover:shadow-[var(--shadow-card)] hover:-translate-y-1 transition-all">
      <h3 className="font-display text-xl">{title}</h3>
      {desc && <p className="mt-1 text-sm text-muted-foreground font-serif-italic">{desc}</p>}
      <p className="mt-4 text-2xl font-display text-olive">
        {formattedPrice}
      </p>
      <p className="text-xs text-muted-foreground">{paymentText}</p>
      <Link
        to="/pagamento"
        search={{ title, price }}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 text-primary py-2.5 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <CreditCard className="size-4" /> Presentear
      </Link>
    </div>
  );
}
