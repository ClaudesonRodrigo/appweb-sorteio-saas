// netlify/functions/create-stripe-payment-session.js - VERSÃO ATUALIZADA

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event) {
  // Agora também pegamos o `payerData` para usar nos metadados
  const { items, raffleId, payerData } = JSON.parse(event.body);

  const siteUrl = process.env.URL || 'http://localhost:8888';

  const lineItems = items.map(item => ({
    price_data: {
      currency: 'brl',
      product_data: {
        name: item.title,
      },
      unit_amount: item.unit_price * 100,
    },
    quantity: item.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      mode: 'payment',
      line_items: lineItems,
      
      // ✅ NOVA SEÇÃO ADICIONADA AQUI ✅
      // Anexamos os dados importantes da nossa rifa a esta sessão da Stripe.
      // A Stripe vai guardar isso para nós.
      metadata: {
        raffle_id: raffleId,
        selected_numbers: JSON.stringify(items.map(item => item.id)), // Guardamos os números como texto
        user_id: payerData.userId,
        user_name: payerData.name,
        user_email: payerData.email,
        user_whatsapp: payerData.whatsapp,
        user_pix: payerData.pix,
        vendor_id: payerData.vendorId || ''
      },

      success_url: `${siteUrl}/rifa.html?id=${raffleId}&pagamento=sucesso&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/rifa.html?id=${raffleId}&pagamento=cancelado`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id, checkoutUrl: session.url }),
    };

  } catch (error) {
    console.error("Erro ao criar sessão na Stripe:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Falha ao comunicar com a Stripe." }),
    };
  }
};
