import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImg}
          alt="Eucalipto e flores delicadas"
          className="absolute inset-0 size-full object-cover"
          width={1536}
          height={1024}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 bg-background/30" />

        <div className="relative z-10 text-center px-6 max-w-3xl animate-fade-in-slow">
          <p className="divider-leaf text-sm tracking-[0.3em] uppercase">Save the date</p>
          <h1 className="mt-6 font-display text-6xl sm:text-8xl md:text-9xl leading-[0.95] text-balance">
            Mirelle
            <span className="block font-serif-italic text-4xl sm:text-5xl md:text-6xl text-olive my-2">&</span>
            Murilo
          </h1>
          <p className="mt-6 font-serif-italic text-xl sm:text-2xl text-foreground/80">
            10 de outubro de 2026
          </p>
          <p className="mt-4 max-w-md mx-auto text-foreground/70 text-balance">
            Depois de tantos capítulos juntos, escolhemos esse dia para começar o mais bonito de todos.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/confirmacao"
              className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-sm tracking-wide font-medium hover:bg-primary/90 transition-all hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5"
            >
              Confirmar presença
            </Link>
            <Link
              to="/informacoes"
              className="inline-flex items-center justify-center rounded-full border border-primary/40 text-primary px-8 py-3.5 text-sm tracking-wide font-medium hover:bg-primary/5 transition-colors"
            >
              Ver informações
            </Link>
          </div>
        </div>
      </section>

      {/* COUNTDOWN / PRELUDE */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Faltam poucos meses</p>
          <h2 className="mt-6 font-display text-4xl sm:text-5xl">Um convite para celebrar o amor</h2>
          <p className="mt-6 text-foreground/70 leading-relaxed text-balance">
            Será uma alegria imensa ter você ao nosso lado nesse dia. Reservamos esta página com carinho
            para que você acompanhe cada detalhe do nosso grande dia.
          </p>
          <Link
            to="/historia"
            className="mt-8 inline-flex items-center gap-2 text-olive font-serif-italic text-lg hover:gap-3 transition-all"
          >
            conheça a nossa história →
          </Link>
        </div>
      </section>
    </div>
  );
}
