import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PixPaymentResponse = {
  id?: number | string;
  status?: string;
  date_of_expiration?: string | null;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string | null;
      qr_code_base64?: string | null;
      ticket_url?: string | null;
    };
  };
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function splitName(fullName: string) {
  const nameParts = fullName.trim().split(/\s+/);

  return {
    firstName: nameParts[0],
    lastName: nameParts.slice(1).join(" ") || "",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Metodo nao permitido" }, 405);
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

    const body = await req.json();
    const {
      presente_id,
      titulo_presente,
      preco_presente,
      nome_comprador,
      telefone_comprador,
      email_comprador,
      descricao_presente,
      device_id,
    } = body;

    const precoPresente = Number(preco_presente);

    if (
      !titulo_presente ||
      !preco_presente ||
      !Number.isFinite(precoPresente) ||
      precoPresente <= 0
    ) {
      return jsonResponse({ error: "Titulo e preco do presente sao obrigatorios" }, 400);
    }

    if (!nome_comprador || !email_comprador) {
      return jsonResponse({ error: "Nome e email do comprador sao obrigatorios" }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: pedido, error: pedidoError } = await supabaseAdmin
      .from("pedidos_presentes")
      .insert({
        presente_id,
        titulo_presente,
        preco_presente: precoPresente,
        nome_comprador,
        telefone_comprador: telefone_comprador ?? null,
        email_comprador,
        status: "aguardando_pix",
        metodo_pagamento: "pix",
      })
      .select("id")
      .single();

    if (pedidoError || !pedido?.id) {
      console.error("Erro ao criar pedido Pix:", pedidoError);
      return jsonResponse(
        {
          error: "Erro ao criar pedido de presente",
          details: pedidoError,
        },
        400,
      );
    }

    const { firstName, lastName } = splitName(nome_comprador);

    console.log("[Pix] pedido criado:", { pedidoId: pedido.id });
    console.log("[Pix] device_id recebido:", Boolean(device_id));

    const paymentPayload = {
      transaction_amount: precoPresente,
      description: descricao_presente || titulo_presente,
      payment_method_id: "pix",
      payer: {
        email: email_comprador,
        first_name: firstName,
        last_name: lastName,
        phone: {
          number: telefone_comprador || "",
        },
      },
      external_reference: pedido.id,
      notification_url: `${supabaseUrl}/functions/v1/webhook-mercado-pago?source_news=webhooks`,
    };

    const headers: Record<string, string> = {
      Authorization: `Bearer ${mercadoPagoAccessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": pedido.id,
    };

    if (device_id) {
      headers["X-meli-session-id"] = device_id;
    }

    const mercadoPagoResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers,
      body: JSON.stringify(paymentPayload),
    });

    const data = (await mercadoPagoResponse.json()) as PixPaymentResponse;

    if (!mercadoPagoResponse.ok) {
      const { error: markError } = await supabaseAdmin
        .from("pedidos_presentes")
        .update({
          status: "erro_pix",
          mercado_pago_payment_id: null,
          mercado_pago_pix_qr_code: null,
          mercado_pago_pix_qr_code_base64: null,
          mercado_pago_pix_ticket_url: null,
          pix_expira_em: null,
        })
        .eq("id", pedido.id);

      if (markError) {
        console.error("Erro ao marcar pedido Pix com falha:", {
          pedidoId: pedido.id,
          status: mercadoPagoResponse.status,
          markError,
        });
      }

      console.error("Erro Mercado Pago ao criar Pix:", {
        pedidoId: pedido.id,
        status: mercadoPagoResponse.status,
        details: data,
      });

      return jsonResponse(
        {
          error: "Nao foi possivel gerar o Pix no Mercado Pago",
          pedido_id: pedido.id,
          pedido_status: "erro_pix",
          mercado_pago_status: mercadoPagoResponse.status,
          details: data,
        },
        400,
      );
    }

    const transactionData = data.point_of_interaction?.transaction_data;
    const qrCode = transactionData?.qr_code ?? null;
    const qrCodeBase64 = transactionData?.qr_code_base64 ?? null;
    const ticketUrl = transactionData?.ticket_url ?? null;

    console.log("[Pix] payment_id criado:", { pedidoId: pedido.id, paymentId: data.id });
    console.log("[Pix] qr_code recebido:", Boolean(qrCode));
    console.log("[Pix] qr_code_base64 recebido:", Boolean(qrCodeBase64));
    console.log("[Pix] ticket_url recebido:", Boolean(ticketUrl));

    const { error: updatePedidoError } = await supabaseAdmin
      .from("pedidos_presentes")
      .update({
        mercado_pago_payment_id: String(data.id ?? ""),
        mercado_pago_pix_qr_code: qrCode,
        mercado_pago_pix_qr_code_base64: qrCodeBase64,
        mercado_pago_pix_ticket_url: ticketUrl,
        pix_expira_em: data.date_of_expiration ?? null,
        status: "aguardando_pix",
      })
      .eq("id", pedido.id);

    if (updatePedidoError) {
      console.error("Erro ao atualizar pedido com dados Pix:", {
        pedidoId: pedido.id,
        paymentId: data.id,
        updatePedidoError,
      });

      return jsonResponse(
        {
          error: "Erro ao atualizar pedido com dados Pix",
          details: updatePedidoError,
        },
        400,
      );
    }

    return jsonResponse({
      pedido_id: pedido.id,
      payment_id: String(data.id ?? ""),
      status: data.status ?? "pending",
      qr_code: qrCode,
      qr_code_base64: qrCodeBase64,
      ticket_url: ticketUrl,
    });
  } catch (error) {
    console.error("Erro na Edge Function Pix:", error);

    return jsonResponse(
      {
        error: "Erro interno ao criar pagamento Pix",
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});
