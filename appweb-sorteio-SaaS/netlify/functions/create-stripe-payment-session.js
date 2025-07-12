// netlify/functions/create-stripe-payment-session.js

// Carrega a chave secreta da Stripe de forma segura das nossas variáveis de ambiente
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event) {
  // Pega os dados dos itens que o frontend vai nos mandar
  const { items, raffleId } = JSON.parse(event.body);

  // Pega a URL do nosso site (ex: https://meusite.netlify.app)
  const siteUrl = process.env.URL || 'http://localhost:8888';

  // Transforma os itens da nossa rifa para o formato que a Stripe entende
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'brl', // Moeda em Reais
      product_data: {
        name: item.title,
      },
      unit_amount: item.unit_price * 100, // O valor precisa ser em centavos!
    },
    quantity: item.quantity,
  }));

  try {
    // Cria uma "Sessão de Checkout" na Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'], // Aceita cartão e boleto
      mode: 'payment',
      line_items: lineItems,
      // URL para onde o cliente volta se o pagamento for um sucesso
      success_url: `${siteUrl}/rifa.html?id=${raffleId}&pagamento=sucesso&session_id={CHECKOUT_SESSION_ID}`,
      // URL para onde o cliente volta se ele cancelar a compra
      cancel_url: `${siteUrl}/rifa.html?id=${raffleId}&pagamento=cancelado`,
    });

    // Retorna a URL da sessão de pagamento para o frontend
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
