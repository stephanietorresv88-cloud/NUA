// SERVICE WORKER DE NOTIFICACIONES — recibe el push y lo muestra, y lleva a
// la URL correcta cuando la tocan. No hace nada más (sin caché offline: no
// es parte de lo que se pidió, y agregarlo sin que se probara es riesgo
// innecesario para una primera versión).

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'NUA', {
      body: data.body ?? '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url ?? '/hoy' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/hoy';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
      for (const cliente of lista) {
        if (cliente.url.includes(self.location.origin)) {
          cliente.focus();
          cliente.navigate(url);
          return;
        }
      }
      return clients.openWindow(url);
    }),
  );
});
