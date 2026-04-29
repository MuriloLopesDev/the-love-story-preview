import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { addRsvp } from "@/lib/rsvp-store";

export const Route = createFileRoute("/confirmacao")({
  head: () => ({
    meta: [
      { title: "Confirmar presença — Mirelle & Murilo" },
      { name: "description", content: "Confirme sua presença no casamento de Mirelle e Murilo." },
    ],
  }),
  component: Confirmacao,
});

function Confirmacao() {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    attending: "yes" as "yes" | "no",
    companions: 0,
    diet: "",
    note: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addRsvp({
      name: form.name.trim().slice(0, 100),
      attending: form.attending,
      companions: Math.min(10, Math.max(0, form.companions)),
      diet: form.diet.trim().slice(0, 200),
      note: form.note.trim().slice(0, 500),
    });
    setDone(true);
  }

  if (done) {
    return (
      <div className="px-6 py-20 sm:py-32">
        <div className="max-w-lg mx-auto text-center animate-fade-up">
          <div className="size-16 mx-auto rounded-full bg-secondary flex items-center justify-center text-olive">
            <Check className="size-7" />
          </div>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl">Obrigado!</h1>
          <p className="mt-4 text-foreground/75 leading-relaxed font-serif-italic text-lg">
            {form.attending === "yes"
              ? "Sua presença vai tornar o nosso dia ainda mais especial."
              : "Sentiremos sua falta — obrigado por avisar com carinho."}
          </p>

          {form.attending === "yes" && (
            <Link
              to="/presentes"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-sm font-medium hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
            >
              Ver lista de presentes
            </Link>
          )}
          <div className="mt-4">
            <Link to="/" className="text-sm text-muted-foreground underline underline-offset-4">Voltar ao início</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-20 sm:py-24">
      <div className="max-w-xl mx-auto">
        <header className="text-center">
          <p className="divider-leaf text-xs uppercase tracking-[0.3em]">RSVP</p>
          <h1 className="mt-6 font-display text-5xl">Confirme sua presença</h1>
          <p className="mt-4 text-foreground/70">Por favor, responda até 10 de setembro de 2026.</p>
        </header>

        <form
          onSubmit={submit}
          className="mt-12 bg-card border border-border/70 rounded-lg p-6 sm:p-8 space-y-6 shadow-[var(--shadow-card)]"
        >
          <Field label="Nome do convidado">
            <input
              required
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="Seu nome completo"
            />
          </Field>

          <Field label="Você poderá comparecer?">
            <div className="grid grid-cols-2 gap-3">
              {(["yes", "no"] as const).map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setForm({ ...form, attending: v })}
                  className={`py-3 rounded-md border text-sm transition-all ${
                    form.attending === v
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  {v === "yes" ? "Sim, estarei lá" : "Não poderei ir"}
                </button>
              ))}
            </div>
          </Field>

          {form.attending === "yes" && (
            <>
              <Field label="Quantos acompanhantes?">
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={form.companions}
                  onChange={(e) => setForm({ ...form, companions: Number(e.target.value) || 0 })}
                  className="input"
                />
              </Field>

              <Field label="Restrição alimentar (opcional)">
                <input
                  maxLength={200}
                  value={form.diet}
                  onChange={(e) => setForm({ ...form, diet: e.target.value })}
                  className="input"
                  placeholder="Vegetariano, sem glúten, alergia..."
                />
              </Field>
            </>
          )}

          <Field label="Observação (opcional)">
            <textarea
              maxLength={500}
              rows={3}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="input resize-none"
              placeholder="Algum recado para os noivos?"
            />
          </Field>

          <button
            type="submit"
            className="w-full rounded-full bg-primary text-primary-foreground py-3.5 text-sm font-medium hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
          >
            Confirmar presença
          </button>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          font-family: var(--font-sans);
          color: var(--foreground);
          transition: border-color .15s, box-shadow .15s;
        }
        .input:focus { outline: none; border-color: var(--olive); box-shadow: 0 0 0 3px oklch(0.62 0.06 130 / 0.15); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{label}</span>
      {children}
    </label>
  );
}
