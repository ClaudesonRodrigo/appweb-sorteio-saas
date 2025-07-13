// netlify/functions/delete-raffle.js - VERSÃO CORRIGIDA

const admin = require('./firebase-admin-config'); // Importa o admin já inicializado
const db = admin.firestore(); // Pega o banco de dados DEPOIS de inicializar

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { raffleId } = JSON.parse(event.body);
        if (!raffleId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'ID da rifa é obrigatório.' }) };
        }

        const raffleRef = db.collection('rifas').doc(raffleId);
        const soldNumbersRef = raffleRef.collection('sold_numbers');

        const snapshot = await soldNumbersRef.get();
        if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }

        await raffleRef.delete();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Rifa ${raffleId} e todos os seus números foram excluídos.` }),
        };

    } catch (error) {
        console.error("Erro ao excluir rifa:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Falha ao excluir a rifa no servidor.' }),
        };
    }
};
