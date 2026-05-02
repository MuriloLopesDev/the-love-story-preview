import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pagamento/sucesso")({
  head: () => ({
    meta: [{ title: "Pagamento aprovado - Mirelle & Murilo" }],
  }),
  component: PagamentoSucesso,
});

function PagamentoSucesso() {
  return (
    <div className="px-6 py-24 min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md text-center bg-card border border-border/70 rounded-xl p-10 shadow-[var(--shadow-card)]">
        <div className="mx-auto size-16 rounded-full bg-secondary flex items-center justify-center text-olive">
          <Check className="size-8" />
        </div>
        <h1 className="mt-6 font-display text-4xl">Obrigado pelo presente!</h1>
        <p className="mt-4 text-foreground/70 font-serif-italic">
          Mirelle & Murilo receberam seu carinho com muita gratidão.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-medium hover:bg-primary/90 transition-all"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
