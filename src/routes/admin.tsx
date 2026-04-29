import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, UserCheck, UserX, Utensils } from "lucide-react";
import { getRsvps, type Rsvp } from "@/lib/rsvp-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel — Mirelle & Murilo" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);

  useEffect(() => {
    setRsvps(getRsvps());
  }, []);

  const yes = rsvps.filter((r) => r.attending === "yes");
  const totalConfirmed = yes.length;
  const totalGuests = yes.reduce((sum, r) => sum + 1 + (r.companions || 0), 0);
  const declined = rsvps.length - yes.length;
  const withDiet = rsvps.filter((r) => r.diet?.trim()).length;

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        <header>
          <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Painel</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">Confirmações</h1>
          <p className="mt-2 text-muted-foreground">Acompanhe em tempo real os convidados.</p>
        </header>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={UserCheck} label="Famílias confirmadas" value={totalConfirmed} />
          <Stat icon={Users} label="Total de convidados" value={totalGuests} />
          <Stat icon={UserX} label="Não poderão ir" value={declined} />
          <Stat icon={Utensils} label="Com restrição alimentar" value={withDiet} />
        </div>

        <div className="mt-12 bg-card border border-border/70 rounded-lg overflow-hidden shadow-[var(--shadow-card)]">
          <div className="px-6 py-4 border-b border-border/70 flex items-center justify-between">
            <h2 className="font-display text-2xl">Lista de convidados</h2>
            <span className="text-xs text-muted-foreground">{rsvps.length} respostas</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Acomp.</th>
                  <th className="text-left px-4 py-3 font-medium">Restrição</th>
                  <th className="text-left px-4 py-3 font-medium">Observação</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((r) => (
                  <tr key={r.id} className="border-t border-border/60 hover:bg-secondary/30">
                    <td className="px-6 py-4 font-medium">{r.name}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${
                          r.attending === "yes"
                            ? "bg-olive/15 text-olive"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {r.attending === "yes" ? "Confirmado" : "Não vai"}
                      </span>
                    </td>
                    <td className="px-4 py-4">{r.companions}</td>
                    <td className="px-4 py-4 text-muted-foreground">{r.diet || "—"}</td>
                    <td className="px-4 py-4 text-muted-foreground max-w-xs truncate">{r.note || "—"}</td>
                  </tr>
                ))}
                {rsvps.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhuma confirmação ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Prévia visual • dados salvos localmente neste navegador
        </p>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="bg-card border border-border/70 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="size-4 text-olive" />
      </div>
      <p className="mt-3 font-display text-4xl">{value}</p>
    </div>
  );
}
