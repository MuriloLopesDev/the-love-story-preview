import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { registrarConfirmacaoPresenca } from "@/services/confirmacaoPresencaService";

export const Route = createFileRoute("/confirmacao")({
  head: () => ({
    meta: [
      { title: "Confirmar presença — Murilo & Mirelle" },
      { name: "description", content: "Confirme sua presença no casamento de Murilo e Mirelle." },
    ],
  }),
  component: Confirmacao,
});

function Confirmacao() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [companionError, setCompanionError] = useState("");
  const [form, setForm] = useState({
    attending: "yes" as "yes" | "no",
    companions: 0,
    companionNames: [] as string[],
  });

  function getValidCompanionCount(value: number | string) {
    const parsed = typeof value === "number" ? value : Number(value.replace(/\D/g, ""));
    return Math.min(10, Math.max(0, Number.isFinite(parsed) ? Math.floor(parsed) : 0));
  }

  function updateCompanions(value: number | string) {
    const companions = getValidCompanionCount(value);
    setFormError("");
    setCompanionError("");
    setForm((current) => ({
      ...current,
      companions,
      companionNames: Array.from(
        { length: companions },
        (_, index) => current.companionNames[index] ?? "",
      ),
    }));
  }

  function adjustCompanions(delta: number) {
    setFormError("");
    setCompanionError("");
    setForm((current) => {
      const companions = getValidCompanionCount(current.companions + delta);

      return {
        ...current,
        companions,
        companionNames: Array.from(
          { length: companions },
          (_, index) => current.companionNames[index] ?? "",
        ),
      };
    });
  }

  function updateCompanionName(index: number, name: string) {
    setFormError("");
    setCompanionError("");
    setForm((current) => {
      const companionNames = [...current.companionNames];
      companionNames[index] = name;
      return { ...current, companionNames };
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const guestName = String(formData.get("guestName") ?? "").trim();
    const note = String(formData.get("note") ?? "").trim();
    const companionCount = getValidCompanionCount(
      String(formData.get("companions") ?? form.companions),
    );
    const companionNames =
      form.attending === "yes"
        ? formData.getAll("companionNames").map((name) => String(name).trim().slice(0, 100))
        : [];

    setFormError("");
    setCompanionError("");

    if (!guestName) {
      setFormError("Por favor, informe o nome do convidado.");
      return;
    }

    if (
      form.attending === "yes" &&
      companionCount > 0 &&
      (companionNames.length !== companionCount || companionNames.some((name) => !name))
    ) {
      setCompanionError("Por favor, informe o nome de todos os acompanhantes.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registrarConfirmacaoPresenca({
        nome_convidado: guestName.slice(0, 100),
        telefone: null,
        codigo_convite: null,
        vai_comparecer: form.attending === "yes",
        quantidade_acompanhantes: form.attending === "yes" ? companionCount : 0,
        nomes_acompanhantes: companionNames,
        mensagem_noivos: note ? note.slice(0, 500) : null,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Erro ao registrar confirmação:", error);
      setFormError("Não foi possível registrar sua resposta. Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    const attending = form.attending === "yes";

    return (
      <div className="px-6 py-20 sm:py-32">
        <div className="max-w-lg mx-auto text-center animate-fade-up bg-card border border-border/70 rounded-lg p-8 sm:p-10 shadow-[var(--shadow-card)]">
          <div className="size-16 mx-auto rounded-full bg-secondary flex items-center justify-center text-olive">
            <Check className="size-7" />
          </div>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl">
            {attending ? "Presença confirmada com sucesso!" : "Resposta registrada com sucesso."}
          </h1>
          <p className="mt-4 text-foreground/75 leading-relaxed font-serif-italic text-lg">
            {attending
              ? "Ficamos muito felizes em saber que você estará conosco nesse dia tão especial."
              : "Sentiremos sua falta, mas agradecemos por nos avisar."}
          </p>

          {attending ? (
            <Link
              to="/presentes"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-sm font-medium hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
            >
              Ir para lista de presentes
            </Link>
          ) : (
            <Link
              to="/"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-sm font-medium hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
            >
              Voltar ao início
            </Link>
          )}
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
          <p className="mt-4 text-foreground/70">
            <b>Por favor, responda até 10 de setembro de 2026.</b>
          </p>
        </header>

        <form
          onSubmit={submit}
          className="mt-12 bg-card border border-border/70 rounded-lg p-6 sm:p-8 space-y-6 shadow-[var(--shadow-card)]"
          noValidate
        >
          <Field label="Nome do convidado">
            <input
              name="guestName"
              maxLength={100}
              onChange={() => {
                setFormError("");
              }}
              className="input"
              placeholder="Seu nome completo"
            />
            {formError && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {formError}
              </p>
            )}
          </Field>

          <Field label="Você poderá comparecer?">
            <div className="grid grid-cols-2 gap-3">
              {(["yes", "no"] as const).map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => {
                    setFormError("");
                    setCompanionError("");
                    setForm({
                      ...form,
                      attending: v,
                      companions: v === "yes" ? form.companions : 0,
                      companionNames: v === "yes" ? form.companionNames : [],
                    });
                  }}
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
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade de acompanhantes"
                    onClick={() => adjustCompanions(-1)}
                    className="quantity-button"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={0}
                    max={10}
                    name="companions"
                    value={form.companions}
                    onChange={(e) => updateCompanions(e.target.value)}
                    className="input text-center"
                    aria-label="Quantidade de acompanhantes"
                  />
                  <button
                    type="button"
                    aria-label="Aumentar quantidade de acompanhantes"
                    onClick={() => adjustCompanions(1)}
                    className="quantity-button"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </Field>

              {form.companionNames.length > 0 && (
                <div className="space-y-4">
                  {form.companionNames.map((name, index) => (
                    <Field key={index} label={`Nome do acompanhante ${index + 1}`}>
                      <input
                        name="companionNames"
                        maxLength={100}
                        defaultValue={name}
                        onChange={(e) => updateCompanionName(index, e.target.value)}
                        className="input"
                        placeholder="Nome completo do acompanhante"
                      />
                    </Field>
                  ))}
                  {companionError && (
                    <p className="text-sm text-destructive" role="alert">
                      {companionError}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          <Field label="Mensagem para os noivos (opcional)">
            <textarea
              name="note"
              maxLength={500}
              rows={3}
              className="input resize-none"
              placeholder="Deixe uma mensagem especial para os noivos"
            />
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-primary text-primary-foreground py-3.5 text-sm font-medium hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isSubmitting ? "Confirmando..." : "Confirmar presença"}
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
        .quantity-button {
          flex: 0 0 auto;
          width: 2.75rem;
          height: 2.75rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: var(--background);
          color: var(--primary);
          transition: border-color .15s, background-color .15s, transform .15s;
        }
        .quantity-button:hover { border-color: var(--olive); background: var(--secondary); }
        .quantity-button:active { transform: scale(0.96); }
        .quantity-button:focus-visible { outline: none; border-color: var(--olive); box-shadow: 0 0 0 3px oklch(0.62 0.06 130 / 0.15); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </span>
      {children}
    </div>
  );
}
