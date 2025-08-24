// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuração do Firebase (usando as mesmas variáveis do projeto)
const firebaseConfig = {
  apiKey: "your-api-key", // Será substituído dinamicamente
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Inicializa Firebase no Service Worker
firebase.initializeApp(firebaseConfig);

// Obtém instância do messaging
const messaging = firebase.messaging();

// Manipula mensagens em background
messaging.onBackgroundMessage((payload) => {
  console.log('Mensagem recebida em background:', payload);
  
  const notificationTitle = payload.notification?.title || 'Conta Vencendo';
  const notificationOptions = {
    body: payload.notification?.body || 'Você tem contas próximas do vencimento',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'bill-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver Contas'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manipula cliques nas notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    // Abre a aplicação
    event.waitUntil(
      clients.openWindow('/')
    );
  }
  // Para 'dismiss' ou clique sem ação, apenas fecha a notificação
});