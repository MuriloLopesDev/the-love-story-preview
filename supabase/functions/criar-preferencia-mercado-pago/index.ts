import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Metodo nao permitido" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const mercadoPagoAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const siteUrl = Deno.env.get("SITE_URL");

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
    } = body;

    if (!titulo_presente || !preco_presente || !nome_comprador) {
      return new Response(
        JSON.stringify({
          error: "Dados obrigatorios ausentes",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
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
        preco_presente: Number(preco_presente),
        nome_comprador,
        telefone_comprador: telefone_comprador ?? null,
        status: "pendente",
      })
      .select("id")
      .single();

    if (pedidoError || !pedido?.id) {
      console.error("Erro ao criar pedido:", pedidoError);

      return new Response(
        JSON.stringify({
          error: "Erro ao criar pedido de presente",
          details: pedidoError,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const preferencePayload: Record<string, unknown> = {
      items: [
        {
          id: presente_id ?? "presente",
          title: titulo_presente,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(preco_presente),
        },
      ],
      payer: {
        name: nome_comprador,
        phone: {
          number: telefone_comprador ?? "",
        },
      },
      external_reference: pedido.id,
    };

    if (siteUrl?.startsWith("https://")) {
      preferencePayload.back_urls = {
        success: `${siteUrl}/pagamento/sucesso`,
        failure: `${siteUrl}/pagamento/falha`,
        pending: `${siteUrl}/pagamento/pendente`,
      };

      preferencePayload.auto_return = "approved";
    } else {
      console.warn(
        "SITE_URL ausente ou nao HTTPS. back_urls e auto_return nao serao enviados.",
      );
    }

    const mercadoPagoResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mercadoPagoAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferencePayload),
      },
    );

    const mercadoPagoData = await mercadoPagoResponse.json();

    if (!mercadoPagoResponse.ok) {
      console.error("Erro Mercado Pago:", mercadoPagoData);

      return new Response(
        JSON.stringify({
          error: "Erro ao criar preferencia no Mercado Pago",
          details: mercadoPagoData,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const mercadoPagoInitPoint =
      mercadoPagoData.init_point ?? mercadoPagoData.sandbox_init_point ?? null;

    const { data: pedidoAtualizado, error: updatePedidoError } = await supabaseAdmin
      .from("pedidos_presentes")
      .update({
        mercado_pago_preference_id: mercadoPagoData.id,
        mercado_pago_init_point: mercadoPagoInitPoint,
      })
      .eq("id", pedido.id)
      .select("id,status,mercado_pago_preference_id,mercado_pago_init_point")
      .single();

    if (
      updatePedidoError ||
      !pedidoAtualizado?.mercado_pago_preference_id ||
      !pedidoAtualizado?.mercado_pago_init_point
    ) {
      console.error("Erro ao atualizar pedido com dados do Mercado Pago:", updatePedidoError);

      return new Response(
        JSON.stringify({
          error: "Erro ao atualizar pedido com dados do Mercado Pago",
          details: updatePedidoError,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        pedido_id: pedido.id,
        preference_id: mercadoPagoData.id,
        init_point: mercadoPagoData.init_point,
        sandbox_init_point: mercadoPagoData.sandbox_init_point,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Erro na Edge Function:", error);

    return new Response(
      JSON.stringify({
        error: "Erro interno ao criar preferencia",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
