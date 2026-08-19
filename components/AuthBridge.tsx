'use client';

// PUENTE DE SESIÓN — invisible, vive en el layout raíz.
//
// BUG REAL #1 (2026-08-17): el enlace mágico de Supabase redirige con la sesión
// en el FRAGMENTO de la URL (#access_token=...) — eso nunca llega al servidor,
// solo lo puede leer el navegador, y solo si hay un cliente de Supabase ya
// creado en esa página. Se arregló creando el cliente aquí, en el layout raíz,
// para que cualquier pantalla pueda procesarlo.
//
// BUG REAL #2 (2026-08-18, más profundo): crear el cliente NO bastaba. Probado
// directo con Playwright + un enlace generado a propósito: después de aterrizar
// en la página con el hash, ni localStorage ni las cookies tenían NADA de
// Supabase — la detección automática de sesión del cliente de `@supabase/ssr`
// (a diferencia del `@supabase/supabase-js` de toda la vida) NO procesa el
// formato `#access_token=...` del flujo implícito. Solo reacciona a llamadas
// explícitas (`signInWithOtp`, `verifyOtp`, `exchangeCodeForSession`).
// Por eso el código de 6 dígitos SÍ funcionaba (llama `verifyOtp` directo) y el
// enlace del correo NUNCA — y como la plantilla de correo de Supabase (que no
// se puede editar desde aquí, es del dashboard) no incluye el código, solo el
// enlace, el enlace es la ÚNICA vía real. Arreglo: leer el fragmento a mano y
// llamar `setSession()` explícitamente — eso SÍ dispara la persistencia normal
// del cliente (cookies vía @supabase/ssr).
import { useEffect } from 'react';
import { crearClienteNavegador } from '@/lib/supabase/client';

export function AuthBridge() {
  useEffect(() => {
    const supabase = crearClienteNavegador();

    const hash = window.location.hash;
    if (!hash.includes('access_token=')) return;

    const params = new URLSearchParams(hash.slice(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (!access_token || !refresh_token) return;

    supabase.auth.setSession({ access_token, refresh_token }).then(() => {
      // Limpia el token de la URL/historial — no debe quedar visible ni
      // guardado en el historial del navegador.
      const limpia = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', limpia);
    });
  }, []);
  return null;
}
