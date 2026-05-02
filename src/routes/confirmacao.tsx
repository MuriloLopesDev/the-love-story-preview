import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    inviteCode: "",
    attending: "yes" as "yes" | "no",
    companions: 0,
    companionNames: [] as string[],
    note: "",
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const requestedCompanions =
      form.attending === "yes" ? Math.min(10, Math.max(0, Math.floor(form.companions))) : 0;
    const companionNames = form.companionNames
      .slice(0, requestedCompanions)
      .map((name) => name.trim().slice(0, 100));
    const companions = companionNames.length;

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.inviteCode.trim() ||
      companions !== requestedCompanions ||
      companionNames.some((name) => !name) ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await addRsvp({
        name: form.name.trim().slice(0, 100),
        phone: form.phone.trim().slice(0, 30),
        inviteCode: form.inviteCode.trim().slice(0, 30),
        attending: form.attending,
        companions,
        companionNames,
        note: form.note.trim().slice(0, 500),
      });
      setDone(true);
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar sua confirmação. Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateCompanions(value: number) {
    const companions = Math.min(10, Math.max(0, Math.floor(value || 0)));

    setForm((current) => ({
      ...current,
      companions,
      companionNames:
        companions === 0
          ? []
          : Array.from({ length: companions }, (_, index) => current.companionNames[index] ?? ""),
    }));
  }

  function updateCompanionName(index: number, value: string) {
    setForm((current) => ({
      ...current,
      companionNames: current.companionNames.map((name, currentIndex) =>
        currentIndex === index ? value : name,
      ),
    }));
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
            <Link to="/" className="text-sm text-muted-foreground underline underline-offset-4">
              Voltar ao início
            </Link>
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

          <Field label="WhatsApp">
            <input
              required
              maxLength={30}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
              placeholder="(11) 99999-9999"
            />
          </Field>

          <Field label="Código do convite">
            <input
              required
              maxLength={30}
              value={form.inviteCode}
              onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
              className="input"
              placeholder="Código recebido no convite"
            />
          </Field>

          <Field label="Você poderá comparecer?">
            <div className="grid grid-cols-2 gap-3">
              {(["yes", "no"] as const).map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() =>
                    setForm({
                      ...form,
                      attending: v,
                      companions: v === "yes" ? form.companions : 0,
                      companionNames: v === "yes" ? form.companionNames : [],
                    })
                  }
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
                  onChange={(e) => updateCompanions(Number(e.target.value))}
                  className="input"
                />
              </Field>

              {form.companionNames.map((name, index) => (
                <Field key={index} label={`Nome do acompanhante ${index + 1}`}>
                  <input
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => updateCompanionName(index, e.target.value)}
                    className="input"
                    placeholder="Nome completo"
                  />
                </Field>
              ))}
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
            disabled={isSubmitting}
            className="w-full rounded-full bg-primary text-primary-foreground py-3.5 text-sm font-medium hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isSubmitting ? "Confirmando..." : "Confirmar presença"}
          </button>

          {error && (
            <p className="text-sm text-center text-destructive" role="alert">
              {error}
            </p>
          )}
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}
