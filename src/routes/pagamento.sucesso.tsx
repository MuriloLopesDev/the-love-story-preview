import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pagamento/sucesso")({
  head: () => ({
    meta: [
      { title: "Pagamento recebido - Murilo & Mirelle" },
      { name: "description", content: "Obrigado pelo presente." },
    ],
  }),
  component: PagamentoSucesso,
});

function PagamentoSucesso() {
  return (
    <PaymentReturnCard
      icon={<Check className="size-8" />}
      title="Obrigado pelo presente!"
      text="Seu pagamento foi recebido ou está em processamento. Assim que confirmado, registraremos seu presente com carinho."
      buttonText="Voltar ao início"
      to="/"
    />
  );
}

function PaymentReturnCard({
  icon,
  title,
  text,
  buttonText,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  buttonText: string;
  to: "/";
}) {
  return (
    <div className="px-6 py-20 sm:py-28">
      <div className="max-w-lg mx-auto text-center bg-card border border-border/70 rounded-xl p-8 sm:p-10 shadow-[var(--shadow-card)] animate-fade-up">
        <div className="mx-auto size-16 rounded-full bg-secondary flex items-center justify-center text-olive">
          {icon}
        </div>
        <h1 className="mt-6 font-display text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-4 text-foreground/75 leading-relaxed font-serif-italic text-lg">{text}</p>
        <Link
          to={to}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-sm font-medium hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
