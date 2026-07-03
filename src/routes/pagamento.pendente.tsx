import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { PaymentReturnPage, type MercadoPagoReturnParams } from "@/components/PaymentReturnPage";

export const Route = createFileRoute("/pagamento/pendente")({
  head: () => ({
    meta: [
      { title: "Pagamento em análise - Murilo & Mirelle" },
      { name: "description", content: "Pagamento pendente pelo Mercado Pago." },
    ],
  }),
  validateSearch: parseMercadoPagoReturnParams,
  component: PagamentoPendente,
});

function PagamentoPendente() {
  const params = Route.useSearch();

  return (
    <PaymentReturnPage
      icon={<Clock className="size-8" />}
      title="Pagamento em análise"
      message="Seu pagamento está pendente. Assim que o Mercado Pago confirmar, atualizaremos o status do presente."
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
