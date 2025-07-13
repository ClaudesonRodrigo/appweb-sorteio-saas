// netlify/functions/delete-raffle.js

const { initializeFirebaseAdmin, db } = require('./firebase-admin-config');

exports.handler = async function(event, context) {
    // Garante que apenas requisições POST sejam aceitas
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { raffleId } = JSON.parse(event.body);
        if (!raffleId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'ID da rifa é obrigatório.' }) };
        }

        // Inicializa a conexão de admin com o Firebase
        initializeFirebaseAdmin();

        const raffleRef = db.collection('rifas').doc(raffleId);
        const soldNumbersRef = raffleRef.collection('sold_numbers');

        // Deleta todos os números vendidos em um batch
        const snapshot = await soldNumbersRef.get();
        if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }

        // Deleta o documento principal da rifa
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
