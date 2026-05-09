importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBgpysNTW_l6ItKLE0_8zDIf_CEh2PFr7s",
  projectId: "el-prode-argento-f47de",
  messagingSenderId: "157880493733",
  appId: "1:157880493733:web:e6905737b64043753c0f4c",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Prode Mundial 2026';
  const body = payload.notification?.body || '';
  const icon = payload.notification?.icon;
  const image = payload.notification?.image;
  const link = payload.fcmOptions?.link || payload.data?.link;

  self.registration.showNotification(title, {
    body,
    ...(icon ? { icon } : {}),
    ...(image ? { image } : {}),
    data: { link },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link;
  if (!link) return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url === link);
      if (existing) return existing.focus();
      return clients.openWindow(link);
    }),
  );
});
