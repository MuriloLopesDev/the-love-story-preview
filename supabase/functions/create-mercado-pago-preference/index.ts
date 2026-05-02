const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PreferenceRequest = {
  orderId?: string;
  title?: string;
  price?: number;
  buyerName?: string;
  buyerPhone?: string;
};

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "*";
  const headers = {
    ...corsHeaders,
    "Access-Control-Allow-Origin": origin,
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Metodo nao permitido." }), {
      status: 405,
      headers,
    });
  }

  try {
    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Mercado Pago nao configurado." }), {
        status: 500,
        headers,
      });
    }

    const body = (await req.json()) as PreferenceRequest;
    const orderId = body.orderId?.trim();
    const title = body.title?.trim();
    const price = Number(body.price);
    const buyerName = body.buyerName?.trim();

    if (!orderId || !title || !Number.isFinite(price) || price <= 0 || !buyerName) {
      return new Response(JSON.stringify({ error: "Dados obrigatorios ausentes." }), {
        status: 400,
        headers,
      });
    }

    const siteOrigin = origin === "*" ? new URL(req.url).origin : origin;
    const mercadoPagoResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title,
            quantity: 1,
            currency_id: "BRL",
            unit_price: price,
          },
        ],
        external_reference: orderId,
        payer: {
          name: buyerName,
        },
        back_urls: {
          success: `${siteOrigin}/pagamento/sucesso`,
          failure: `${siteOrigin}/pagamento/erro`,
          pending: `${siteOrigin}/pagamento/pendente`,
        },
        auto_return: "approved",
      }),
    });

    const preference = await mercadoPagoResponse.json();

    if (!mercadoPagoResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Nao foi possivel criar a preferencia de pagamento.",
          details: preference,
        }),
        {
          status: mercadoPagoResponse.status,
          headers,
        },
      );
    }

    return new Response(
      JSON.stringify({
        init_point: preference.init_point ?? preference.sandbox_init_point,
        preference_id: preference.id,
      }),
      { headers },
    );
  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({ error: "Erro inesperado ao criar pagamento." }), {
      status: 500,
      headers,
    });
  }
});
