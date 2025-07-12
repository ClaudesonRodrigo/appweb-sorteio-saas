// public/firebase-init.js - Versão Final e Correta

// ✅ CORREÇÃO: Usando a URL completa do CDN do Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

// A sua nova configuração do Firebase para o projeto SaaS
const firebaseConfig = {
    apiKey: "AIzaSyAZUNUQvG-mLePJridVY_r1q9tW0xGRy00",
    authDomain: "appweb-sorteio-saas-3e7c7.firebaseapp.com",
    projectId: "appweb-sorteio-saas-3e7c7",
    storageBucket: "appweb-sorteio-saas-3e7c7.firebasestorage.app",
    messagingSenderId: "969938263965",
    appId: "1:969938263965:web:c605099e5ea9d02239d974",
    measurementId: "G-DL960DSWT4"
};

// ✅ CORREÇÃO: Adicionando 'export' para que outros arquivos possam usar o 'app'.
// Inicializa o Firebase e exporta a instância do 'app'.
export const app = initializeApp(firebaseConfig);
