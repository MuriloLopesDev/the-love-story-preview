import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { PaymentReturnPage, type MercadoPagoReturnParams } from "@/components/PaymentReturnPage";

export const Route = createFileRoute("/pagamento/falha")({
  head: () => ({
    meta: [
      { title: "Pagamento não concluído - Murilo & Mirelle" },
      { name: "description", content: "Não foi possível concluir o pagamento." },
    ],
  }),
  validateSearch: parseMercadoPagoReturnParams,
  component: PagamentoFalha,
});

function PagamentoFalha() {
  const params = Route.useSearch();

  return (
    <PaymentReturnPage
      icon={<X className="size-8" />}
      title="Pagamento não concluído"
      message="Não foi possível concluir o pagamento. Você pode tentar novamente ou escolher outro meio de pagamento."
      params={params}
      primaryAction={{ label: "Tentar novamente", href: "/presentes" }}
      secondaryAction={{ label: "Voltar para presentes", to: "/presentes" }}
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
