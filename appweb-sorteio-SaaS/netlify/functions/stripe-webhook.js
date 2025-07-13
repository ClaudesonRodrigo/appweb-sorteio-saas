// netlify/functions/stripe-webhook.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { initializeFirebaseAdmin, db } = require('./firebase-admin-config');

// A "senha" para verificar se a notificação veio mesmo da Stripe.
// Vamos configurar isso na Netlify daqui a pouco.
const endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

exports.handler = async ({ body, headers }) => {
  // Inicializa a conexão de admin com o Firebase
  initializeFirebaseAdmin();
  
  const sig = headers['stripe-signature'];
  let event;

  try {
    // 1. Verifica se a notificação é genuína
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // 2. Verifica se o evento é o que nos interessa: 'checkout.session.completed'
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Checa se o pagamento foi realmente um sucesso
    if (session.payment_status === 'paid') {
      try {
        // 3. Pega os metadados que anexamos na criação da sessão
        const metadata = session.metadata;
        const raffleId = metadata.raffle_id;
        const selectedNumbers = JSON.parse(metadata.selected_numbers);
        
        const playerData = {
            userId: metadata.user_id,
            name: metadata.user_name,
            email: metadata.user_email,
            whatsapp: metadata.user_whatsapp,
            pix: metadata.user_pix,
            vendorId: metadata.vendor_id || null,
            createdAt: new Date()
        };

        // 4. Salva os números no Firestore usando um batch para garantir
        // que ou todos são salvos, ou nenhum é.
        const soldNumbersRef = db.collection('rifas').doc(raffleId).collection('sold_numbers');
        const batch = db.batch();

        selectedNumbers.forEach(number => {
            const docRef = soldNumbersRef.doc(number);
            batch.set(docRef, playerData);
        });

        // Também atualiza o contador de números vendidos na rifa principal
        const raffleRef = db.collection('rifas').doc(raffleId);
        const increment = selectedNumbers.length;
        batch.update(raffleRef, { 
            soldCount: db.FieldValue.increment(increment) 
        });

        await batch.commit();
        console.log(`SUCCESS: Numbers ${selectedNumbers.join(', ')} for raffle ${raffleId} saved successfully.`);

      } catch (dbError) {
        console.error('DATABASE ERROR:', dbError);
        // Se der erro no banco de dados, retornamos um erro 500 para a Stripe tentar de novo.
        return { statusCode: 500, body: JSON.stringify({ error: 'Database error' }) };
      }
    }
  }

  // Se tudo correu bem, retornamos um status 200 para a Stripe.
  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
