import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { RefreshCw, Users, UserCheck, UserX } from "lucide-react";
import { getRsvps, type Rsvp } from "@/lib/rsvp-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Painel — Mirelle & Murilo" }, { name: "robots", content: "noindex" }],
  }),
  component: Admin,
});

const ADMIN_SESSION_KEY = "mirelle-murilo-admin-authorized";

function Admin() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem(ADMIN_SESSION_KEY) === "true",
  );
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(isAuthorized);
  const [error, setError] = useState("");

  async function loadRsvps() {
    setIsLoading(true);
    setError("");

    try {
      setRsvps(await getRsvps());
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar as confirmações.");
    } finally {
      setIsLoading(false);
    }
  }

  function unlockAdmin(e: FormEvent) {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (adminPassword && password === adminPassword) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setIsAuthorized(true);
      setAuthError("");
      return;
    }

    setAuthError("Senha incorreta.");
  }

  useEffect(() => {
    if (isAuthorized) {
      void loadRsvps();
    }
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="px-6 py-20 sm:py-24">
        <div className="max-w-sm mx-auto">
          <header className="text-center">
            <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Painel</p>
            <h1 className="mt-6 font-display text-4xl">Acesso restrito</h1>
            <p className="mt-3 text-muted-foreground">Digite a senha para ver as confirmações.</p>
          </header>

          <form
            onSubmit={unlockAdmin}
            className="mt-10 bg-card border border-border/70 rounded-lg p-6 space-y-5 shadow-[var(--shadow-card)]"
          >
            <label className="block">
              <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Senha
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-olive focus:shadow-[0_0_0_3px_oklch(0.62_0.06_130_/_0.15)]"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-primary text-primary-foreground py-3.5 text-sm font-medium hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
            >
              Entrar
            </button>

            {authError && (
              <p className="text-sm text-center text-destructive" role="alert">
                {authError}
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  const yes = rsvps.filter((r) => r.attending === "yes");
  const totalConfirmed = yes.length;
  const totalGuests = yes.reduce((sum, r) => {
    return sum + 1 + getValidCompanionNames(r).length;
  }, 0);
  const declined = rsvps.length - yes.length;

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        <header>
          <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Painel</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">Confirmações</h1>
          <p className="mt-2 text-muted-foreground">Acompanhe em tempo real os convidados.</p>
        </header>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Stat icon={UserCheck} label="Famílias confirmadas" value={totalConfirmed} />
          <Stat icon={Users} label="Total de convidados" value={totalGuests} />
          <Stat icon={UserX} label="Não poderão ir" value={declined} />
        </div>

        <div className="mt-12 bg-card border border-border/70 rounded-lg overflow-hidden shadow-[var(--shadow-card)]">
          <div className="px-6 py-4 border-b border-border/70 flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl">Lista de convidados</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{rsvps.length} respostas</span>
              <button
                type="button"
                onClick={loadRsvps}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Atualizar lista
              </button>
            </div>
          </div>

          {error && (
            <p className="px-6 pt-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 font-medium">WhatsApp</th>
                  <th className="text-left px-4 py-3 font-medium">Código</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Acompanhantes</th>
                  <th className="text-left px-4 py-3 font-medium">Observação</th>
                  <th className="text-left px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Carregando confirmações...
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  rsvps.map((r) => (
                    <tr key={r.id} className="border-t border-border/60 hover:bg-secondary/30">
                      <td className="px-6 py-4 font-medium">{r.name}</td>
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                        {r.phone || "—"}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                        {r.inviteCode || "—"}
                      </td>
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
                      <td className="px-4 py-4 text-muted-foreground min-w-48">
                        <CompanionNames names={getValidCompanionNames(r)} />
                      </td>
                      <td className="px-4 py-4 text-muted-foreground max-w-xs truncate">
                        {r.note || "—"}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                        {formatRsvpDate(r.createdAt)}
                      </td>
                    </tr>
                  ))}
                {!isLoading && rsvps.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhuma confirmação ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Dados carregados do Supabase
        </p>
      </div>
    </div>
  );
}

function getValidCompanionNames(rsvp: Rsvp) {
  return Array.isArray(rsvp.companionNames)
    ? rsvp.companionNames.map((name) => name.trim()).filter(Boolean)
    : [];
}

function CompanionNames({ names }: { names: string[] }) {
  if (names.length === 0) {
    return <span>Nenhum</span>;
  }

  return (
    <ul className="space-y-1">
      {names.map((name, index) => (
        <li key={`${name}-${index}`}>{name}</li>
      ))}
    </ul>
  );
}

function formatRsvpDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
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
