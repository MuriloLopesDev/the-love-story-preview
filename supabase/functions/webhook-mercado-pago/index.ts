import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type MercadoPagoPayment = {
  id?: number | string;
  status?: string;
  external_reference?: string | null;
  date_approved?: string | null;
};

type WebhookBody = {
  action?: string;
  type?: string;
  topic?: string;
  data?: {
    id?: string | number;
  };
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function mapPaymentStatus(status?: string) {
  const statuses: Record<string, string> = {
    approved: "pago",
    pending: "pendente",
    in_process: "pendente",
    rejected: "recusado",
    cancelled: "cancelado",
    refunded: "estornado",
  };

  return status ? statuses[status] : undefined;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Metodo nao permitido" }, 405);
    }

    const url = new URL(req.url);
    const body = (await req.json().catch(() => ({}))) as WebhookBody;
    const eventType = body.type ?? body.topic ?? url.searchParams.get("type") ??
      url.searchParams.get("topic") ?? "";
    const action = body.action ?? url.searchParams.get("action") ?? "";
    const isPaymentEvent = eventType === "payment" || action.startsWith("payment.");

    if (!isPaymentEvent) {
      console.log("Evento Mercado Pago ignorado:", { eventType, action });
      return jsonResponse({ ok: true, ignored: true });
    }

    const paymentId = String(
      body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "",
    ).trim();

    if (!paymentId) {
      console.warn("Evento de pagamento sem paymentId:", { eventType, action, body });
      return jsonResponse({ ok: true, ignored: true, reason: "missing_payment_id" });
    }

    const mercadoPagoAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!mercadoPagoAccessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN nao configurado");
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Credenciais administrativas do Supabase nao configuradas");
    }

    const mercadoPagoResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${mercadoPagoAccessToken}`,
        },
      },
    );

    const payment = (await mercadoPagoResponse.json()) as MercadoPagoPayment;

    if (!mercadoPagoResponse.ok) {
      console.error("Erro ao buscar pagamento no Mercado Pago:", {
        paymentId,
        status: mercadoPagoResponse.status,
        payment,
      });

      return jsonResponse(
        {
          error: "Erro ao buscar pagamento no Mercado Pago",
          details: payment,
        },
        500,
      );
    }

    const pedidoId = payment.external_reference;

    if (!pedidoId) {
      console.warn("Pagamento sem external_reference. Evento ignorado:", {
        paymentId: payment.id,
        status: payment.status,
      });
      return jsonResponse({ ok: true, ignored: true, reason: "missing_external_reference" });
    }

    const mappedStatus = mapPaymentStatus(payment.status);

    if (!mappedStatus) {
      console.warn("Status de pagamento nao mapeado. Evento ignorado:", {
        paymentId: payment.id,
        status: payment.status,
        pedidoId,
      });
      return jsonResponse({ ok: true, ignored: true, reason: "unknown_status" });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const updatePayload: Record<string, unknown> = {
      status: mappedStatus,
      mercado_pago_payment_id: String(payment.id ?? paymentId),
    };

    if (payment.status === "approved") {
      updatePayload.pago_em = payment.date_approved ?? new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from("pedidos_presentes")
      .update(updatePayload)
      .eq("id", pedidoId);

    if (updateError) {
      console.error("Erro ao atualizar pedido com pagamento Mercado Pago:", {
        pedidoId,
        paymentId: payment.id,
        status: payment.status,
        mappedStatus,
        updateError,
      });

      return jsonResponse(
        {
          error: "Erro ao atualizar pedido",
          details: updateError,
        },
        500,
      );
    }

    console.log("Pedido atualizado pelo webhook Mercado Pago:", {
      pedidoId,
      paymentId: payment.id,
      status: payment.status,
      mappedStatus,
    });

    return jsonResponse({
      ok: true,
      pedido_id: pedidoId,
      payment_id: payment.id,
      status: mappedStatus,
    });
  } catch (error) {
    console.error("Erro no webhook Mercado Pago:", error);

    return jsonResponse(
      {
        error: "Erro interno no webhook Mercado Pago",
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});
