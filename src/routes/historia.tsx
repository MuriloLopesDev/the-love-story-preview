import { createFileRoute } from "@tanstack/react-router";
import couple1 from "@/assets/couple-1.jpg";
import couple2 from "@/assets/couple-2.jpg";

export const Route = createFileRoute("/historia")({
  head: () => ({
    meta: [
      { title: "Nossa história — Mirelle & Murilo" },
      { name: "description", content: "Como Mirelle e Murilo se encontraram e decidiram celebrar o amor." },
    ],
  }),
  component: Historia,
});

function Historia() {
  return (
    <div className="px-6 py-20 sm:py-28">
      <div className="max-w-5xl mx-auto">
        <header className="text-center max-w-2xl mx-auto animate-fade-up">
          <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Nossa história</p>
          <h1 className="mt-6 font-display text-5xl sm:text-6xl">De acaso a para sempre</h1>
          <p className="mt-6 text-foreground/70 leading-relaxed">
            Cada relacionamento tem seu próprio ritmo. O nosso começou devagar, em uma tarde
            qualquer, e foi se tornando inevitável.
          </p>
        </header>

        <div className="mt-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <img
            src={couple1}
            alt="O casal caminhando"
            loading="lazy"
            width={1024}
            height={1280}
            className="rounded-md shadow-[var(--shadow-card)] object-cover w-full aspect-[4/5]"
          />
          <div className="animate-fade-up">
            <p className="font-serif-italic text-olive text-lg">Capítulo um</p>
            <h2 className="mt-2 font-display text-3xl">O encontro</h2>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              Foi em uma roda de amigos em comum. Uma conversa sobre música acabou virando madrugada.
              No dia seguinte, a primeira mensagem. Na semana seguinte, o primeiro café.
              E desde então, todos os dias.
            </p>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="md:order-2">
            <img
              src={couple2}
              alt="Mãos com alianças"
              loading="lazy"
              width={1024}
              height={1280}
              className="rounded-md shadow-[var(--shadow-card)] object-cover w-full aspect-[4/5]"
            />
          </div>
          <div className="md:order-1 animate-fade-up">
            <p className="font-serif-italic text-olive text-lg">Capítulo dois</p>
            <h2 className="mt-2 font-display text-3xl">O pedido</h2>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              Em uma viagem simples, sem grandes preparativos, apenas nós dois e o silêncio do mar
              ao fundo, veio a pergunta mais natural do mundo. E também a resposta mais natural.
            </p>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              Agora queremos compartilhar este momento com quem caminhou conosco até aqui.
            </p>
          </div>
        </div>

        <div className="mt-24 text-center">
          <p className="font-serif-italic text-2xl text-olive">"E assim, escolhemos um ao outro — todos os dias."</p>
        </div>
      </div>
    </div>
  );
}
