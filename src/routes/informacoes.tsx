import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, Shirt } from "lucide-react";
import venueImg from "@/assets/venue.jpg";

export const Route = createFileRoute("/informacoes")({
  head: () => ({
    meta: [
      { title: "Informações - Murilo & Mirelle" },
      { name: "description", content: "Data, horário, local da cerimônia e da festa, dress code." },
    ],
  }),
  component: Informacoes,
});

const items = [
  { icon: Calendar, label: "Data", value: "Sábado, 10 de outubro de 2026" },
  { icon: Clock, label: "Horário", value: "Cerimônia às 16h30 • Recepção às 18h30" },
  { icon: MapPin, label: "Cerimônia", value: "Chácara Prímula" },
  { icon: MapPin, label: "Festa", value: "Chácara Prímula" },
  { icon: Shirt, label: "Dress code", value: "Traje social para casamento" },
];

const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Ch%C3%A1cara%20Pr%C3%ADmula%20Rua%20Jer%C3%B4nimo%20Arroyo%20716%20S%C3%A3o%20Jos%C3%A9%20do%20Rio%20Preto%20SP";

function Informacoes() {
  return (
    <div className="px-6 pt-10 pb-20 sm:pt-12 sm:pb-28">
      <div className="max-w-5xl mx-auto">
        <header className="text-center max-w-2xl mx-auto">
          <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Informações</p>
          <h1 className="mt-6 font-display text-5xl sm:text-6xl">O grande dia</h1>
          <p className="mt-6 text-foreground/70">
            Tudo o que você precisa saber para celebrar conosco.
          </p>
        </header>

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          {items.map((it) => (
            <div
              key={it.label}
              className="bg-card rounded-lg border border-border/70 p-6 flex gap-4 items-start hover:shadow-[var(--shadow-card)] transition-shadow"
            >
              <div className="size-11 shrink-0 rounded-full bg-secondary flex items-center justify-center text-olive">
                <it.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {it.label}
                </p>
                <p className="mt-1 font-serif-italic text-lg text-foreground">{it.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="font-display text-3xl text-center">Localização</h2>
          <div className="mt-6 relative h-[320px] sm:h-auto sm:aspect-[16/8] rounded-lg overflow-hidden border border-border/70">
            <img
              src={venueImg}
              alt="Local do casamento"
              loading="lazy"
              className="absolute inset-0 size-full object-cover opacity-90"
              width={1536}
              height={1024}
            />
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center p-6">
              <div className="bg-background/90 backdrop-blur px-6 py-5 rounded-lg text-center shadow-[var(--shadow-card)] w-full max-w-sm">
                <MapPin className="size-5 mx-auto text-olive" />
                <p className="mt-2 font-serif-italic text-xl">Chácara Prímula</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rua Jerônimo Arroyo, 716 - São José do Rio Preto, SP
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-xs font-medium hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
                >
                  Abrir no Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-sm font-medium hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
