import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PaymentReturnPage, type MercadoPagoReturnParams } from "@/components/PaymentReturnPage";

export const Route = createFileRoute("/pagamento/sucesso")({
  head: () => ({
    meta: [
      { title: "Pagamento aprovado - Murilo & Mirelle" },
      { name: "description", content: "Pagamento aprovado. Obrigado pelo presente." },
    ],
  }),
  validateSearch: parseMercadoPagoReturnParams,
  component: PagamentoSucesso,
});

function PagamentoSucesso() {
  const params = Route.useSearch();

  return (
    <PaymentReturnPage
      icon={<Check className="size-8" />}
      title="Pagamento aprovado!"
      message="Obrigado pelo carinho. Recebemos a confirmação do seu presente com muito amor."
      safeFallbackMessage="Pagamento aprovado. Obrigado pelo presente!"
      params={params}
      primaryAction={{ label: "Voltar para presentes", to: "/presentes" }}
      secondaryAction={{ label: "Ir para o início", to: "/" }}
    />
  );
}

function parseMercadoPagoReturnParams(search: Record<string, unknown>): MercadoPagoReturnParams {
  return {
    collection_id: asString(search.collection_id),
    collection_status: asString(search.collection_status),
    payment_id: asString(search.payment_id),
    status: asString(search.status),
    external_reference: asString(search.external_reference),
  };
}

function asString(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);

  return typeof value === "string" && value.trim() ? value : undefined;
}
