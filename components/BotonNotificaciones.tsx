'use client';

// BOTÓN "ACTIVAR NOTIFICACIONES" — vive en Ajustes. Pide el permiso del
// navegador, se suscribe al push, y guarda la suscripción en Supabase vía
// /api/push/subscribe. Solo se muestra con sesión iniciada (sin user_id no
// hay a quién dirigirle un aviso) y donde el navegador lo soporta.
//
// ⚠️ iOS: solo funciona con la app instalada como PWA (Safari → Compartir →
// "Agregar a pantalla de inicio"). En el navegador normal de iPhone no
// aparece — no es un bug de NUA, es una limitación de Apple.

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Bell, BellOff, BellRing } from 'lucide-react';

function base64UrlAUint8Array(base64Url: string): Uint8Array {
  const relleno = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + relleno).replace(/-/g, '+').replace(/_/g, '/');
  const crudo = window.atob(base64);
  return Uint8Array.from([...crudo].map((c) => c.charCodeAt(0)));
}

type Estado = 'desconocido' | 'activando' | 'activadas' | 'bloqueadas' | 'no_soportado';

export function BotonNotificaciones({ userId }: { userId?: string }) {
  const [estado, setEstado] = useState<Estado>('desconocido');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setEstado('no_soportado');
      return;
    }
    if (Notification.permission === 'granted') setEstado('activadas');
    else if (Notification.permission === 'denied') setEstado('bloqueadas');
  }, []);

  const activar = async () => {
    setEstado('activando');
    try {
      const claveVapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!claveVapid) throw new Error('sin configurar');

      const registro = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const existente = await registro.pushManager.getSubscription();
      const suscripcion =
        existente ??
        (await registro.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlAUint8Array(claveVapid) as BufferSource,
        }));

      const json = suscripcion.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      setEstado('activadas');
    } catch {
      setEstado(Notification.permission === 'denied' ? 'bloqueadas' : 'desconocido');
    }
  };

  if (estado === 'no_soportado' || !userId) return null;

  if (estado === 'activadas') {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4">
        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)]">
          <BellRing size={20} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
        </span>
        <p className="text-[length:var(--txt-body)] font-medium">Notificaciones activadas</p>
      </div>
    );
  }

  if (estado === 'bloqueadas') {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4">
        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)]">
          <BellOff size={20} strokeWidth={1.8} color="var(--text-secondary)" aria-hidden="true" />
        </span>
        <p className="text-[length:var(--txt-body)] leading-snug text-[var(--text-secondary)]">
          Notificaciones bloqueadas. Actívalas desde la configuración del sitio en tu navegador.
        </p>
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={activar}
      disabled={estado === 'activando'}
      aria-busy={estado === 'activando'}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] text-[length:var(--txt-body)] font-semibold text-[var(--text-primary)] disabled:opacity-60 [touch-action:manipulation]"
    >
      <Bell size={18} strokeWidth={2} aria-hidden="true" />
      {estado === 'activando' ? 'Activando…' : 'Activar notificaciones'}
    </motion.button>
  );
}
