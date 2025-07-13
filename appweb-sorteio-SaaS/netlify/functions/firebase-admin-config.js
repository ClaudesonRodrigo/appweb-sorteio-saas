// netlify/functions/firebase-admin-config.js

const admin = require('firebase-admin');

// Decodifica a chave de serviço que está em Base64 nas variáveis de ambiente
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8')
);

function initializeFirebaseAdmin() {
  // Evita que o app seja inicializado mais de uma vez
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

// Exporta a função de inicialização e a instância do banco de dados
module.exports = {
  initializeFirebaseAdmin,
  db: admin.firestore(),
};
